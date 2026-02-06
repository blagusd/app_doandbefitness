const API = `${import.meta.env.VITE_API_BASE_URL}/api/weekly-plan`;

export const fetchUserWeeklyPlans = async (userId) => {
  const res = await fetch(`${API}/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchWeeklyPlanForWeek = async (userId, weekNumber) => {
  try {
    const res = await fetch(`${API}/${userId}/${weekNumber}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    return null;
  }
};

export const saveWeeklyPlan = async (payload) => {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });

  return res.json();
};

export const deleteWeeklyPlan = async (userId, weekNumber) => {
  const res = await fetch(`${API}/${userId}/${weekNumber}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  return res.json();
};

export const saveExercise = async (planId, day, exId, data) => {
  const res = await fetch(`${API}/update-exercise`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      weeklyPlanId: planId,
      day,
      exerciseId: exId,
      sets: data.actualSets,
      reps: data.actualReps,
      weight: data.actualWeight,
    }),
  });

  return res.json();
};
