import "./DashView.css";
import { useEffect, useState } from "react";
import UserVideoExerciseAside from "../components/UserVideoExerciseAside";
import UserProgressAside from "../components/UserProgressAside.jsx";
import "../styles/progressAside.css";
import ExerciseModal from "../components/ExerciseModal";

import {
  fetchUserWeeklyPlans,
  fetchWeeklyPlanForWeek,
  saveExercise,
} from "../services/weeklyPlanService";
import { fetchUser } from "../services/userService";
import { fetchWeightHistory, saveWeight } from "../services/weightService";
import { fetchPhotos, uploadPhoto } from "../services/photoService";
import { sendFeedbackEmail, completeWeek } from "../services/feedbackService";
import { fetchSteps } from "../services/stepsService.jsx";
import { fetchExercises } from "../services/exerciseService";

import { getEmbedUrl } from "../utils/youtube";

function Dashboard() {
  const userId = localStorage.getItem("userId");

  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [userInput, setUserInput] = useState({});
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [feedbackWeek, setFeedbackWeek] = useState(null);
  const [exerciseMap, setExerciseMap] = useState({});

  const [weightInput, setWeightInput] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);

  const [progressPhotos, setProgressPhotos] = useState({});
  const [previewPhotos, setPreviewPhotos] = useState({});
  const [photoIndex, setPhotoIndex] = useState({
    front: 0,
    side: 0,
    back: 0,
  });
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showVideoAside, setShowVideoAside] = useState(true);
  const [showProgressAside, setShowProgressAside] = useState(true);

  const [stepsData, setStepsData] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      // 1) Fetch all weekly plans
      const plans = await fetchUserWeeklyPlans(userId);
      setWeeklyPlans(plans);
      setExpandedWeek(plans[plans.length - 1]?.weekNumber || null);

      // 2) Fetch user info
      const user = await fetchUser(userId);
      setCompletedWeeks(user.completedWeeks || []);

      // 3) Fetch weight history
      const weight = await fetchWeightHistory();
      setWeightHistory(weight.weightHistory || []);

      // 4) Fetch progress photos
      const photos = await fetchPhotos();
      setProgressPhotos(photos.progressPhotos || {});

      const exercises = await fetchExercises();
      const map = {};
      exercises.forEach((ex) => (map[ex._id] = ex));
      setExerciseMap(map);
    };

    load();
  }, [userId]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
  }, [showModal]);

  useEffect(() => {
    fetchSteps()
      .then((data) => setStepsData(data))
      .catch((err) => console.error(err));
  }, []);

  const toggleDay = (dayName) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayName]: !prev[dayName],
    }));
  };

  const saveExerciseHandler = async (weeklyPlanId, dayName, exerciseId) => {
    const data = userInput[exerciseId];
    if (!data) return;

    await saveExercise(weeklyPlanId, dayName, exerciseId, data);
  };

  const sendFeedback = async (e) => {
    e.preventDefault();
    const feedback = e.target.feedback.value;

    await sendFeedbackEmail(feedbackWeek, feedback);

    const res = await completeWeek(userId, feedbackWeek);
    const data = await res.json();
    setCompletedWeeks(data.completedWeeks);

    setFeedbackWeek(null);
  };

  const handleWeightSubmit = async (e) => {
    e.preventDefault();

    const res = await saveWeight(weightInput);
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

    const res = await uploadPhoto(formData);
    if (res.ok) {
      const data = await res.json();
      setProgressPhotos(data.progressPhotos);
    }
  };

  const openFullscreen = (pos, index) => {
    setFullscreenPhoto({ pos, index });
  };
  const closeFullscreen = () => {
    setFullscreenPhoto(null);
  };

  const navigateFullscreen = (direction) => {
    if (!fullscreenPhoto) return;
    const photos = progressPhotos[fullscreenPhoto.pos] || [];
    const newIndex =
      direction === "left"
        ? fullscreenPhoto.index - 1
        : fullscreenPhoto.index + 1;
    if (newIndex >= 0 && newIndex < photos.length) {
      setFullscreenPhoto({ ...fullscreenPhoto, index: newIndex });
    }
  };

  const loadSteps = async () => {
    try {
      const data = await fetchSteps();
      setStepsData(data || []);
    } catch (err) {
      console.error("Error loading steps:", err);
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

  if (!weeklyPlans) return <p>Učitavanje...</p>;

  return (
    <>
      <div className="dashboard">
        {/* LEFT ASIDE */}
        <div className="aside-dropdown">
          <div
            className="aside-header"
            onClick={() => setShowVideoAside(!showVideoAside)}
          >
            <h3>Dodatan sadržaj {showVideoAside ? "▲" : "▼"}</h3>
          </div>

          {showVideoAside && (
            <UserVideoExerciseAside
              setShowModal={setShowModal}
              setSelectedCategory={setSelectedCategory}
            />
          )}
        </div>

        {/* MAIN */}
        <main className="main-view">
          <h2>Tvoji tjedni planovi</h2>

          {(weeklyPlans || []).map((plan) => {
            const isExpanded = expandedWeek === plan.weekNumber;
            const isCompleted = completedWeeks.includes(plan.weekNumber);

            return (
              <div className="week-block" key={plan._id}>
                {/* WEEK HEADER */}
                <div
                  className="week-header"
                  onClick={() =>
                    setExpandedWeek(isExpanded ? null : plan.weekNumber)
                  }
                >
                  <span>Tjedan {plan.weekNumber}</span>
                  <span className="arrow">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* WEEK CONTENT */}
                {isExpanded && (
                  <div className="week-content">
                    {(plan.days ?? []).map((day, idx) => {
                      const isDayOpen = expandedDays[day.day];

                      return (
                        <div key={idx} className="day-block">
                          {/* DAY HEADER */}
                          <div
                            className="day-header"
                            onClick={() => toggleDay(day.day)}
                          >
                            <span>{day.day}</span>
                            <span className="arrow">
                              {isDayOpen ? "▲" : "▼"}
                            </span>
                          </div>

                          {/* DAY CONTENT */}
                          {isDayOpen && (
                            <div className="day-content">
                              {day.exercises.map((ex) => {
                                const exercise = exerciseMap[ex.exerciseId];

                                if (!exercise) {
                                  return (
                                    <div key={ex.exerciseId}>
                                      Nepoznata vježba (ID: {ex.exerciseId})
                                    </div>
                                  );
                                }

                                return (
                                  <div className="exercise" key={ex.exerciseId}>
                                    <h4>{exercise.name}</h4>

                                    {exercise.youtubeLink && (
                                      <iframe
                                        width="100%"
                                        height="200"
                                        src={getEmbedUrl(exercise.youtubeLink)}
                                        title={exercise.name}
                                        frameBorder="0"
                                        allowFullScreen
                                      ></iframe>
                                    )}

                                    <p>
                                      <strong>Bilješke trenera:</strong>{" "}
                                      {exercise.notes || "—"}
                                    </p>

                                    {/* PLANIRANO */}
                                    <div className="planned">
                                      <p>
                                        <strong>Planirano:</strong>
                                      </p>
                                      <p>Serije: {exercise.sets ?? "—"}</p>
                                      <p>Ponavljanja: {exercise.reps ?? "—"}</p>
                                      <p>Kilaža: {exercise.weight ?? "—"} kg</p>
                                    </div>

                                    {/* ODRAĐENO */}
                                    <div className="actual">
                                      <p>
                                        <strong>Odrađeno:</strong>
                                      </p>

                                      <input
                                        type="number"
                                        placeholder="Serije"
                                        value={
                                          userInput[ex.exerciseId]
                                            ?.actualSets || ""
                                        }
                                        onChange={(e) =>
                                          setUserInput((prev) => ({
                                            ...prev,
                                            [ex.exerciseId]: {
                                              ...prev[ex.exerciseId],
                                              actualSets: e.target.value,
                                            },
                                          }))
                                        }
                                      />

                                      <input
                                        type="number"
                                        placeholder="Ponavljanja"
                                        value={
                                          userInput[ex.exerciseId]
                                            ?.actualReps || ""
                                        }
                                        onChange={(e) =>
                                          setUserInput((prev) => ({
                                            ...prev,
                                            [ex.exerciseId]: {
                                              ...prev[ex.exerciseId],
                                              actualReps: e.target.value,
                                            },
                                          }))
                                        }
                                      />

                                      <input
                                        type="number"
                                        placeholder="Kilaža"
                                        value={
                                          userInput[ex.exerciseId]
                                            ?.actualWeight || ""
                                        }
                                        onChange={(e) =>
                                          setUserInput((prev) => ({
                                            ...prev,
                                            [ex.exerciseId]: {
                                              ...prev[ex.exerciseId],
                                              actualWeight: e.target.value,
                                            },
                                          }))
                                        }
                                      />

                                      <button
                                        className="save-btn"
                                        onClick={() =>
                                          saveExerciseHandler(
                                            plan._id,
                                            day.day,
                                            ex.exerciseId,
                                          )
                                        }
                                      >
                                        Spremi
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {!isCompleted && (
                      <button
                        className="finish-week-btn"
                        onClick={() => setFeedbackWeek(plan.weekNumber)}
                      >
                        Tjedan završen
                      </button>
                    )}

                    {isCompleted && <span className="checkmark">✔</span>}
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

        {/* RIGHT ASIDE */}
        {!showModal && (
          <div className="aside-dropdown">
            <div
              className="aside-header"
              onClick={() => setShowProgressAside(!showProgressAside)}
            >
              <h3>Praćenje napretka {showProgressAside ? "▲" : "▼"}</h3>
            </div>
            {showProgressAside && (
              <UserProgressAside
                stepsData={stepsData}
                loadSteps={loadSteps}
                weightInput={weightInput}
                setWeightInput={setWeightInput}
                weightHistory={weightHistory}
                handleWeightSubmit={handleWeightSubmit}
                progressPhotos={progressPhotos}
                handlePhotoUpload={handlePhotoUpload}
                scrollPhoto={scrollPhoto}
                photoIndex={photoIndex}
                openFullscreen={openFullscreen}
              />
            )}{" "}
            {/* FULLSCREEN OVERLAY */}{" "}
            {fullscreenPhoto && (
              <div className="fullscreen-overlay" onClick={closeFullscreen}>
                {" "}
                <img
                  src={
                    progressPhotos[fullscreenPhoto.pos][
                      fullscreenPhoto.index
                    ].startsWith("http")
                      ? progressPhotos[fullscreenPhoto.pos][
                          fullscreenPhoto.index
                        ]
                      : `${import.meta.env.VITE_API_BASE_URL}${progressPhotos[fullscreenPhoto.pos][fullscreenPhoto.index]}`
                  }
                  alt="fullscreen"
                  className="fullscreen-image"
                  onClick={(e) => e.stopPropagation()}
                />{" "}
                {/* Left arrow */}{" "}
                {fullscreenPhoto.index > 0 && (
                  <button
                    className="nav-button left"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateFullscreen("left");
                    }}
                  >
                    {" "}
                    ‹{" "}
                  </button>
                )}{" "}
                {/* Right arrow */}{" "}
                {fullscreenPhoto.index <
                  progressPhotos[fullscreenPhoto.pos].length - 1 && (
                  <button
                    className="nav-button right"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateFullscreen("right");
                    }}
                  >
                    {" "}
                    ›{" "}
                  </button>
                )}{" "}
              </div>
            )}{" "}
          </div>
        )}
      </div>

      {showModal && (
        <ExerciseModal
          category={selectedCategory}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default Dashboard;
