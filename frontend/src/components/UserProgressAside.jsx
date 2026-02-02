import WeightChart from "../views/WeightChart";
import StepsForm from "../components/StepsForm";
import StepsChart from "../views/StepsChart";

function UserProgressAside({
  token,
  stepsData,
  loadSteps,
  weightInput,
  setWeightInput,
  weightHistory,
  handleWeightSubmit,
  progressPhotos,
  handlePhotoUpload,
  scrollPhoto,
  photoIndex,
}) {
  return (
    <aside className="progress-aside uniform-width">
      <h3>Praćenje napretka</h3>

      {/* STEPS */}
      <div className="steps-section">
        <h4>Koraci</h4>

        <StepsForm onSaved={loadSteps} token={token} />

        <div className="chart-container">
          <StepsChart data={stepsData} />
        </div>
      </div>

      {/* WEIGHT */}
      <form onSubmit={handleWeightSubmit} className="weight-form">
        <label>Trenutna kilaža (kg):</label>
        <input
          type="number"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          required
        />
        <button type="submit">Spremi</button>
      </form>

      <div className="chart-container">
        <WeightChart data={weightHistory} />
      </div>

      {/* PHOTOS */}
      <div className="photo-upload">
        <h4>Fotografije napretka</h4>

        <label>Sprijeda:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(e, "front")}
        />

        <label>Bočno:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(e, "side")}
        />

        <label>Straga:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handlePhotoUpload(e, "back")}
        />

        <div className="photo-preview">
          {["front", "side", "back"].map((pos) => {
            const photos = progressPhotos[pos] || [];
            const currentIndex = photoIndex[pos];
            const currentPhoto = photos[currentIndex];
            const currentPhotoUrl = currentPhoto
              ? currentPhoto.startsWith("http")
                ? currentPhoto
                : `http://localhost:5000${currentPhoto}`
              : null;

            return (
              <div key={pos} className="photo-block">
                <strong>
                  {pos === "front"
                    ? "Sprijeda"
                    : pos === "side"
                      ? "Bočno"
                      : "Straga"}
                  :
                </strong>

                {currentPhotoUrl ? (
                  <div className="photo-scroll">
                    <button
                      onClick={() => scrollPhoto(pos, "left")}
                      disabled={currentIndex === 0}
                    >
                      ◀
                    </button>

                    <img
                      src={currentPhotoUrl}
                      alt={`${pos}-${currentIndex}`}
                      className="progress-photo"
                    />

                    <button
                      onClick={() => scrollPhoto(pos, "right")}
                      disabled={currentIndex === photos.length - 1}
                    >
                      ▶
                    </button>

                    <div className="photo-counter">
                      {currentIndex + 1} / {photos.length}
                    </div>
                  </div>
                ) : (
                  <p>Nema spremljenih slika</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default UserProgressAside;
