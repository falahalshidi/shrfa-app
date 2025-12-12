import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { Festival } from '../constants/festivals';
import { saveTicket, getDailyBookingCount, saveBooking } from '../utils/storage';
import { generateBarcode, generateTicketNumber } from '../utils/barcode';
import { Ticket, Booking } from '../types';
import { generateUuid } from '../utils/uuid';

export default function FestivalDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { festival } = route.params as { festival: Festival };
  const [quantity, setQuantity] = useState(1);
  const [dailyBooked, setDailyBooked] = useState(0);

  useEffect(() => {
    loadDailyBookings();
  }, []);

  const loadDailyBookings = async () => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const count = await getDailyBookingCount(user.id, today);
      setDailyBooked(count);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentBooked = await getDailyBookingCount(user.id, today);
    const maxAllowed = 20;
    const available = maxAllowed - currentBooked;

    if (quantity > available) {
      Alert.alert(
        'خطأ',
        `يمكنك حجز ${available} تذكرة فقط اليوم. الحد الأقصى 20 تذكرة في اليوم الواحد.`
      );
      return;
    }

    if (quantity < 1) {
      Alert.alert('خطأ', 'يرجى اختيار عدد التذاكر');
      return;
    }

    const totalPrice = festival.price * quantity;
    const tickets: Ticket[] = [];
    const purchaseDate = new Date().toISOString();
    const bookingId = generateUuid();

    // Create individual tickets
    for (let i = 0; i < quantity; i++) {
      const ticket: Ticket = {
        id: generateUuid(),
        bookingId,
        festivalId: festival.id,
        festivalName: festival.name,
        userId: user.id,
        purchaseDate,
        quantity: 1,
        totalPrice: festival.price,
        barcode: generateBarcode(),
        ticketNumber: generateTicketNumber(),
      };
      tickets.push(ticket);
    }

    // Create booking record
    const booking: Booking = {
      id: bookingId,
      festivalId: festival.id,
      userId: user.id,
      quantity,
      totalPrice,
      purchaseDate,
    };
    await saveBooking(booking);
    await Promise.all(tickets.map((ticket) => saveTicket(ticket)));
    await loadDailyBookings();

    Alert.alert(
      'نجح',
      `تم شراء ${quantity} تذكرة بنجاح!`,
      [
        {
          text: 'عرض التذاكر',
          onPress: () => navigation.navigate('MyTickets'),
        },
        { text: 'موافق' },
      ]
    );

    setQuantity(1);
    loadDailyBookings();
  };

  const today = new Date().toISOString().split('T')[0];
  const available = Math.max(0, 20 - dailyBooked);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroTitle}>{festival.name}</Text>
            <Text style={styles.heroSubtitle}>{festival.location}</Text>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagLabel}>السعر</Text>
            <Text style={styles.priceTagValue}>{festival.price} بيسة</Text>
          </View>
        </View>
        <View style={styles.heroMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={18} color={colors.white} />
            <Text style={styles.metaText}>{festival.startDate} - {festival.endDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={18} color={colors.white} />
            <Text style={styles.metaText}>{festival.workingHours}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>تفاصيل المهرجان</Text>
        {[
          { icon: 'map-outline', value: festival.location },
          { icon: 'calendar-outline', value: `${festival.startDate} - ${festival.endDate}` },
          { icon: 'time-outline', value: festival.workingHours },
        ].map((detail) => (
          <View key={detail.value} style={styles.detailRow}>
            <Ionicons name={detail.icon as any} size={20} color={colors.primary} />
            <Text style={styles.detailText}>{detail.value}</Text>
          </View>
        ))}
        <View style={styles.activitiesWrap}>
          {festival.activities.map((activity) => (
            <View key={activity} style={styles.activityPill}>
              <Text style={styles.activityText}>{activity}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.quantitySection}>
        <Text style={styles.sectionTitle}>عدد التذاكر</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityNumber}>{quantity}</Text>
            <Text style={styles.quantityLabel}>تذكرة</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.quantityButton,
              (quantity >= available || quantity >= 20) && styles.quantityButtonDisabled,
            ]}
            onPress={() => setQuantity(Math.min(available, 20, quantity + 1))}
            disabled={quantity >= available || quantity >= 20}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.maxLimit}>
          الحد الأقصى: {available} تذاكر متاحة اليوم (20 تذكرة في اليوم الواحد)
        </Text>
      </View>

      <View style={styles.pricingSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>سعر التذكرة الواحدة:</Text>
          <Text style={styles.priceValue}>{festival.price} بيسة</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>المجموع:</Text>
          <Text style={styles.totalValue}>
            {(festival.price * quantity / 1000).toFixed(3)} ريال
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
        <Text style={styles.purchaseButtonText}>متابعة إلى الحفظ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpButtonText}>💬 مساعدة</Text>
      </TouchableOpacity>
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
    padding: 24,
    borderRadius: 26,
    gap: 18,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    color: colors.white,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  priceTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  priceTagLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  priceTagValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: colors.white,
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: colors.cardBackground,
    margin: 20,
    marginTop: 15,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  activitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  activityPill: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activityText: {
    color: colors.primary,
    fontWeight: '500',
  },
  quantitySection: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quantityButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: colors.lightGray,
  },
  quantityButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityDisplay: {
    marginHorizontal: 30,
    alignItems: 'center',
  },
  quantityNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  quantityLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  maxLimit: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
  pricingSection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: colors.cardBackground,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  priceRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  purchaseButton: {
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  helpButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
  },
  helpButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
