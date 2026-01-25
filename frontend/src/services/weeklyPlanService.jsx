export const fetchWeeklyPlan = async (userId) => {
  const res = await fetch(`http://localhost:5000/api/weekly-plan/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchUserWeeklyPlans = async (userId) => {
  const res = await fetch(`http://localhost:5000/api/weekly-plan/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const saveExercise = async (planId, day, exId, data) => {
  return fetch("http://localhost:5000/api/weekly-plan/update-exercise", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      weeklyPlanId: planId,
      day,
      exerciseId: exId,
      sets: data.actualSets,
      reps: data.actualReps,
      weight: data.actualWeight,
    }),
  });
};
