import { useEffect, useState } from "react";
import type { Booking, WashProgram } from "../types/types";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import { findAvailableBox } from "../utils/bookingUtils";
import { notifications } from "@mantine/notifications";
import { Button, Center, Group, Loader, Modal, ScrollArea, Select, Stack, Text, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { api } from "../services/api";


interface Props {
  opened: boolean;
  onClose: () => void;
  program?: WashProgram | null;
}

export function BookingModal({ opened, onClose, program: initialProgram }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [ programs, setPrograms ] = useState<WashProgram[]>([]);
  const [ selectedProgram, setSelectedProgram ] = useState<WashProgram | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const form = useForm({
    initialValues: {
      clientName: '',
      clientPhone: '',
      carModel: '',
      carNumber: '',
      time: '09:00',
      programId: ''
    },
    validate: {
      clientName: (val) => (val.length < 2 ? 'Введите имя' : null),
      clientPhone: (val) => (val.length < 10 ? 'Введите кореектынй телефон' : null),
      carNumber: (val) => (val.length < 6 ? 'Введите госномер' : null),
      programId: (val) => (!initialProgram && !val ? 'Выберите программу' : null),
    },
  });

  useEffect(() => {
    if (opened) {
      api.getPrograms().then(setPrograms).catch(console.error);
    }
  }, [opened]);

  useEffect(() => {
    if (opened && selectedDate) {
      setLoadingSlots(true);
      api.getBookingsByDate(selectedDate)
        .then(setExistingBookings)
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, opened]);

  const currentProgram = initialProgram || selectedProgram;

  const handleSubmit = async () => {
    if (!currentProgram || !selectedDate) return;

    const [hours, minutes] = form.values.time.split(':').map(Number);
    const startDateTime = dayjs(selectedDate).hour(hours).minute(minutes).second(0).toDate();

    const freeBox = findAvailableBox(startDateTime, currentProgram.duration, existingBookings);

    if (!freeBox) {
      notifications.show({
        title: 'Мест нет',
        message: 'Извините, на это время все 3 бокса заняты. Попробуйте другое время.',
        color: 'red',
      });
      return;
    }

    try {
      await api.createBooking({
        start_time: startDateTime.toISOString(),
        end_time: dayjs(startDateTime).add(currentProgram.duration, 'minute').toISOString(),
        box_number: freeBox as 1 | 2 | 3,
        program_id: currentProgram.id,
        client_name: form.values.clientName,
        client_phone: form.values.clientPhone,
        car_model: form.values.carModel,
        car_number: form.values.carNumber,
        status: 'pending'
      });

      notifications.show({
        title: 'Успешная запись!',
        message: `Ждем вас в боксе № ${freeBox}. Время: ${form.values.time}`,
        color: 'green',
      });
      onClose();
      form.reset();
      setSelectedProgram(null);
    } catch (e) {
      notifications.show({ title: 'Ошибка', message: 'Не удалось сохранить запись в базу', color: 'red' });
    }
  };

  const timeSlots = [];
  for (let h = 9; h < 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  const checkIsTimeSlotDisabled = (timeStr: string) => {
    if (!selectedDate || !currentProgram) return false;
    const [hours, minutes] = timeStr.split(':').map(Number);

    const slotDateTime = dayjs(selectedDate).hour(hours).minute(minutes).second(0).toDate();
    const availableBox = findAvailableBox(slotDateTime, currentProgram.duration, existingBookings);
    return !availableBox;
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>{initialProgram ? `Запись на услугу: ${initialProgram.title}` : 'Создание записи (Администратор)'}</Text>}
      centered
      radius='md'
      size='md'
      styles={{ content: { backgroundColor: '#1e293b' }, header: { backgroundColor: '#1e293b' } }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap='md'>
          {!initialProgram && (
            <Select 
              label='Выберите программу мойки'
              placeholder='Нажмите для выбора'
              required
              data={programs.map(p => ({ value: String(p.id), label: `${p.title} (${p.duration} мин)` }))}
              {...form.getInputProps('programId')}
              onChange={(value) => {
                form.setFieldValue('programId', value || '');
                const prog = programs.find(p => String(p.id) === value);
                setSelectedProgram(prog || null)
              }}
              styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }}
            />
          )}

          <DateInput
            label='Выберите дату'
            value={selectedDate}
            onChange={(val) => {setSelectedDate(val as Date | null);}}
            minDate={new Date()}
            required
            styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }}
          />
          <Text size='sm' fw={500} mb={-10}>Доступное время:</Text>
          {loadingSlots ? <Center h={100}><Loader size='m' /></Center> : (
            <ScrollArea.Autosize mah={150} type='scroll' className='bg-slate-900/50 rounded-md p-2'>
              <div className='grid grid-cols-4 gap-2'>
                {timeSlots.map(t => {
                  const isSelected = form.values.time === t;
                  const isDisabled = checkIsTimeSlotDisabled(t);

                  return (
                    <Button
                      key={t}
                      variant={isSelected ? 'filled' : 'outline'}
                      onClick={() => form.setFieldValue('time', t)}
                      size='compact-xs'
                      color={isSelected ? 'blue' : isDisabled ? 'red' : 'gray'}
                      disabled={isDisabled}
                      style={{ opacity: isDisabled ? 0.25 : 1, textDecoration: isDisabled ? 'line-through' : 'none' }}
                    >
                      {t}
                    </Button>
                  )
                })}
              </div>
            </ScrollArea.Autosize>
          )}

          <TextInput label='Ваше имя' required {...form.getInputProps('clientName')} styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }} />
          <TextInput label='Телефон' placeholder='+375' required {...form.getInputProps('clientPhone')} styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }} />

          <Group grow>
            <TextInput label='Автомобиль' placeholder='Марка / Модель' required {...form.getInputProps('carModel')} styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }} />
            <TextInput label='Госномер' placeholder='0000 AA-7' required {...form.getInputProps('carNumber')} styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }} />
          </Group>

          <Button
            type='submit'
            fullWidth
            mt='xl'
            size='md'
            variant='gradient'
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Подтвердить бронирование
          </Button>

        </Stack>
      </form>
    </Modal>
  )
}