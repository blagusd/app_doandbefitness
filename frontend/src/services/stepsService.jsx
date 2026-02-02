export const fetchSteps = () =>
  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/progress/steps`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Greška pri dohvaćanju koraka");
    return res.json();
  });

export const fetchStepsAdmin = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/progress/steps/${userId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
  return res.json();
};
