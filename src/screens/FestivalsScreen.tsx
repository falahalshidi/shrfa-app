import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { festivals as defaultFestivals } from '../constants/festivals';
import { colors } from '../constants/colors';
import { getAllFestivals } from '../utils/storage';
import { Festival } from '../constants/festivals';

export default function FestivalsScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [festivals, setFestivals] = useState<Festival[]>(defaultFestivals);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadFestivals();
    }, [])
  );

  const loadFestivals = async () => {
    try {
      const storedFestivals = await getAllFestivals();
      if (storedFestivals.length > 0) {
        setFestivals(storedFestivals);
      } else {
        setFestivals(defaultFestivals);
      }
    } catch (error) {
      console.error('Error loading festivals:', error);
      setFestivals(defaultFestivals);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFestivals();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 30 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color={colors.white} />
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>شرفة</Text>
        <Text style={styles.headerSubtitle}>من الأصالة والتراث - تبدأ الحكاية</Text>
        <View style={styles.headerBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>فعاليات مختارة</Text>
            <Text style={styles.badgeValue}>{festivals.length}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>متوفر اليوم</Text>
            <Text style={styles.badgeValue}>20 تذكرة</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.bannerCard}>
        <View>
          <Text style={styles.bannerText}>اكتشف التفاصيل الكاملة</Text>
          <Text style={styles.bannerSubtext}>
            تعرف على كافة المزايا واشتر جوازك الآن
          </Text>
        </View>
        <Ionicons name="sparkles-outline" size={28} color={colors.secondary} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>تقويم الفعاليات</Text>
          <Text style={styles.sectionSubtitle}>
            استكشف أبرز الفعاليات والمهرجانات في سلطنة عُمان
          </Text>
        </View>

        {festivals.map((festival) => (
          <TouchableOpacity
            key={festival.id}
            style={styles.festivalCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('FestivalDetails' as never, { festival } as never)}
          >
            <LinearGradient
              colors={colors.gradientSecondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.festivalHero}
            >
              <Text style={styles.heroTitle}>{festival.name}</Text>
              <View style={styles.priceChip}>
                <Text style={styles.priceChipText}>{festival.price} بيسة</Text>
              </View>
            </LinearGradient>
            <View style={styles.festivalInfo}>
              <View style={styles.detailsRow}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={styles.detailText}>{festival.location}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.detailText}>
                  {festival.startDate} - {festival.endDate}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={styles.detailText}>{festival.workingHours}</Text>
              </View>
              <Text style={styles.festivalDescription} numberOfLines={2}>
                {festival.description}
              </Text>
              <View style={styles.activitiesRow}>
                {festival.activities.slice(0, 2).map((activity) => (
                  <View key={activity} style={styles.activityPill}>
                    <Text style={styles.activityText}>{activity}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.festivalFooter}>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    navigation.navigate('FestivalDetails' as never, { festival } as never)
                  }
                >
                  <Text style={styles.bookButtonText}>تفاصيل أكثر</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    width: '100%',
    alignItems: 'flex-end',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 25,
  },
  badge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 14,
  },
  badgeLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  badgeValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  bannerCard: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginTop: -40,
    padding: 18,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtext: {
    color: colors.textLight,
    fontSize: 13,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text,
    marginTop: 6,
    textAlign: 'center',
  },
  festivalCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  festivalHero: {
    height: 120,
    padding: 20,
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  priceChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceChipText: {
    color: colors.white,
    fontWeight: '600',
  },
  festivalInfo: {
    padding: 20,
    gap: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: colors.text,
    fontSize: 14,
  },
  festivalDescription: {
    fontSize: 14,
    color: colors.text,
    marginTop: 5,
    lineHeight: 20,
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 5,
  },
  activityPill: {
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activityText: {
    fontSize: 12,
    color: colors.primary,
  },
  festivalFooter: {
    marginTop: 15,
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
