const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = async (url, options = {}) => {
  const res = await fetch(`${API_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");

    const errors = Array.isArray(data?.errors) ? data.errors : [];

    error.type = (errors.length > 0) && "FIELD";
    error.errors = errors;

    throw error;
  }

  return data;
};
