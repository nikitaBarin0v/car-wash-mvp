import { useEffect, useState } from "react";
import type { Booking } from "../../types/types";
import { api } from "../../services/api";
import dayjs from "dayjs";
import { Badge, Card, Center, Container, Group, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Car, User } from "lucide-react";


export default function AdminDashboard() {
  const [ bookings, setBookings ] = useState<Booking[]>([]);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    api.getBookingsByDate(new Date())
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  const getBookingsByBox = (boxNum: number) => 
    bookings.filter(b => b.box_number === boxNum)
      .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))

  if (loading) return <Center h={400}><Loader size='xl' /></Center>

  return (
    <Container size='xl' py='xl'>
      <Stack gap='xl'>
        <Group justify='space-between'>
          <Title order={1} className='text-white'>Панель управления</Title>
          <Badge size='xl' variant='outline' color='blue'>
            Сегодня: {dayjs().format('DD MMMM')}
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing='lg'>
          {[1, 2, 3].map((boxNum) => (
            <Stack key={boxNum} gap='md'>
              <Card withBorder padding='sm' radius='md' className='bg-blue-600/10 border-blue-500/30'>
                <Text fw={800} ta='center' className='text-blue-400'>БОКС № {boxNum}</Text>
              </Card>

              {getBookingsByBox(boxNum).map((booking) => (
                <Card key={booking.id} shadow='sm' padding='md' radius='md' withBorder className='bg-slate-800 border-slate-700'>
                  <Stack gap='xs'>
                    <Group justify='space-between'>
                      <Text fw={700} className='text-white'>
                        {dayjs(booking.start_time).format('HH:mm')} - {dayjs(booking.end_time).format('HH:mm')}
                      </Text>
                      <Badge color='green' variant='light'>Активна</Badge>
                    </Group>

                    <Group gap='xs' className='text-slate-400'>
                      <Car size={14} />
                      <Text size='sm'>{booking.car_model} ({booking.car_number})</Text>
                    </Group>

                    <Group gap='xs' className='text-slate-400'>
                      <User size={14} />
                      <Text size='sm'>Создано: {dayjs(booking.created_at).format('HH:mm')}</Text>
                    </Group>

                  </Stack>
                </Card>
              ))}

              {getBookingsByBox(boxNum).length === 0 && (
                <Text ta='center' size='sm' className='text-slate-600 italic py-10'>
                  Нет записей на сегодня
                </Text>
              )}
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}