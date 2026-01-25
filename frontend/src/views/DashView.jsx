import "./DashView.css";
import { useEffect, useState } from "react";
import UserVideoExerciseAside from "../components/UserVideoExerciseAside";
import UserProgressAside from "../components/UserProgressAside.jsx";
import "../styles/progressAside.css";
import ExerciseModal from "../components/ExerciseModal";

// SERVICES
import { fetchWeeklyPlan, saveExercise } from "../services/weeklyPlanService";
import { fetchUser } from "../services/userService";
import { fetchWeightHistory, saveWeight } from "../services/weightService";
import { fetchPhotos, uploadPhoto } from "../services/photoService";
import { sendFeedbackEmail, completeWeek } from "../services/feedbackService";
import { fetchSteps } from "../services/stepsService.jsx";

// UTILS
import { getEmbedUrl } from "../utils/youtube";
import { toggleDayState } from "../utils/dayUtils.jsx";

function Dashboard() {
  const userId = localStorage.getItem("userId");

  // STATE
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [userInput, setUserInput] = useState({});
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
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
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showVideoAside, setShowVideoAside] = useState(true);
  const [showProgressAside, setShowProgressAside] = useState(true);
  const [stepsData, setStepsData] = useState([]);

  // -----------------------------
  // FETCH ALL USER DATA
  // -----------------------------
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      const plans = await fetchWeeklyPlan(userId);
      setWeeklyPlans(plans);
      setExpandedWeek(plans[0]?.weekNumber || null);

      const user = await fetchUser(userId);
      setCompletedWeeks(user.completedWeeks || []);

      const weight = await fetchWeightHistory();
      setWeightHistory(weight.weightHistory || []);

      const photos = await fetchPhotos();
      setProgressPhotos(photos.progressPhotos || {});
    };

    load();
  }, [userId]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
  }, [showModal]);

  useEffect(() => {
    loadSteps();
  }, []);

  // -----------------------------
  // DAY TOGGLE
  // -----------------------------
  const toggleDay = (dayName) => {
    setExpandedDays((prev) => toggleDayState(prev, dayName));
  };

  // -----------------------------
  // SAVE EXERCISE
  // -----------------------------
  const saveExerciseHandler = async (weeklyPlanId, dayName, exercise) => {
    const data = userInput[exercise._id];
    if (!data) return;

    await saveExercise(weeklyPlanId, dayName, exercise._id, data);
  };

  // -----------------------------
  // FEEDBACK + COMPLETE WEEK
  // -----------------------------
  const sendFeedback = async (e) => {
    e.preventDefault();
    const feedback = e.target.feedback.value;

    await sendFeedbackEmail(feedbackWeek, feedback);

    const res = await completeWeek(userId, feedbackWeek);
    const data = await res.json();
    setCompletedWeeks(data.completedWeeks);

    setFeedbackWeek(null);
  };

  // -----------------------------
  // WEIGHT SUBMIT
  // -----------------------------
  const handleWeightSubmit = async (e) => {
    e.preventDefault();

    const res = await saveWeight(weightInput);
    if (res.ok) {
      const data = await res.json();
      setWeightHistory(data.weightHistory);
      setWeightInput("");
    }
  };

  // -----------------------------
  // PHOTO UPLOAD
  // -----------------------------
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

  const scrollPhoto = (position, direction) => {
    const photos = progressPhotos[position] || [];
    const current = photoIndex[position];
    const next =
      direction === "left"
        ? Math.max(current - 1, 0)
        : Math.min(current + 1, photos.length - 1);

    setPhotoIndex((prev) => ({ ...prev, [position]: next }));
  };

  const loadSteps = () =>
    fetchSteps()
      .then((data) => setStepsData(data))
      .catch((err) => console.error(err));

  // -----------------------------
  // RENDER
  // -----------------------------
  if (weeklyPlans === null) return <p>Učitavanje...</p>;
  //if (weeklyPlans.length === 0) return <p>Nema dostupnih planova.</p>;

  return (
    <>
      <div className="dashboard">
        <div className="aside-dropdown">
          <div
            className="aside-header"
            onClick={() => setShowVideoAside(!showVideoAside)}
          >
            <h3>Dodatan sadržaj {showVideoAside ? "▲" : "▼"}</h3>
          </div>{" "}
          {showVideoAside && (
            <UserVideoExerciseAside
              setShowModal={setShowModal}
              setSelectedCategory={setSelectedCategory}
            />
          )}{" "}
        </div>

        <main className="main-view">
          <h2>Tvoji tjedni planovi</h2>
          {console.log("weeklyPlans:", weeklyPlans)}
          {weeklyPlans.map((plan) => {
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
                {/* WEEK CONTENT */}{" "}
                {isExpanded && (
                  <div className="week-content">
                    {" "}
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
                              {day.exercises.map((ex) => (
                                <div className="exercise" key={ex._id}>
                                  <h4>{ex.name}</h4>
                                  {console.log(ex.youtubeLink)}
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
                                      <strong>Odrađeno:</strong>
                                    </p>

                                    <input
                                      type="number"
                                      placeholder="Serije"
                                      value={
                                        userInput[ex._id]?.actualSets || ""
                                      }
                                      onChange={(e) =>
                                        setUserInput((prev) => ({
                                          ...prev,
                                          [ex._id]: {
                                            ...prev[ex._id],
                                            actualSets: e.target.value,
                                          },
                                        }))
                                      }
                                    />

                                    <input
                                      type="number"
                                      placeholder="Ponavljanja"
                                      value={
                                        userInput[ex._id]?.actualReps || ""
                                      }
                                      onChange={(e) =>
                                        setUserInput((prev) => ({
                                          ...prev,
                                          [ex._id]: {
                                            ...prev[ex._id],
                                            actualReps: e.target.value,
                                          },
                                        }))
                                      }
                                    />

                                    <input
                                      type="number"
                                      placeholder="Kilaža"
                                      value={
                                        userInput[ex._id]?.actualWeight || ""
                                      }
                                      onChange={(e) =>
                                        setUserInput((prev) => ({
                                          ...prev,
                                          [ex._id]: {
                                            ...prev[ex._id],
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
                                          ex,
                                        )
                                      }
                                    >
                                      Spremi
                                    </button>
                                  </div>
                                </div>
                              ))}
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
                fetchSteps={fetchSteps}
                weightInput={weightInput}
                setWeightInput={setWeightInput}
                weightHistory={weightHistory}
                handleWeightSubmit={handleWeightSubmit}
                progressPhotos={progressPhotos}
                handlePhotoUpload={handlePhotoUpload}
                scrollPhoto={scrollPhoto}
                photoIndex={photoIndex}
              />
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
