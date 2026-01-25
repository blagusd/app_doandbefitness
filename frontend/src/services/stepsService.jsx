export const fetchSteps = () =>
  fetch("http://localhost:5000/api/progress/steps", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Greška pri dohvaćanju koraka");
    return res.json();
  });

export const fetchStepsAdmin = async (userId) => {
  const res = await fetch(
    `http://localhost:5000/api/progress/steps/${userId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
  return res.json();
};
