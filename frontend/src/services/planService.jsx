export const fetchPlanForWeek = async (userId, weekNumber) => {
  return fetch(`http://localhost:5000/api/plans/${userId}/week/${weekNumber}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const savePlanService = async (payload) => {
  const res = await fetch("http://localhost:5000/api/plans", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });

  return res.json();
};

export const assignWeeklyPlan = async (userId, planId) => {
  return fetch("http://localhost:5000/api/weekly-plan/assign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ userId, planId }),
  });
};

export const deletePlanService = async (userId, weekNumber) => {
  return fetch(`http://localhost:5000/api/plans/${userId}/week/${weekNumber}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};
