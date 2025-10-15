const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => url.searchParams.append(key, String(value)));
  }
  return url.toString();
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, headers, ...rest } = options;
  const url = buildUrl(path, query);
  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const error = new Error(errorBody?.message ?? 'Request failed');
    (error as any).status = response.status;
    (error as any).details = errorBody;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
};
