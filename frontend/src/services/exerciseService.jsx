export const fetchExercises = async () => {
  const res = await fetch("http://localhost:5000/api/exercises", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};
export const createExercise = async (exerciseForm) => {
  const res = await fetch("http://localhost:5000/api/exercises", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(exerciseForm),
  });
  return res.json();
};
