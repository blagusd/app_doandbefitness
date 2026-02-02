export const fetchUser = async (userId) => {
  const res = await fetch(`http://localhost:5000/auth/user/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch("http://localhost:5000/auth/users", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchUserPlans = async (userId) => {
  const res = await fetch(`http://localhost:5000/api/plans/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const updateUser = async (id, data) => {
  const res = await fetch(`http://localhost:5000/auth/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};
