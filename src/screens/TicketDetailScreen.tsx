import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { Ticket } from '../types';

export default function TicketDetailScreen() {
  const route = useRoute();
  const { ticket } = route.params as { ticket: Ticket };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ticketContainer}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle}>{ticket.festivalName}</Text>
          <View style={styles.ticketNumberContainer}>
            <Text style={styles.ticketNumberLabel}>رقم التذكرة</Text>
            <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
          </View>
        </View>

        <View style={styles.barcodeContainer}>
          <Text style={styles.barcodeLabel}>رمز الباركود</Text>
          <Text style={styles.barcodeValue}>{ticket.barcode}</Text>
        </View>

        <View style={styles.ticketDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>تاريخ الشراء:</Text>
            <Text style={styles.detailValue}>
              {new Date(ticket.purchaseDate).toLocaleDateString('ar-OM', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الكمية:</Text>
            <Text style={styles.detailValue}>{ticket.quantity} تذكرة</Text>
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
  ticketContainer: {
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: colors.lightGray,
    paddingBottom: 20,
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
  barcodeContainer: {
    alignItems: 'center',
    marginVertical: 30,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
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
  },
  detailRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});

