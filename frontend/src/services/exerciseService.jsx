const API = "http://localhost:5000/api/exercises";

export const fetchExercises = async () => {
  const res = await fetch(API, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const createExercise = async (exerciseData) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(exerciseData),
  });

  return res.json();
};
