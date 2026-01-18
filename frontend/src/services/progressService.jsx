export const fetchWeightHistory = async (userId) => {
  const res = await fetch(`http://localhost:5000/auth/weight/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchPhotos = async (userId) => {
  const res = await fetch(`http://localhost:5000/auth/photos/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};
