import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import { Button, Center, Container, Group, Loader, MantineProvider, Stack, Text, Title } from '@mantine/core'
import { Car, Clock, ShieldCheck, Phone, ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react'
import type { WashProgram } from './types/types'
import { ProgramSelector } from './components/ProgramSelector'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { BookingModal } from './components/BookingModal'
import { Notifications } from '@mantine/notifications'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './components/AdminLogin'
import { api } from './services/api'


export default function App() {

  const handleSelectProgram = (program: WashProgram) => {
    console.log('Выбрана мойка:', program.title);
  }

  const [view, setView] = useState<'client' | 'admin'>('client');
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedProgram, setSelectedProgram] = useState<WashProgram | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    api.getCurrentUser()
      .then(setUser)
      .catch(console.error)
      .finally(() => setCheckingAuth(false))
  }, []);

  const handleLogout = async () => {
    await api.signOut();
    setUser(null);
    setView('client');
  }

  const handleSelect = (program: WashProgram) => {
    setSelectedProgram(program);
    open();
    handleSelectProgram(program);
  }

  return (
    <MantineProvider defaultColorScheme='dark'>
      <Notifications position='top-right' />

      {checkingAuth ? (
        <div className='min-h-screen bg-[#0f172a]'>
          <Center h='100vh'><Loader size='xl' /></Center>
        </div>
      ) : view === 'admin' ? (
        <div className='min-h-screen bg-[#0f172a] text-slate-200 font-sans'>
          <nav className='border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50'>
            <Container size='xl' className='h-16 flex items-center justify-between'>
              <Group gap='xs' style={{ cursor: 'pointer' }} onClick={() => setView('client')}>
                <Car className='text-blue-500' size={28} />
                <Text fw={800} size='xl' className='tracking-tighter text-white'>
                  PRO<span className='text-blue-500'>WASH</span><span className='text-xs text-slate-500 ml-2'>ADMIN</span>
                </Text>
              </Group>

              <Group gap='sm'>
                <Button variant='light' color='blue' leftSection={<ArrowLeft size={16} />} onClick={() => setView('client')}>
                  На сайт клиента
                </Button>

                {user && (
                  <Button variant='light' color='red' leftSection={<LogOut size={16} />} onClick={handleLogout}>
                    Выйти
                  </Button>
                )}
              </Group>
            </Container>
          </nav>

          {user ? (
            <AdminDashboard />
          ) : (
            <AdminLogin onLoginSuccess={() => api.getCurrentUser().then(setUser)} />
          )}
        </div>
      ) : (
        <div className='min-h-screen bg-[#0f172a] text-slate-200 font-sans'>

          <nav className='border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50'>
            <Container size='lg' className='h-16 flex items-center justify-between'>
              <Group gap='xs'>
                <Car className='text-blue-500' size={28} />
                <Text fw={800} size='xl' className='tracking-tighter text-white'>
                  PRO<span className='text-blue-500'>WASH</span>
                </Text>
              </Group>

              <Group gap='md'>
                <Button variant='light' color={user ? 'green' : 'yellow'} size='sm' leftSection={<LayoutDashboard size={16} />} onClick={() => setView('admin')}>
                  {user ? 'В панель' : 'Админка'}
                </Button>

                <Button variant='subtle' color='gray' leftSection={<Phone size={16} />}>
                +375 (29) 000-00-00
              </Button>
              </Group>
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
                <Text size='sm'>© 2026 PROWASH Service. Все права защищены. г. Минск</Text>
                <Button size='xs' variant='subtle' color='slate' leftSection={<LayoutDashboard size={14} />} onClick={() => setView('admin')}>
                  Панель управление
                </Button>
              </Group>
            </Container>
          </footer>
        </div>
      )}
    </MantineProvider>
  )
}
