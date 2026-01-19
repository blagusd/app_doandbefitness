import { useState } from "react";
import ExerciseModal from "./ExerciseModal";
import "./UserVideoExerciseAside.css";

const UserVideoExerciseAside = ({ setShowModal, setSelectedCategory }) => {
  const openModal = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  return (
    <aside className="video-aside uniform-width">
      <h3>Dodatan sadržaj</h3>

      <div className="exercise-buttons">
        <button onClick={() => openModal("abs")}>Vježbe za trbuh</button>

        <button onClick={() => openModal("stretching")}>
          Vježbe istezanja
        </button>
      </div>
    </aside>
  );
};

export default UserVideoExerciseAside;
