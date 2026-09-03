const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

const GENERIC_ERROR_MESSAGE = 'Algo salió mal. Intenta de nuevo.';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const messages = json?.errors
      ?.map((e: { message?: string }) => e.message)
      .filter(Boolean);
    const message = messages?.length
      ? messages.join(' · ')
      : GENERIC_ERROR_MESSAGE;
    throw new ApiError(message, response.status);
  }

  return (json?.data ?? json) as T;
}
