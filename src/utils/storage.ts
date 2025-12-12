import { supabase } from '../lib/supabase';
import { Tables } from '../types/database';
import { Ticket, Booking } from '../types';
import { Festival } from '../constants/festivals';

const mapTicket = (row: Tables<'tickets'>): Ticket => ({
  id: row.id,
  bookingId: row.booking_id,
  festivalId: row.festival_id,
  festivalName: row.festival_name,
  userId: row.user_id,
  purchaseDate: row.purchase_date,
  quantity: 1,
  totalPrice: row.price_baisa,
  barcode: row.barcode,
  ticketNumber: row.ticket_number,
});

const mapBooking = (row: Tables<'bookings'>): Booking => ({
  id: row.id,
  festivalId: row.festival_id,
  userId: row.user_id,
  quantity: row.quantity,
  totalPrice: row.total_price_baisa,
  purchaseDate: row.purchase_date,
});

const mapFestival = (row: Tables<'festivals'>): Festival => ({
  id: row.id,
  name: row.name,
  description: row.description,
  location: row.location,
  startDate: row.start_date,
  endDate: row.end_date,
  workingHours: row.working_hours,
  activities: row.activities || [],
  price: row.price_baisa,
  image: row.image_url || undefined,
});

export async function saveTicket(ticket: Ticket): Promise<void> {
  try {
    if (!ticket.bookingId) {
      throw new Error('ticket.bookingId is required');
    }
    const { error } = await supabase.from('tickets').insert({
      id: ticket.id,
      booking_id: ticket.bookingId,
      festival_id: ticket.festivalId,
      festival_name: ticket.festivalName,
      user_id: ticket.userId,
      purchase_date: ticket.purchaseDate,
      price_baisa: ticket.totalPrice,
      barcode: ticket.barcode,
      ticket_number: ticket.ticketNumber,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving ticket:', error);
    throw error;
  }
}

export async function saveBooking(booking: Booking): Promise<void> {
  try {
    const { error } = await supabase.from('bookings').insert({
      id: booking.id,
      festival_id: booking.festivalId,
      user_id: booking.userId,
      quantity: booking.quantity,
      total_price_baisa: booking.totalPrice,
      purchase_date: booking.purchaseDate,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
}

export async function getTicketsByUser(userId: string): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapTicket);
  } catch (error) {
    console.error('Error getting tickets:', error);
    return [];
  }
}

export async function getTicketsByFestival(festivalId: string): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('festival_id', festivalId);

    if (error) {
      throw error;
    }

    return (data || []).map(mapTicket);
  } catch (error) {
    console.error('Error getting tickets by festival:', error);
    return [];
  }
}

export async function getDailyBookingCount(userId: string, date: string): Promise<number> {
  try {
    const start = new Date(`${date}T00:00:00.000Z`).toISOString();
    const endDate = new Date(`${date}T00:00:00.000Z`);
    endDate.setDate(endDate.getDate() + 1);
    const end = endDate.toISOString();

    const { data, error } = await supabase
      .from('bookings')
      .select('quantity, purchase_date')
      .eq('user_id', userId)
      .gte('purchase_date', start)
      .lt('purchase_date', end);

    if (error) {
      throw error;
    }

    return (data || []).reduce((sum, row) => sum + (row.quantity || 0), 0);
  } catch (error) {
    console.error('Error getting daily booking count:', error);
    return 0;
  }
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapBooking);
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}

export async function getAllTickets(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapTicket);
  } catch (error) {
    console.error('Error getting all tickets:', error);
    return [];
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('purchase_date', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapBooking);
  } catch (error) {
    console.error('Error getting all bookings:', error);
    return [];
  }
}

export async function getTotalProfit(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('total_price_baisa');

    if (error) {
      throw error;
    }

    return (data || []).reduce((sum, row) => sum + (row.total_price_baisa || 0), 0);
  } catch (error) {
    console.error('Error getting total profit:', error);
    return 0;
  }
}

export async function saveFestival(festival: Festival): Promise<void> {
  try {
    const { error } = await supabase.from('festivals').upsert({
      id: festival.id,
      name: festival.name,
      description: festival.description,
      location: festival.location,
      start_date: festival.startDate,
      end_date: festival.endDate,
      working_hours: festival.workingHours,
      activities: festival.activities,
      price_baisa: festival.price,
      image_url: festival.image || null,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving festival:', error);
    throw error;
  }
}

export async function getAllFestivals(): Promise<Festival[]> {
  try {
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []).map(mapFestival);
  } catch (error) {
    console.error('Error getting festivals:', error);
    return [];
  }
}

export async function deleteFestival(festivalId: string): Promise<void> {
  try {
    const { error } = await supabase.from('festivals').delete().eq('id', festivalId);
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting festival:', error);
    throw error;
  }
}
