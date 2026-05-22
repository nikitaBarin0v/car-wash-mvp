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

  async createBooking(booking: Omit<Booking, 'id'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select();
    if (error) throw error;
    return data;
  }
};