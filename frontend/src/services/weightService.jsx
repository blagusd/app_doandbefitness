export const fetchWeightHistory = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/weight`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchWeightHistoryAdmin = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/weight/${userId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
  return res.json();
};

export const saveWeight = async (weight) => {
  return fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/weight`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ weight }),
  });
};
