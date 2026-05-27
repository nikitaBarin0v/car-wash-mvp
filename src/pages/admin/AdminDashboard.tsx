import { useEffect, useState } from "react";
import type { Booking, WashProgram } from "../../types/types";
import { api } from "../../services/api";
import dayjs from "dayjs";
import { Badge, Card, Center, Container, Group, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Car, Clock, User, Wrench } from "lucide-react";
import { DateInput } from "@mantine/dates";

const MOCK_PROGRAMS: WashProgram[] = [
  { id: 1, title: "Экспресс мойка", duration: 15, price: 15, description: "Быстрая очистка кузова" },
  { id: 2, title: "Комплексная мойка", duration: 30, price: 35, description: "Кузов + салон" },
  { id: 3, title: "Детейлинг кузова", duration: 60, price: 90, description: "Премиум уход и воск" }
];


export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // useEffect(() => {
  //   api.getBookingsByDate(new Date())
  //     .then(setBookings)
  //     .finally(() => setLoading(false));
  // }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const targetDate = dayjs(selectedDate).format('YYYY-MM-DD');

    const mockBookings: Booking[] = [
      {
        id: "1",
        box_number: 1,
        start_time: `${targetDate}T09:00:00Z`,
        end_time: `${targetDate}T09:45:00Z`,
        car_model: "BMW X5",
        car_number: "А777АА-7",
        client_name: "Александр",
        client_phone: "+375 (29) 111-22-33",
        program_id: 2, 
        status: "pending",
        created_at: dayjs().subtract(2, 'hour').toISOString()
      },
      {
        id: "2",
        box_number: 1,
        start_time: `${targetDate}T11:00:00Z`,
        end_time: `${targetDate}T11:30:00Z`,
        car_model: "Audi A6",
        car_number: "7123 ОO-7",
        client_name: "Дмитрий",
        client_phone: "+375 (29) 444-55-66",
        program_id: 1, 
        status: "in_progress",
        created_at: dayjs().subtract(1, 'day').toISOString()
      },
      {
        id: "3",
        box_number: 2,
        start_time: `${targetDate}T14:15:00Z`,
        end_time: `${targetDate}T15:00:00Z`,
        car_model: "Tesla Model Y",
        car_number: "5555 ЕХ-7",
        client_name: "Иван",
        client_phone: "+375 (29) 777-88-99",
        program_id: 3, 
        status: "completed",
        created_at: dayjs().toISOString()
      }
    ];

    setBookings(mockBookings);
  }, [selectedDate]);

  const getBookingsByBox = (boxNum: number) =>
    bookings.filter(b => b.box_number === boxNum)
      .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))

  const getProgramTitle = (idFromBooking: number) => {
    const foundProgram = MOCK_PROGRAMS.find(p => p.id === idFromBooking);
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

  if (loading) return <Center h={400}><Loader size='xl' /></Center>

  return (
    // <Container size='xl' py='xl'>
    //   <Stack gap='xl'>
    //     <Group justify='space-between'>
    //       <Title order={1} className='text-white'>Панель управления</Title>
    //       <Badge size='xl' variant='outline' color='blue'>
    //         Сегодня: {dayjs().format('DD MMMM')}
    //       </Badge>
    //     </Group>

    //     <SimpleGrid cols={{ base: 1, md: 3 }} spacing='lg'>
    //       {[1, 2, 3].map((boxNum) => (
    //         <Stack key={boxNum} gap='md'>
    //           <Card withBorder padding='sm' radius='md' className='bg-blue-600/10 border-blue-500/30'>
    //             <Text fw={800} ta='center' className='text-blue-400'>БОКС № {boxNum}</Text>
    //           </Card>

    //           {getBookingsByBox(boxNum).map((booking) => (
    //             <Card key={booking.id} shadow='sm' padding='md' radius='md' withBorder className='bg-slate-800 border-slate-700'>
    //               <Stack gap='xs'>
    //                 <Group justify='space-between'>
    //                   <Text fw={700} className='text-white'>
    //                     {dayjs(booking.start_time).format('HH:mm')} - {dayjs(booking.end_time).format('HH:mm')}
    //                   </Text>
    //                   <Badge color='green' variant='light'>Активна</Badge>
    //                 </Group>

    //                 <Group gap='xs' className='text-slate-400'>
    //                   <Car size={14} />
    //                   <Text size='sm'>{booking.car_model} ({booking.car_number})</Text>
    //                 </Group>

    //                 <Group gap='xs' className='text-slate-400'>
    //                   <User size={14} />
    //                   <Text size='sm'>Создано: {dayjs(booking.created_at).format('HH:mm')}</Text>
    //                 </Group>

    //               </Stack>
    //             </Card>
    //           ))}

    //           {getBookingsByBox(boxNum).length === 0 && (
    //             <Text ta='center' size='sm' className='text-slate-600 italic py-10'>
    //               Нет записей на сегодня
    //             </Text>
    //           )}
    //         </Stack>
    //       ))}
    //     </SimpleGrid>
    //   </Stack>
    // </Container>
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

        {loading ? (
          <Center h={300}><Loader size='xl' /></Center>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing='lg'>
            {[1, 2, 3].map((boxNum) => (
              <Stack key={boxNum} gap='md'>
                <Card withBorder padding='sm' radius='md' className='bg-blue-600/10 border-blue-500/30'>
                  <Text fw={800} ta='center' className='text-blue-400'>БОКС № {boxNum}</Text>
                </Card>

                {getBookingsByBox(boxNum as any).map((booking) => {
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
                      </Stack>
                    </Card>
                  )
                })}

                {getBookingsByBox(boxNum as any).length === 0 && (
                  <Text ta='center' size='sm' className='text-slate-600 italic py-10'>
                    Нет записей на выбранный день
                  </Text>
                )}
              </Stack>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}