const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");

    const errors = Array.isArray(data?.errors) ? data.errors : [];

    error.type = errors.length > 0 && "FIELD";
    error.errors = errors;

    throw error;
  }

  return data;
};
