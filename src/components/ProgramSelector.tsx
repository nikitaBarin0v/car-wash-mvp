import { useEffect, useState } from "react";
import type { WashProgram } from "../types/types";
import { api } from "../services/api";
import { Badge, Button, Card, Center, Group, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { CheckCircle2, Clock } from "lucide-react";


interface Props {
  onSelect: (program: WashProgram) => void;
}

export function ProgramSelector({ onSelect }: Props) {
  const [ programs, setPrograms ] = useState<WashProgram[]>([]);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    api.getPrograms()
      .then(setPrograms)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Center h={300}>
        <Stack align='center' gap='sm'>
          <Loader color='blue' size='lg' variant='dots' />
          <Text className='text-slate-500'>Загрузка услуг...</Text>
        </Stack>
      </Center>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='xl'>
      {programs.map((program) => (
        <Card key={program.id} padding='xl' radius='lg' className='bg-slate-800/40 border border-slate-700 hover:border-blue-500/50 transition-all group'>
          <div className='flex flex-col h-full'>
            <Group justify='space-between' mb='md'>
              <Text fw={800} size='lg' className='text-white uppercase tracking-wider'>
                {program.title}
              </Text>
              <Badge color='blue' variant='light' size='lg' leftSection={<Clock size={14} />}>
                {program.duration} мин
              </Badge>
            </Group>

            <Text size='sm' className='text-slate-400 mb-6 flex-grow'>
              {program.description}
            </Text>

            <div className='space-y-2 mb-8'>
              <div className='flex items-center gap-2 text-xs text-slate-500'>
                <CheckCircle2 size={14} className='text-blue-500' />
                <span>Бережная химия</span>
              </div>
              <div className='flex items-center gap-2 text-xs text-slate-500'>
                <CheckCircle2 size={14} className='text-blue-500' />
                <span>Сушка микрофиброй</span>
              </div>
            </div>

            <Group justify='space-between' className='pt-6 border-t border-slate-700/50'>
              <Stack gap={0}>
                <Text size='xs' className='text-slate-500 uppercase font-bold tracking-tighter'>Цена</Text>
                <Text fw={900} size='26px' className='text-white'>
                  {program.price} <span className='text-sm text-blue-500'>BYN</span>
                </Text>
              </Stack>

              <Button variant='filled' color='blue' size='md' radius='md' className='shadow-lg shadow-blue-500/20' onClick={() => onSelect(program)}>Выбрать</Button>
            </Group>
          </div>
        </Card>
      ))}
    </SimpleGrid>
  )
}
