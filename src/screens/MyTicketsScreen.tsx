import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { getTicketsByUser } from '../utils/storage';
import { Ticket } from '../types';

export default function MyTicketsScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTickets = async () => {
    if (user) {
      const userTickets = await getTicketsByUser(user.id);
      // Group tickets by booking
      const grouped = userTickets.reduce((acc, ticket) => {
        const key = ticket.purchaseDate.split('T')[0];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(ticket);
        return acc;
      }, {} as Record<string, Ticket[]>);

      // Flatten and sort by date
      const sorted = Object.values(grouped)
        .flat()
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
      setTickets(sorted);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTickets();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  if (tickets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>تذاكري</Text>
        </View>
        <ScrollView
          contentContainerStyle={[styles.emptyContainer, { paddingBottom: 100 + insets.bottom }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.emptyText}>لا توجد تذاكر مشتراة</Text>
          <Text style={styles.emptySubtext}>
            قم بشراء تذاكر من صفحة المهرجانات
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تذاكري</Text>
        <View style={styles.logoutButton} />
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tickets.map((ticket) => (
          <TouchableOpacity
            key={ticket.id}
            style={styles.ticketCard}
            onPress={() =>
              navigation.navigate('TicketDetail' as never, { ticket } as never)
            }
          >
            <View style={styles.ticketHeader}>
              <Text style={styles.ticketFestivalName}>{ticket.festivalName}</Text>
              <View style={styles.ticketBadge}>
                <Text style={styles.ticketBadgeText}>تذكرة</Text>
              </View>
            </View>
            <View style={styles.ticketInfo}>
              <Text style={styles.ticketNumber}>
                رقم التذكرة: {ticket.ticketNumber}
              </Text>
              <Text style={styles.ticketDate}>
                تاريخ الشراء: {new Date(ticket.purchaseDate).toLocaleDateString('ar-OM')}
              </Text>
            </View>
            <View style={styles.ticketFooter}>
              <Text style={styles.viewDetailsText}>عرض التفاصيل →</Text>
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    position: 'absolute',
    left: 20,
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  ticketFestivalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  ticketBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ticketBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  ticketInfo: {
    marginBottom: 15,
  },
  ticketNumber: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  ticketDate: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 15,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

