import dayjs from 'dayjs';
import type { Booking } from '../types/types';

export const findAvailableBox = (
  requestedStart: Date,
  durationMinutes: number,
  existingBookings: Booking[]
): number | null => {
  const requestedEnd = dayjs(requestedStart).add(durationMinutes, 'minute');
  const boxes = [1, 2, 3];

  for (const box of boxes) {
    const isOverlapping = existingBookings.some(booking => {
      if (booking.box_number !== box || booking.status === 'cancelled') return false;
      const bStart = dayjs(booking.start_time);
      const bEnd = dayjs(booking.end_time);

      return requestedStart < bEnd.toDate() && requestedEnd.toDate() > bStart.toDate();
    });

    if (!isOverlapping) return box;
  }
  return null;
}