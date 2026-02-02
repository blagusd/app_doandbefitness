import { useState, useEffect } from "react";

const ExerciseForm = ({ category, onSuccess, editingVideo }) => {
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.title);
      setYoutubeUrl(editingVideo.youtubeUrl);
    }
  }, [editingVideo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = { title, youtubeUrl, category };
    const method = editingVideo ? "PUT" : "POST";
    const url = editingVideo
      ? `${import.meta.env.VITE_API_BASE_URL}/exercise-videos/${editingVideo._id}`
      : `${import.meta.env.VITE_API_BASE_URL}/exercise-videos/`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setTitle("");
    setYoutubeUrl("");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Naziv vježbe"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="YouTube link"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        required
      />
      <button type="submit">
        {editingVideo ? "Spremi izmjene" : "Dodaj vježbu"}
      </button>
    </form>
  );
};

export default ExerciseForm;
