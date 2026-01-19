import ExerciseDropdown from "./ExerciseDropdown";
import "./ExerciseModal.css";

const ExerciseModal = ({ category, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content uniform-width"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          Zatvori
        </button>
        <ExerciseDropdown category={category} isAdmin={false} />
      </div>
    </div>
  );
};

export default ExerciseModal;
