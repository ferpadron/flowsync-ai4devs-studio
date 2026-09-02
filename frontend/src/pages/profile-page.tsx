import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { getProfile } from '../lib/auth-api';
import type { User } from '../lib/auth-api';
import { ApiError } from '../lib/api';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

export function ProfilePage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    getProfile(token)
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(async (err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          await logout();
          navigate('/login', { replace: true });
          return;
        }
        setError('No se pudo cargar el perfil. Intenta de nuevo.');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Tu perfil</CardTitle>
          <CardDescription>Datos obtenidos de la cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!user && !error && (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          )}
          {user && (
            <div className="flex flex-col gap-1 text-sm">
              <p>
                <span className="font-medium">Nombre:</span>{' '}
                {user.fullName ?? user.email}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Iniciales:</span> {user.initials}
              </p>
              <p>
                <span className="font-medium">Miembro desde:</span>{' '}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Cerrar sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
