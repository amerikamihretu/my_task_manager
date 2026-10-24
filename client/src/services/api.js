const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  throw new Error("VITE_API_BASE_URL is not defined. Check client/.env.");
}

export function assetUrl(assetPath) {
  return assetPath ? new URL(assetPath, API_BASE).toString() : "";
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: isFormData
      ? options.headers || {}
      : { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.errors = data?.errors;
    throw error;
  }

  return data;
}

export const api = {
  get(path, params) {
    const qs = params
      ? `?${new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== '' && v != null)
          )
        ).toString()}`
      : '';
    return request(`${path}${qs}`);
  },
  post(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
  },
  patch(path, body) {
    return request(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...(body instanceof FormData
        ? { headers: {} }
        : { headers: { "Content-Type": "application/json" } }),
    });
  },
  put(path, body) {
    return request(path, { method: 'PUT', body: JSON.stringify(body) });
  },
  delete(path) {
    return request(path, { method: 'DELETE' });
  },
};