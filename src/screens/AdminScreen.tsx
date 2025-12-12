import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { Festival } from '../constants/festivals';
import {
  getAllFestivals,
  saveFestival,
  deleteFestival,
  getAllTickets,
  getTotalProfit,
} from '../utils/storage';
import { festivals as defaultFestivals } from '../constants/festivals';

export default function AdminScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [showFestivalModal, setShowFestivalModal] = useState(false);
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null);
  const [festivalForm, setFestivalForm] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    workingHours: '',
    activities: '',
    price: '',
  });

  const loadData = async () => {
    try {
      const storedFestivals = await getAllFestivals();
      const allTickets = await getAllTickets();
      const profit = await getTotalProfit();
      
      // If no festivals in storage, save default festivals
      let allFestivals = storedFestivals;
      if (storedFestivals.length === 0) {
        // Save default festivals to storage
        await AsyncStorage.setItem('festivals', JSON.stringify(defaultFestivals));
        allFestivals = defaultFestivals;
      }
      
      setFestivals(allFestivals);
      setTicketsCount(allTickets.length);
      setTotalProfit(profit);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to default festivals on error
      setFestivals(defaultFestivals);
      setTicketsCount(0);
      setTotalProfit(0);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const openAddFestival = () => {
    setEditingFestival(null);
    setFestivalForm({
      name: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      workingHours: '',
      activities: '',
      price: '',
    });
    setShowFestivalModal(true);
  };

  const openEditFestival = (festival: Festival) => {
    setEditingFestival(festival);
    setFestivalForm({
      name: festival.name,
      description: festival.description,
      location: festival.location,
      startDate: festival.startDate,
      endDate: festival.endDate,
      workingHours: festival.workingHours,
      activities: festival.activities.join('، '),
      price: festival.price.toString(),
    });
    setShowFestivalModal(true);
  };

  const handleSaveFestival = async () => {
    if (
      !festivalForm.name ||
      !festivalForm.description ||
      !festivalForm.location ||
      !festivalForm.startDate ||
      !festivalForm.endDate ||
      !festivalForm.workingHours ||
      !festivalForm.price
    ) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const activities = festivalForm.activities
      .split('،')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const festival: Festival = {
      id: editingFestival?.id || Date.now().toString(),
      name: festivalForm.name,
      description: festivalForm.description,
      location: festivalForm.location,
      startDate: festivalForm.startDate,
      endDate: festivalForm.endDate,
      workingHours: festivalForm.workingHours,
      activities: activities.length > 0 ? activities : ['فعاليات متنوعة'],
      price: parseInt(festivalForm.price) || 0,
    };

    try {
      await saveFestival(festival);
      await loadData();
      setShowFestivalModal(false);
      Alert.alert('نجح', editingFestival ? 'تم تحديث المهرجان' : 'تم إضافة المهرجان');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحفظ');
    }
  };

  const handleDeleteFestival = (festivalId: string) => {
    Alert.alert('تأكيد', 'هل أنت متأكد من حذف هذا المهرجان؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFestival(festivalId);
            await loadData();
            Alert.alert('نجح', 'تم حذف المهرجان');
          } catch (error) {
            Alert.alert('خطأ', 'حدث خطأ أثناء الحذف');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>لوحة الإدارة</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>الربح الكلي</Text>
            <Text style={styles.statValue}>
              {(totalProfit / 1000).toFixed(3)} ريال
            </Text>
            <Text style={styles.statSubtext}>{totalProfit} بيسة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>عدد التذاكر</Text>
            <Text style={styles.statValue}>{ticketsCount}</Text>
            <Text style={styles.statSubtext}>تذكرة</Text>
          </View>
        </View>

        {/* Festivals Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>إدارة المهرجانات</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddFestival}
            >
              <Text style={styles.addButtonText}>+ إضافة مهرجان</Text>
            </TouchableOpacity>
          </View>

          {festivals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>لا توجد مهرجانات</Text>
              <Text style={styles.emptySubtext}>اضغط على "إضافة مهرجان" لإضافة مهرجان جديد</Text>
            </View>
          ) : (
            festivals.map((festival) => (
              <View key={festival.id} style={styles.festivalCard}>
                <Text style={styles.festivalName}>{festival.name}</Text>
                <Text style={styles.festivalInfo}>📍 {festival.location}</Text>
                <Text style={styles.festivalInfo}>
                  📅 {festival.startDate} - {festival.endDate}
                </Text>
                <Text style={styles.festivalInfo}>🕐 {festival.workingHours}</Text>
                <Text style={styles.festivalPrice}>
                  {festival.price} بيسة
                </Text>
                <View style={styles.festivalActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditFestival(festival)}
                  >
                    <Text style={styles.editButtonText}>تعديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteFestival(festival.id)}
                  >
                    <Text style={styles.deleteButtonText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Festival Modal */}
      <Modal
        visible={showFestivalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFestivalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingFestival ? 'تعديل المهرجان' : 'إضافة مهرجان جديد'}
            </Text>
            <ScrollView>
              <TextInput
                style={styles.input}
                placeholder="اسم المهرجان"
                value={festivalForm.name}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, name: text })
                }
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="الوصف"
                multiline
                numberOfLines={3}
                value={festivalForm.description}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, description: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="الموقع"
                value={festivalForm.location}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, location: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="تاريخ البداية (YYYY-MM-DD)"
                value={festivalForm.startDate}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, startDate: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="تاريخ النهاية (YYYY-MM-DD)"
                value={festivalForm.endDate}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, endDate: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="ساعات العمل"
                value={festivalForm.workingHours}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, workingHours: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="الأنشطة (مفصولة بـ ،)"
                value={festivalForm.activities}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, activities: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="السعر (بالبيسة)"
                keyboardType="numeric"
                value={festivalForm.price}
                onChangeText={(text) =>
                  setFestivalForm({ ...festivalForm, price: text })
                }
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowFestivalModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveFestival}
              >
                <Text style={styles.saveButtonText}>حفظ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 10,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statSubtext: {
    fontSize: 12,
    color: colors.textLight,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
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
    padding: 15,
  },
  festivalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  festivalInfo: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
    textAlign: 'center',
  },
  festivalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  festivalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.7,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});

