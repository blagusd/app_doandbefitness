export const fetchPhotos = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/photos`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return res.json();
};

export const fetchPhotosAdmin = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/photos/${userId}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    },
  );
  return res.json();
};

export const uploadPhoto = async (formData) => {
  return fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    body: formData,
  });
};
