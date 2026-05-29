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
  },

  async updateBookingStatus(bookingId: string, newStatus: Booking['status']): Promise<void> {
    console.log('Отправка в Supabase:', { id: bookingId, status: newStatus });
    const { data, error, status, statusText } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', String(bookingId))
      .select();

    if (error) {
      console.error('Критическая ошибка Supabase:', error);
      alert(`Ошибка БД: ${error.message}`);
      throw error;
    }

    console.log("Ответ сервера Supabase. HTTP Статус:", status, statusText);
    console.log("Обновленные данные в базе:", data);

    if (!data || data.length === 0) {
      console.warn("Внимание: Ни одна строка в базе данных не была изменена!");
    }
  },

  subscribeToBookings(onChanges: (payload: any) => void) {
    return supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Получено Realtime изменения из БД:', payload);
          onChanges(payload);
        }
      )
      .subscribe();
  }

};