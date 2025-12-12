import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket, Booking } from '../types';

const TICKETS_KEY = 'tickets';
const BOOKINGS_KEY = 'bookings';
const DAILY_BOOKINGS_KEY = 'daily_bookings';

export async function saveTicket(ticket: Ticket): Promise<void> {
  try {
    const ticketsData = await AsyncStorage.getItem(TICKETS_KEY);
    const tickets = ticketsData ? JSON.parse(ticketsData) : [];
    tickets.push(ticket);
    await AsyncStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  } catch (error) {
    console.error('Error saving ticket:', error);
    throw error;
  }
}

export async function getTicketsByUser(userId: string): Promise<Ticket[]> {
  try {
    const ticketsData = await AsyncStorage.getItem(TICKETS_KEY);
    const tickets = ticketsData ? JSON.parse(ticketsData) : [];
    return tickets.filter((t: Ticket) => t.userId === userId);
  } catch (error) {
    console.error('Error getting tickets:', error);
    return [];
  }
}

export async function getTicketsByFestival(festivalId: string): Promise<Ticket[]> {
  try {
    const ticketsData = await AsyncStorage.getItem(TICKETS_KEY);
    const tickets = ticketsData ? JSON.parse(ticketsData) : [];
    return tickets.filter((t: Ticket) => t.festivalId === festivalId);
  } catch (error) {
    console.error('Error getting tickets:', error);
    return [];
  }
}

export async function getDailyBookingCount(
  userId: string,
  date: string
): Promise<number> {
  try {
    const dailyBookingsData = await AsyncStorage.getItem(DAILY_BOOKINGS_KEY);
    const dailyBookings = dailyBookingsData ? JSON.parse(dailyBookingsData) : {};
    const key = `${userId}_${date}`;
    return dailyBookings[key] || 0;
  } catch (error) {
    console.error('Error getting daily booking count:', error);
    return 0;
  }
}

export async function incrementDailyBooking(
  userId: string,
  date: string,
  count: number
): Promise<void> {
  try {
    const dailyBookingsData = await AsyncStorage.getItem(DAILY_BOOKINGS_KEY);
    const dailyBookings = dailyBookingsData ? JSON.parse(dailyBookingsData) : {};
    const key = `${userId}_${date}`;
    dailyBookings[key] = (dailyBookings[key] || 0) + count;
    await AsyncStorage.setItem(DAILY_BOOKINGS_KEY, JSON.stringify(dailyBookings));
  } catch (error) {
    console.error('Error incrementing daily booking:', error);
    throw error;
  }
}

export async function saveBooking(booking: Booking): Promise<void> {
  try {
    const bookingsData = await AsyncStorage.getItem(BOOKINGS_KEY);
    const bookings = bookingsData ? JSON.parse(bookingsData) : [];
    bookings.push(booking);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  try {
    const bookingsData = await AsyncStorage.getItem(BOOKINGS_KEY);
    const bookings = bookingsData ? JSON.parse(bookingsData) : [];
    return bookings.filter((b: Booking) => b.userId === userId);
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}

