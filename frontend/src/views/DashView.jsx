import "./DashView.css";
import WeightChart from "./WeightChart.jsx";
import { useEffect, useState } from "react";

const getEmbedUrl = (url) => {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

function Dashboard() {
  const userId = localStorage.getItem("userId");

  //const [plans, setPlans] = useState(null);
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [userInput, setUserInput] = useState({});
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [feedbackWeek, setFeedbackWeek] = useState(null);
  const [weightInput, setWeightInput] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState({});
  const [previewPhotos, setPreviewPhotos] = useState({});
  const [photoIndex, setPhotoIndex] = useState({
    front: 0,
    side: 0,
    back: 0,
  });

  // -----------------------------
  // FETCH PLANS + USER DATA
  // -----------------------------
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // 1) Fetch WEEKLY PLAN (not Plan!)
        const resPlans = await fetch(
          `http://localhost:5000/api/weekly-plan/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!resPlans.ok) {
          const text = await resPlans.text();
          console.error("WeeklyPlan fetch failed:", resPlans.status, text);
          setWeeklyPlans([]);
          return;
        }

        const weeklyPlanData = await resPlans.json();

        // WeeklyPlan is ONE object, not an array → wrap it
        setWeeklyPlans([weeklyPlanData]);

        // 2) Fetch user (completedWeeks)
        const resUser = await fetch(
          `http://localhost:5000/auth/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (resUser.ok) {
          const userData = await resUser.json();
          setCompletedWeeks(userData.completedWeeks || []);
        }

        // 3) Fetch weight history
        const resWeight = await fetch("http://localhost:5000/auth/weight", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (resWeight.ok) {
          const data = await resWeight.json();
          setWeightHistory(data.weightHistory || []);
        }

        // 4) Fetch photos
        const resPhotos = await fetch("http://localhost:5000/auth/photos", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (resPhotos.ok) {
          const data = await resPhotos.json();
          setProgressPhotos(data.progressPhotos || {});
        }

        // 5) Auto-open week
        setExpandedWeek(weeklyPlanData.weekNumber);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      }
    };

    fetchData();
  }, [userId]);

  // -----------------------------
  // TOGGLE WEEK
  // -----------------------------
  const toggleWeek = (week) => {
    setExpandedWeek(expandedWeek === week ? null : week);
  };

  // -----------------------------
  // OPEN FEEDBACK MODAL
  // -----------------------------
  const markWeekCompleted = (week) => {
    setFeedbackWeek(week);
  };

  // -----------------------------
  // SEND FEEDBACK + MARK WEEK DONE
  // -----------------------------
  const sendFeedback = async (e) => {
    e.preventDefault();

    const feedback = e.target.feedback.value;

    try {
      // 1) Send feedback email
      const resFeedback = await fetch(
        "http://localhost:5000/api/feedback/send",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            week: feedbackWeek,
            feedback,
          }),
        }
      );

      if (!resFeedback.ok) {
        const text = await resFeedback.text();
        console.error("Feedback send failed:", text);
      }

      // 2) Mark week completed
      const res = await fetch(
        `http://localhost:5000/auth/complete-week/${userId}/${feedbackWeek}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Complete week failed:", text);
        return;
      }

      const data = await res.json();
      setCompletedWeeks(data.completedWeeks);

      // 3) Close modal
      setFeedbackWeek(null);
    } catch (err) {
      console.error("Error sending feedback:", err);
    }
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/auth/weight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ weight: weightInput }),
    });

    if (res.ok) {
      const data = await res.json();
      setWeightHistory(data.weightHistory);
      setWeightInput("");
    }
  };

  const handlePhotoUpload = async (e, position) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhotos((prev) => ({ ...prev, [position]: reader.result }));
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append(position, file);

    const res = await fetch("http://localhost:5000/auth/photos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setProgressPhotos(data.progressPhotos);
    }
  };

  const scrollPhoto = (position, direction) => {
    const photos = progressPhotos[position] || [];
    const current = photoIndex[position];
    const next =
      direction === "left"
        ? Math.max(current - 1, 0)
        : Math.min(current + 1, photos.length - 1);

    setPhotoIndex((prev) => ({ ...prev, [position]: next }));
  };

  const handleInput = (exerciseId, field, value) => {
    setUserInput((prev) => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value,
      },
    }));
  };

  const saveExercise = async (planId, day, ex) => {
    const data = userInput[ex._id];
    if (!data) return;

    await fetch("/api/weekly-plan/update-exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyPlanId: planId,
        day,
        exerciseId: ex._id,
        sets: data.actualSets,
        reps: data.actualReps,
        weight: data.actualWeight,
      }),
    });
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  if (weeklyPlans === null) return <p>Učitavanje...</p>;
  if (weeklyPlans.length === 0) return <p>Nema dostupnih planova.</p>;

  return (
    <div className="dashboard">
      <main className="main-view">
        <h2>Tvoji tjedni planovi</h2>

        {weeklyPlans.map((plan) => {
          const isExpanded = expandedWeek === plan.weekNumber;
          const isCompleted = completedWeeks.includes(plan.weekNumber);

          return (
            <div className="week-block" key={plan._id}>
              <div
                className="week-header"
                onClick={() => toggleWeek(plan.weekNumber)}
              >
                <span>Tjedan {plan.weekNumber}</span>

                {isCompleted ? (
                  <span className="checkmark">✔</span>
                ) : (
                  <span className="arrow">{isExpanded ? "▲" : "▼"}</span>
                )}
              </div>

              {isExpanded && (
                <div className="week-content">
                  {plan.days.map((day, idx) => (
                    <div key={idx} className="day-block">
                      <h3>{day.day}</h3>

                      {day.exercises.map((ex) => (
                        <div className="exercise" key={ex._id}>
                          <h4>{ex.name}</h4>

                          {ex.youtubeLink && (
                            <iframe
                              width="100%"
                              height="200"
                              src={getEmbedUrl(ex.youtubeLink)}
                              title={ex.name}
                              frameBorder="0"
                              allowFullScreen
                            ></iframe>
                          )}

                          <p>
                            <strong>Bilješke trenera:</strong>{" "}
                            {ex.trainerNotes || "—"}
                          </p>

                          <div className="planned">
                            <p>
                              <strong>Planirano:</strong>
                            </p>
                            <p>Serije: {ex.plannedSets}</p>
                            <p>Ponavljanja: {ex.plannedReps}</p>
                            <p>Kilaža: {ex.plannedWeight} kg</p>
                          </div>

                          <div className="actual">
                            <p>
                              <strong>Odradio:</strong>
                            </p>

                            <input
                              type="number"
                              placeholder="Serije"
                              value={userInput[ex._id]?.actualSets || ""}
                              onChange={(e) =>
                                handleInput(
                                  ex._id,
                                  "actualSets",
                                  e.target.value
                                )
                              }
                            />

                            <input
                              type="number"
                              placeholder="Ponavljanja"
                              value={userInput[ex._id]?.actualReps || ""}
                              onChange={(e) =>
                                handleInput(
                                  ex._id,
                                  "actualReps",
                                  e.target.value
                                )
                              }
                            />

                            <input
                              type="number"
                              placeholder="Kilaža"
                              value={userInput[ex._id]?.actualWeight || ""}
                              onChange={(e) =>
                                handleInput(
                                  ex._id,
                                  "actualWeight",
                                  e.target.value
                                )
                              }
                            />

                            <button
                              className="save-btn"
                              onClick={() =>
                                saveExercise(plan._id, day.day, ex)
                              }
                            >
                              Spremi
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {!isCompleted && (
                    <button
                      className="finish-week-btn"
                      onClick={() => markWeekCompleted(plan.weekNumber)}
                    >
                      Tjedan završen
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* FEEDBACK MODAL */}
        {feedbackWeek && (
          <div className="feedback-modal">
            <form onSubmit={sendFeedback}>
              <h3>Povratna informacija za tjedan {feedbackWeek}</h3>

              <textarea
                name="feedback"
                placeholder="Kako je prošao tjedan?"
                required
              />

              <button type="submit">Pošalji</button>
              <button type="button" onClick={() => setFeedbackWeek(null)}>
                Odustani
              </button>
            </form>
          </div>
        )}
      </main>

      <aside className="progress-aside">
        <h3>Praćenje napretka</h3>

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
              console.log("POS:", pos, "PHOTOS:", photos);

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
    </div>
  );
}

export default Dashboard;
