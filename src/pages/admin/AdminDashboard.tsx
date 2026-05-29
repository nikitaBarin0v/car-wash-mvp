import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import type { Booking, WashProgram } from "../../types/types";
import { api } from "../../services/api";
import dayjs from "dayjs";
import { Badge, Button, Card, Center, Container, Group, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Car, CheckCircle, Clock, Play, User, Wrench, XCircle } from "lucide-react";
import { DateInput } from "@mantine/dates";

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [programs, setPrograms] = useState<WashProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);

    Promise.all([
      api.getPrograms().catch(() => []),
      api.getBookingsByDate(selectedDate)
    ])
      .then(([fetchedPrograms, fetchedBookings]) => {
        if (fetchedPrograms.length > 0) {
          setPrograms(fetchedPrograms);
        }
        setBookings(fetchedBookings);
      })
      .catch((err) => console.error('Ошибка инициализации данных:', err))
      .finally(() => setLoading(false));

  }, [selectedDate]);

  useEffect(() => {
    const subscription = api.subscribeToBookings((payload) => {
      const { eventType, new: newRow, old: oldRow } = payload;

      setBookings((currentBookings) => {
        if (eventType === 'INSERT') {
          const isSameDay = dayjs(newRow.start_time).isSame(selectedDate, 'day');
          if (!isSameDay) return currentBookings;

          if (currentBookings.some(b => b.id === newRow.id)) return currentBookings;
          return [...currentBookings, newRow];
        }

        if (eventType === 'DELETE') {
          return currentBookings.filter(b => b.id !== oldRow.id);
        }
        return currentBookings;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedDate]);

  const handleStatusChange = async (bookingId: string | undefined, newStatus: Booking['status']) => {
    if (!bookingId) return;

    try {
      await api.updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error) {
      console.error("Не удалось обновить статус:", error);
      alert("Ошибка сохранения статуса в базе данных. Проверьте соединение.");
    }
  };

  const getBookingsByBox = (boxNum: number) =>
    bookings.filter(b => b.box_number === boxNum)
      .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)));

  const getProgramTitle = (idFromBooking: number) => {
    const foundProgram = programs.find(p => p.id === idFromBooking);
    return foundProgram ? foundProgram.title : `Программа #${idFromBooking}`;
  };

  const statusConfig = {
    pending: {
      label: 'В ожидании',
      badgeColor: 'yellow',
      bg: 'rgba(234, 179, 8, 0.08)',
      border: 'rgba(234, 179, 8, 0.4)'
    },
    in_progress: {
      label: 'В боксе',
      badgeColor: 'blue',
      bg: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(59, 130, 246, 0.5)'
    },
    completed: {
      label: 'Готово',
      badgeColor: 'green',
      bg: 'rgba(34, 197, 94, 0.08)',
      border: 'rgba(34, 197, 94, 0.4)'
    },
    cancelled: {
      label: 'Отменено',
      badgeColor: 'red',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.4)'
    }
  };

  if (loading) return <Center h={400}><Loader size='xl' /></Center>;

  return (
    <Container size='xl' py='xl'>
      <Stack gap='xl'>
        <Group justify='space-between' align='center'>
          <Stack gap="xs">
            <Title order={1} className='text-white'>Панель управления</Title>
            <Text className="text-slate-400">Мониторинг загрузки боксов (3 бокса)</Text>
          </Stack>

          <DateInput
            value={selectedDate}
            onChange={setSelectedDate}
            label="Выбрать дату"
            placeholder="Выберите день"
            maxDate={dayjs().add(1, 'month').toDate()}
            minDate={dayjs().subtract(1, 'week').toDate()}
            className="w-64"
            styles={{
              input: { backgroundColor: '#1e293b', color: '#fff', borderColor: '#334155' },
              label: { color: '#94a3b8', marginBottom: '4px' }
            }}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing='lg'>
          {[1, 2, 3].map((boxNum) => (
            <Stack key={boxNum} gap='md'>
              <Card withBorder padding='sm' radius='md' className='bg-blue-600/10 border-blue-500/30'>
                <Text fw={800} ta='center' className='text-blue-400'>БОКС № {boxNum}</Text>
              </Card>

              {getBookingsByBox(boxNum).map((booking) => {
                const config = statusConfig[booking.status] || {
                  label: booking.status || 'Нет статуса',
                  badgeColor: 'gray',
                  bg: '#1e293b',
                  border: '#334155'
                };

                return (
                  <Card
                    key={booking.id}
                    shadow='md'
                    padding='md'
                    radius='md'
                    withBorder
                    style={{
                      backgroundColor: `${config.bg} !important`,
                      borderColor: `${config.border} !important`,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Stack gap='xs'>
                      <Group justify='space-between'>
                        <Text fw={700} className='text-white' size="lg">
                          {dayjs(booking.start_time).format('HH:mm')} - {dayjs(booking.end_time).format('HH:mm')}
                        </Text>
                        <Badge color={config.badgeColor} variant='filled'>
                          {config.label}
                        </Badge>
                      </Group>

                      <Group gap='xs' className='text-slate-300' mt="xs">
                        <Car size={16} className="text-blue-400" />
                        <Text size='sm' fw={500}>{booking.car_model} <span className="text-slate-500">[{booking.car_number}]</span></Text>
                      </Group>

                      <Group gap='xs' className='text-slate-300'>
                        <User size={16} className="text-blue-400" />
                        <Text size='sm'>{booking.client_name} ({booking.client_phone})</Text>
                      </Group>

                      <Group gap='xs' className='text-slate-300'>
                        <Wrench size={16} className="text-blue-400" />
                        <Text size='sm' fw={600} className="text-slate-200">{getProgramTitle(booking.program_id)}</Text>
                      </Group>

                      <Group gap='xs' className='text-slate-500 border-t border-slate-700/50 pt-2 mt-2'>
                        <Clock size={12} />
                        <Text size='xs'>Заявка создана: {dayjs(booking.created_at).format('DD.MM в HH:mm')}</Text>
                      </Group>

                      <Group gap='xs' mt='md' grow>
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size='xs'
                              color='blue'
                              variant='light'
                              leftSection={<Play size={14} />}
                              onClick={() => handleStatusChange(booking.id, 'in_progress')}
                            >
                              В бокс
                            </Button>
                            <Button
                              size='xs'
                              color='red'
                              variant='subtle'
                              leftSection={<XCircle size={14} />}
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            >
                              Отмена
                            </Button>
                          </>
                        )}

                        {booking.status === 'in_progress' && (
                          <Button
                            size='xs'
                            color='green'
                            variant='light'
                            leftSection={<CheckCircle size={14} />}
                            onClick={() => handleStatusChange(booking.id, 'completed')}
                          >
                            Завершить
                          </Button>
                        )}
                      </Group>
                    </Stack>
                  </Card>
                );
              })}

              {getBookingsByBox(boxNum).length === 0 && (
                <Text ta='center' size='sm' className='text-slate-600 italic py-10'>
                  Нет записей на выбранный день
                </Text>
              )}
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
