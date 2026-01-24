import WeightChart from "../views/WeightChart";
import StepsChart from "../views/StepsChart";

function AdminProgressAside({
  stepsData,
  weightHistory,
  progressPhotos,
  photoIndex,
  scrollPhoto,
}) {
  return (
    <aside className="progress-aside">
      {" "}
      <h3>Napredak korisnika</h3>
      {/* STEPS */}
      <div className="chart-container">
        <StepsChart data={stepsData} />
      </div>
      <div className="chart-container">
        {" "}
        <WeightChart data={weightHistory} />{" "}
      </div>{" "}
      <div className="photo-upload">
        {" "}
        <h4>Fotografije napretka</h4>{" "}
        <div className="photo-preview">
          {" "}
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
                {" "}
                <strong>
                  {" "}
                  {pos === "front"
                    ? "Sprijeda"
                    : pos === "side"
                      ? "Bočno"
                      : "Straga"}{" "}
                  :{" "}
                </strong>{" "}
                {currentPhotoUrl ? (
                  <div className="photo-scroll">
                    {" "}
                    <button
                      onClick={() => scrollPhoto(pos, "left")}
                      disabled={currentIndex === 0}
                    >
                      {" "}
                      ◀{" "}
                    </button>{" "}
                    <img
                      src={currentPhotoUrl}
                      alt={`${pos}-${currentIndex}`}
                      className="progress-photo"
                    />{" "}
                    <button
                      onClick={() => scrollPhoto(pos, "right")}
                      disabled={currentIndex === photos.length - 1}
                    >
                      {" "}
                      ▶{" "}
                    </button>{" "}
                    <div className="photo-counter">
                      {" "}
                      {currentIndex + 1} / {photos.length}{" "}
                    </div>{" "}
                  </div>
                ) : (
                  <p>Nema spremljenih slika</p>
                )}{" "}
              </div>
            );
          })}{" "}
        </div>{" "}
      </div>{" "}
    </aside>
  );
}
export default AdminProgressAside;
