import { useState } from "react";

import { Button, Card, Container, PasswordInput, Stack, TextInput, Title, Text, Center } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Lock } from "lucide-react";
import { api } from "../services/api";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (value.trim().includes('@') ? null : 'Введите корректный Email с символом @'),
      password: (value) => (value.length < 6 ? 'Пароль должен быть не менее 6 символов' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      await api.signIn(values.email.trim(), values.password);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Ошибка авторизации Supabase:", err);
      setError(err.message || "Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#0f172a' }}>
      <Container size="xs" className="w-full">
        <Card withBorder p="xl" radius="md" className="bg-slate-900/60 border-slate-800 shadow-xl">
          <Stack align="center" gap="xs" mb="lg">
            <Center style={{ width: '48px', height: '48px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%' }}>
              <Lock className="text-blue-500" size={24} />
            </Center>
            <Title order={2} className="text-white text-2xl tracking-tight">Вход в панель</Title>
            <Text size="sm" className="text-slate-500">Только для персонала PROWASH</Text>
          </Stack>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="admin@prowash.by"
                required
                {...form.getInputProps('email')}
                styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }}
              />

              <PasswordInput
                label="Пароль"
                placeholder="••••••"
                required
                {...form.getInputProps('password')}
                styles={{ input: { backgroundColor: '#0f172a', color: 'white' } }}
              />

              {error && (
                <Text size="sm" color="red" ta="center" fw={500} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>
                  {error === "Invalid login credentials" ? "Неверный email или пароль" : error}
                </Text>
              )}

              <Button type="submit" fullWidth loading={loading} mt="md">
                Войти
              </Button>
            </Stack>
          </form>
        </Card>
      </Container>
    </Center>
  );
}
