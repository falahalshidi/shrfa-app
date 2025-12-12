import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { Festival } from '../constants/festivals';
import {
  saveTicket,
  getDailyBookingCount,
  incrementDailyBooking,
  saveBooking,
} from '../utils/storage';
import { generateBarcode, generateTicketNumber } from '../utils/barcode';
import { Ticket, Booking } from '../types';

export default function FestivalDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
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

    // Create individual tickets
    for (let i = 0; i < quantity; i++) {
      const ticket: Ticket = {
        id: `${Date.now()}-${i}`,
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
      await saveTicket(ticket);
    }

    // Create booking record
    const booking: Booking = {
      id: Date.now().toString(),
      festivalId: festival.id,
      userId: user.id,
      quantity,
      totalPrice,
      purchaseDate,
      tickets,
    };
    await saveBooking(booking);

    // Update daily booking count
    await incrementDailyBooking(user.id, today, quantity);

    Alert.alert(
      'نجح',
      `تم شراء ${quantity} تذكرة بنجاح!`,
      [
        {
          text: 'عرض التذاكر',
          onPress: () => navigation.navigate('MyTickets' as never),
        },
        { text: 'موافق' },
      ]
    );

    setQuantity(1);
    loadDailyBookings();
  };

  const today = new Date().toISOString().split('T')[0];
  const available = 20 - dailyBooked;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>تفاصيل المهرجان</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            التاريخ: {festival.startDate} - {festival.endDate}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🕐</Text>
          <Text style={styles.detailText}>ساعات العمل: {festival.workingHours}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText}>الموقع: {festival.location}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🎭</Text>
          <Text style={styles.detailText}>
            الأنشطة: {festival.activities.join('، ')}
          </Text>
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
  detailsCard: {
    backgroundColor: colors.cardBackground,
    margin: 15,
    padding: 20,
    borderRadius: 15,
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
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  quantitySection: {
    margin: 15,
    marginTop: 0,
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
    backgroundColor: colors.secondary,
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
    margin: 15,
    marginTop: 0,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 15,
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
    margin: 15,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpButton: {
    backgroundColor: colors.primary,
    margin: 15,
    marginTop: 0,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  helpButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

