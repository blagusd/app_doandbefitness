export const fetchWeightHistory = async () => {
  const res = await fetch("http://localhost:5000/auth/weight", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const saveWeight = async (weight) => {
  return fetch("http://localhost:5000/auth/weight", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ weight }),
  });
};
