import { useMemo } from "react";
import type { Booking } from "../types/types";
import dayjs from "dayjs";
import { Button, SimpleGrid, Stack, Text } from "@mantine/core";

interface TimeSlotPickerProps {
  selectedDate: Date
  selectedBox: number
  durationMinutes: number
  existingBookings: Booking[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

export function TimeSlotPicker({
  selectedDate,
  selectedBox,
  durationMinutes,
  existingBookings,
  selectedTime,
  onSelectTime
}: TimeSlotPickerProps) {
  const slots = useMemo(() => {
    const generatedSlots = [];
    let current = dayjs(selectedDate).hour(9).minute(0).second(0);
    const end = dayjs(selectedDate).hour(21).minute(0).second(0);

    while (current.isBefore(end)) {
      generatedSlots.push(current.format('HH:mm'));
      current = current.add(30, 'minute');
    }
    return generatedSlots;
  }, [selectedDate]);

  const isSlotOccupied = (timeStr: string) => {
    const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
    const slotStart = dayjs(`${formattedDate}T${timeStr}:00`);
    const slotEnd = slotStart.add(durationMinutes, 'minute');
    const boxBookings = existingBookings.filter(b => b.box_number === selectedBox);

    return boxBookings.some(booking => {
      const bookingStart = dayjs(booking.start_time);
      const bookingEnd = dayjs(booking.end_time);

      return slotStart.isBefore(bookingEnd) && slotEnd.isAfter(bookingStart);
    });
  };

  return (
    <Stack gap='xs'>
      <Text size='sm' fw={500} className='text-slate-400'>Доступное время для Бокса №{selectedBox}:</Text>

      <SimpleGrid cols={{ base: 3, sm: 4, md: 6 }} spacing='xs'>
        {slots.map((time) => {
          const occupied = isSlotOccupied(time);
          const isSelected = selectedTime === time;

          return (
            <Button 
              key={time}
              variant={isSelected ? 'filled' : 'light'}
              color={isSelected ? 'blue' : occupied ? 'red' : 'gray'}
              disabled={occupied}
              onClick={() => onSelectTime(time)}
              styles={{ root: { opacity: occupied ? 0.3 : 1, textDecoration: occupied ? 'line-through' : 'none' } }}
            >
              {time}
            </Button>
          );
        })}
      </SimpleGrid>
    </Stack>
  )
}