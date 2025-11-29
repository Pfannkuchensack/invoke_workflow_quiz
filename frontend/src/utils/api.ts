// API utility that handles base path for deployment under subpath
const BASE_URL = import.meta.env.BASE_URL || '/';
const API_BASE = `${BASE_URL}api`.replace('//', '/');

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
  return fetch(url, options);
}
