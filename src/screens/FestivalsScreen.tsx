import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { festivals as defaultFestivals } from '../constants/festivals';
import { colors } from '../constants/colors';
import { getAllFestivals } from '../utils/storage';
import { Festival } from '../constants/festivals';

export default function FestivalsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [festivals, setFestivals] = useState<Festival[]>(defaultFestivals);

  useFocusEffect(
    React.useCallback(() => {
      loadFestivals();
    }, [])
  );

  const loadFestivals = async () => {
    const storedFestivals = await getAllFestivals();
    if (storedFestivals.length > 0) {
      setFestivals(storedFestivals);
    } else {
      setFestivals(defaultFestivals);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>شرفة</Text>
        <Text style={styles.headerSubtitle}>من الأصالة والتراث - تبدأ الحكاية</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>اكتشف التفاصيل الكاملة</Text>
        <Text style={styles.bannerSubtext}>
          تعرف على كافة المزايا واشتر جوازك الآن
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        <Text style={styles.sectionTitle}>تقويم الفعاليات</Text>
        <Text style={styles.sectionSubtitle}>
          استكشف أبرز الفعاليات والمهرجانات في سلطنة عُمان
        </Text>

        {festivals.map((festival) => (
          <TouchableOpacity
            key={festival.id}
            style={styles.festivalCard}
            onPress={() =>
              navigation.navigate('FestivalDetails' as never, { festival } as never)
            }
          >
            <View style={styles.festivalImagePlaceholder}>
              <Text style={styles.festivalImageText}>{festival.name}</Text>
            </View>
            <View style={styles.festivalInfo}>
              <Text style={styles.festivalName}>{festival.name}</Text>
              <Text style={styles.festivalLocation}>📍 {festival.location}</Text>
              <Text style={styles.festivalDate}>
                📅 {festival.startDate} - {festival.endDate}
              </Text>
              <Text style={styles.festivalTime}>🕐 {festival.workingHours}</Text>
              <Text style={styles.festivalDescription} numberOfLines={2}>
                {festival.description}
              </Text>
              <View style={styles.festivalFooter}>
                <Text style={styles.festivalPrice}>
                  {festival.price} بيسة
                </Text>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    navigation.navigate('FestivalDetails' as never, { festival } as never)
                  }
                >
                  <Text style={styles.bookButtonText}>احجز</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.white,
    marginBottom: 15,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
  },
  banner: {
    backgroundColor: '#FF6B35',
    padding: 15,
    alignItems: 'center',
  },
  bannerText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bannerSubtext: {
    color: colors.white,
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  festivalCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  festivalImagePlaceholder: {
    height: 200,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  festivalImageText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  festivalInfo: {
    padding: 15,
  },
  festivalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  festivalLocation: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
    textAlign: 'center',
  },
  festivalDate: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
    textAlign: 'center',
  },
  festivalTime: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 10,
    textAlign: 'center',
  },
  festivalDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  festivalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  festivalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

