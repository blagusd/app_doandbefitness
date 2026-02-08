export const fetchPhotos = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/users/photos`,
    {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  return res.json();
};

export const fetchPhotosAdmin = async (userId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/users/photos/${userId}`,
    {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  return res.json();
};

export const uploadPhoto = async (formData) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/progress/upload-photo`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    },
  );

  return res.json();
};
