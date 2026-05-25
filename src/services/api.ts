import { supabase } from "../lib/supabase";
import type { Booking, WashProgram } from "../types/types";


export const api = {
  async getPrograms(): Promise<WashProgram[]> {
    const { data, error } = await supabase
      .from('wash_programs')
      .select('*')
      .order('id');
    if (error) throw error;
    return data || [];
  },

  async getBookingsByDate(date: Date): Promise<Booking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .not('status', 'eq', 'cancelled')

    if (error) {
      console.error('Ошибка загрузки записей:', error);
      return [];
    }
    return data || [];
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select();
    if (error) throw error;
    return data;
  }
};