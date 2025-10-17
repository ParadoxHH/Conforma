const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

let authToken: string | null = null;

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
};

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, base);
  if (query) {
    Object.entries(query)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => url.searchParams.append(key, String(value)));
  }
  return url.toString();
}

async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, headers, skipAuth, ...rest } = options;
  const url = buildUrl(path, query);
  const resolvedHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers ?? {}),
  };

  if (!skipAuth && authToken && !(resolvedHeaders as Record<string, string>).Authorization) {
    (resolvedHeaders as Record<string, string>).Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: resolvedHeaders,
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

export const setAuthToken = (token: string | null) => {\n  authToken = token;\n};\n\nexport const getAuthToken = () => authToken;| null) => {
  authToken = token;
};
