export const fetchPhotos = async () => {
  const res = await fetch("http://localhost:5000/auth/photos", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchPhotosAdmin = async (userId) => {
  const res = await fetch(`http://localhost:5000/auth/photos/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const uploadPhoto = async (formData) => {
  return fetch("http://localhost:5000/auth/photos", {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });
};
