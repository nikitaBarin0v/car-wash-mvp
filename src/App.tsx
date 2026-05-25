import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import { Button, Container, Group, MantineProvider, Notification, Stack, Text, Title } from '@mantine/core'
import { Car, Clock, ShieldCheck, Phone } from 'lucide-react'
import type { WashProgram } from './types/types'
import { ProgramSelector } from './components/ProgramSelector'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import { BookingModal } from './components/BookingModal'
import { Notifications } from '@mantine/notifications'

export default function App() {

  const handleSelectProgram = (program: WashProgram) => {
    console.log('Выбрана мойка:', program.title);
  }

  const [ opened, { open, close } ] = useDisclosure(false);
  const [ selectedProgram, setSelectedProgram ] = useState<WashProgram | null>(null);

  const handleSelect = (program: WashProgram) => {
    setSelectedProgram(program);
    open();
    handleSelectProgram(program);
  }

  return (
    <MantineProvider defaultColorScheme='dark'>
      <Notifications position='top-right' />

      <div className='min-h-screen bg-[#0f172a] text-slate-200 font-sans'>

        <nav className='border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50'>
          <Container size='lg' className='h-16 flex items-center justify-between'>
            <Group gap='xs'>
              <Car className='text-blue-500' size={28} />
              <Text fw={800} size='xl' className='tracking-tighter text-white'>
                PRO<span className='text-blue-500'>WASH</span>
              </Text>
            </Group>
            <Button variant='subtle' color='gray' leftSection={<Phone size={16} />}>
              +375 (29) 000-00-00 
            </Button>
          </Container>
        </nav>

        <header className='py-20 bg-gradient-to-b from-slate-900/80 to-transparent'>
          <Container size='lg'>
            <Stack align='center' gap='md' className='text-center'>
              <Title className='text-5xl md:text-7xl font-black text-white tracking-light'>
                Блестящий результат <br />
                <span className='text-blue-500'>за 15 минут</span>
              </Title>
              <Text size='xl' className='text-slate-400 max-w-2xl mx-auto'>
                Запишитесь на профессиональную мойку онлайн. 
                Три современных бокса и лучшие мастера в вашем городе.
              </Text>

              <Group mt='xl'>
                <div className='flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700'>
                  <Clock size={18} className='text-blue-500' />
                  <Text size='sm' fw={500}>Работаем 09:00 - 21:00</Text>
                </div>
                <div className='flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700'>
                  <ShieldCheck size={18} className='text-blue-500' />
                  <Text size='sm' fw={500}>3 свободных бокса</Text>
                </div>
              </Group>
            </Stack>
          </Container>
        </header>

        <main className='py-12'>
          <Container size='lg'>
            <Group justify='space-between' mb='xl' align='end'>
              <Stack gap={4}>
                <Title order={2} className='text-white text-3xl'>Выберите программу</Title>
                <Text className='text-slate-500'>Все пакеты включают базовую очистку кузова</Text>
              </Stack>
            </Group>

            <ProgramSelector onSelect={handleSelect} />
            <BookingModal opened={opened} onClose={close} program={selectedProgram} />
          </Container>
        </main>

        <footer className='border-t border-slate-800 mt-20 py-10 bg-slate-900/30'>
          <Container size='lg'>
            <Group justify='space-between' className='text-slate-500'>
              <Text size='sm'>© 2026 PROWASH Service. Все права защищены.</Text>
              <Group gap='xs'>
                <Text size='sm'>г. Минск</Text>
              </Group>
            </Group>
          </Container>
        </footer>
      </div>
    </MantineProvider>
  )
}
