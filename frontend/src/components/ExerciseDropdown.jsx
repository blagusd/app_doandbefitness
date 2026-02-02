import { useEffect, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import ExerciseForm from "./ExerciseForm";
import "./ExerciseDropdown.css";

const ExerciseDropdown = ({ category, isAdmin }) => {
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState("");
  const [editingVideo, setEditingVideo] = useState(null);

  const fetchVideos = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/exercise-videos/${category}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    setVideos(data);
  };

  useEffect(() => {
    fetchVideos();
  }, [category]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/exercise-videos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchVideos();
  };

  const titleMap = {
    abs: "Vježbe za trbuh",
    stretching: "Vježbe istezanja",
  };

  return (
    <div className="exercise-container uniform-width">
      <h2>{titleMap[category]}</h2>

      <select
        className="exercise-select"
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Odaberi vježbu</option>
        {videos.map((v) => (
          <option key={v._id} value={v.youtubeUrl}>
            {v.title}
          </option>
        ))}
      </select>

      {selected && (
        <div className="video-wrapper">
          <VideoPlayer url={selected} />
        </div>
      )}

      {isAdmin && (
        <>
          <ExerciseForm
            category={category}
            onSuccess={fetchVideos}
            editingVideo={editingVideo}
          />
          <ul>
            {videos.map((v) => (
              <li key={v._id}>
                {v.title}
                <button onClick={() => setEditingVideo(v)}>Uredi</button>
                <button onClick={() => handleDelete(v._id)}>Obriši</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ExerciseDropdown;
