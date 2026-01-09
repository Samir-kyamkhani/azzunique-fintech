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

  console.log("API RESPONSE:", data);

  // ❌ ERROR RESPONSE
  if (!res.ok) {
    const error = new Error(data?.message || "Something went wrong");

    // attach useful info
    error.status = res.status;
    error.errors = data?.errors || [];
    error.data = data;

    throw error;
  }

  // ✅ SUCCESS
  return data;
};
