import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ticket, Booking } from '../types';
import { Festival } from '../constants/festivals';

const TICKETS_KEY = 'tickets';
const BOOKINGS_KEY = 'bookings';
const DAILY_BOOKINGS_KEY = 'daily_bookings';
const PROFIT_KEY = 'total_profit';
const FESTIVALS_KEY = 'festivals';

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

export async function getAllTickets(): Promise<Ticket[]> {
  try {
    const ticketsData = await AsyncStorage.getItem(TICKETS_KEY);
    return ticketsData ? JSON.parse(ticketsData) : [];
  } catch (error) {
    console.error('Error getting all tickets:', error);
    return [];
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const bookingsData = await AsyncStorage.getItem(BOOKINGS_KEY);
    return bookingsData ? JSON.parse(bookingsData) : [];
  } catch (error) {
    console.error('Error getting all bookings:', error);
    return [];
  }
}

export async function addProfit(amount: number): Promise<void> {
  try {
    const currentProfit = await getTotalProfit();
    const newProfit = currentProfit + amount;
    await AsyncStorage.setItem(PROFIT_KEY, JSON.stringify(newProfit));
  } catch (error) {
    console.error('Error adding profit:', error);
    throw error;
  }
}

export async function getTotalProfit(): Promise<number> {
  try {
    // Always calculate profit from existing tickets to ensure accuracy
    const allTickets = await getAllTickets();
    
    // Calculate profit by summing all ticket prices
    const calculatedProfit = allTickets.reduce((sum, ticket) => {
      // Ensure totalPrice exists and is a valid number
      const price = ticket.totalPrice || 0;
      return sum + (typeof price === 'number' ? price : 0);
    }, 0);
    
    // Always update stored profit to match calculated value
    await AsyncStorage.setItem(PROFIT_KEY, JSON.stringify(calculatedProfit));
    
    return calculatedProfit;
  } catch (error) {
    console.error('Error getting total profit:', error);
    return 0;
  }
}

export async function saveFestival(festival: Festival): Promise<void> {
  try {
    const festivalsData = await AsyncStorage.getItem(FESTIVALS_KEY);
    const festivals = festivalsData ? JSON.parse(festivalsData) : [];
    const existingIndex = festivals.findIndex((f: Festival) => f.id === festival.id);
    
    if (existingIndex >= 0) {
      festivals[existingIndex] = festival;
    } else {
      festivals.push(festival);
    }
    
    await AsyncStorage.setItem(FESTIVALS_KEY, JSON.stringify(festivals));
  } catch (error) {
    console.error('Error saving festival:', error);
    throw error;
  }
}

export async function getAllFestivals(): Promise<Festival[]> {
  try {
    const festivalsData = await AsyncStorage.getItem(FESTIVALS_KEY);
    return festivalsData ? JSON.parse(festivalsData) : [];
  } catch (error) {
    console.error('Error getting festivals:', error);
    return [];
  }
}

export async function deleteFestival(festivalId: string): Promise<void> {
  try {
    const festivalsData = await AsyncStorage.getItem(FESTIVALS_KEY);
    const festivals = festivalsData ? JSON.parse(festivalsData) : [];
    const filtered = festivals.filter((f: Festival) => f.id !== festivalId);
    await AsyncStorage.setItem(FESTIVALS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting festival:', error);
    throw error;
  }
}

