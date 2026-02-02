export const fetchUser = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/user/${userId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchUserPlans = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/plans/${userId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
  return res.json();
};

export const updateUser = async (id, data) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};
