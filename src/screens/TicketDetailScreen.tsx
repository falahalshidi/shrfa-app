import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../constants/colors';
import { Ticket } from '../types';

export default function TicketDetailScreen() {
  const route = useRoute();
  const { ticket } = route.params as { ticket: Ticket };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={colors.gradientSecondary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>{ticket.festivalName}</Text>
        <Text style={styles.heroSubtitle}>تأكيد الحجز</Text>
      </LinearGradient>

      <View style={styles.ticketContainer}>
        <View style={styles.ticketHeader}>
          <View>
            <Text style={styles.ticketNumberLabel}>رقم التذكرة</Text>
            <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="ticket-outline" size={18} color={colors.primary} />
            <Text style={styles.badgeText}>نشطة</Text>
          </View>
        </View>

        <View style={styles.barcodeContainer}>
          <Text style={styles.barcodeLabel}>رمز QR</Text>
          <View style={styles.barcodeWrapper}>
            <QRCode value={ticket.barcode} size={160} backgroundColor="transparent" />
          </View>
          <Text style={styles.barcodeValue}>{ticket.barcode}</Text>
        </View>

        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>تاريخ الشراء</Text>
            <Text style={styles.detailValue}>
              {new Date(ticket.purchaseDate).toLocaleDateString('ar-OM', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الكمية</Text>
            <Text style={styles.detailValue}>{ticket.quantity} تذكرة</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>المجموع</Text>
            <Text style={styles.detailValue}>{(ticket.totalPrice / 1000).toFixed(3)} ريال</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            يرجى إحضار هذه التذكرة عند الدخول إلى المهرجان
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    margin: 20,
    marginBottom: 0,
    borderRadius: 24,
    padding: 24,
    gap: 6,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  ticketContainer: {
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  ticketNumberContainer: {
    alignItems: 'center',
  },
  ticketNumberLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
  },
  ticketNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  barcodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  barcodeWrapper: {
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 10,
  },
  barcodeLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 10,
  },
  barcodeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  ticketDetails: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});
