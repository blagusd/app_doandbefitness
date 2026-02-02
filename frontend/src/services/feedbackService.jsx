export const sendFeedbackEmail = async (week, feedback) => {
  return fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/feedback/send-feedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ week, feedback }),
    },
  );
};

export const completeWeek = async (userId, week) => {
  return fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/complete-week/${userId}/${week}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
};
