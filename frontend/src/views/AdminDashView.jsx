import "./AdminDashView.css";
import { useEffect, useState } from "react";

// SERVICES
import { fetchUsers, fetchUserPlans } from "../services/userService";
import { fetchExercises, createExercise } from "../services/exerciseService";
import {
  fetchPlanForWeek,
  savePlanService,
  assignWeeklyPlan,
  deletePlanService,
} from "../services/planService";
import { fetchWeightHistory, fetchPhotos } from "../services/progressService";

// UTILS
import {
  addExerciseToDayUtil,
  removeExerciseFromDayUtil,
} from "../utils/dayUtils";
import { getEmbedUrl } from "../utils/youtube";

// COMPONENTS
import AdminProgressAside from "../components/AdminProgressAside";

function AdminDashboard() {
  // -----------------------------
  // STATE
  // -----------------------------
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekDays, setWeekDays] = useState([]);
  const [exerciseMap, setExerciseMap] = useState({});
  const [userPlans, setUserPlans] = useState([]);
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    youtubeLink: "",
    muscleGroup: "",
    notes: "",
    reps: "",
    sets: "",
    weight: "",
  });

  // READ‑ONLY PROGRESS ASIDE
  const [weightHistory, setWeightHistory] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState({});
  const [photoIndex, setPhotoIndex] = useState({
    front: 0,
    side: 0,
    back: 0,
  });

  const scrollPhoto = (position, direction) => {
    const photos = progressPhotos[position] || [];
    const current = photoIndex[position];
    const next =
      direction === "left"
        ? Math.max(current - 1, 0)
        : Math.min(current + 1, photos.length - 1);

    setPhotoIndex((prev) => ({ ...prev, [position]: next }));
  };

  // -----------------------------
  // LOAD USERS + EXERCISES + PROGRESS
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      // USERS
      const usersData = await fetchUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);

      // EXERCISES
      const exercises = await fetchExercises();
      const map = {};
      exercises.forEach((ex) => (map[ex._id] = ex));
      setExerciseMap(map);

      // PROGRESS
      const weight = await fetchWeightHistory();
      setWeightHistory(weight.weightHistory || []);

      const photos = await fetchPhotos();
      setProgressPhotos(photos.progressPhotos || {});
    };

    load();
  }, []);

  // -----------------------------
  // LOAD PLAN WHEN USER OR WEEK CHANGES
  // -----------------------------
  useEffect(() => {
    if (!selectedUser) return;

    const loadPlan = async () => {
      const res = await fetchPlanForWeek(selectedUser._id, weekNumber);

      if (res.status === 404) {
        const numDays = selectedUser.planDays || 3;
        const days = Array.from({ length: numDays }, (_, i) => ({
          day: `Dan ${i + 1}`,
          exercises: [],
        }));
        setWeekDays(days);
        return;
      }

      const plan = await res.json();
      setWeekDays(plan.workouts);
    };

    loadPlan();
  }, [selectedUser, weekNumber]);

  // -----------------------------
  // SELECT USER
  // -----------------------------
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setWeekNumber(1);

    const plans = await fetchUserPlans(user._id);
    setUserPlans(Array.isArray(plans) ? plans : []);

    const weight = await fetchWeightHistory(user._id);
    setWeightHistory(weight.weightHistory || []);

    const photos = await fetchPhotos(user._id);
    setProgressPhotos(photos.progressPhotos || {});

    console.log("Photos for user:", user.fullName, photos.progressPhotos);
  };

  // -----------------------------
  // CREATE EXERCISE
  // -----------------------------
  const handleCreateExercise = async () => {
    const newExercise = await createExercise(exerciseForm);

    // refresh exercise map
    const exercises = await fetchExercises();
    const map = {};
    exercises.forEach((ex) => (map[ex._id] = ex));
    setExerciseMap(map);

    return newExercise._id;
  };

  // -----------------------------
  // ADD EXERCISE TO DAY
  // -----------------------------
  const addExerciseToDay = async (dayIndex) => {
    if (!exerciseForm.name) return;

    const exerciseId = await handleCreateExercise();

    const updated = addExerciseToDayUtil(weekDays, dayIndex, exerciseId);
    setWeekDays(updated);

    setExerciseForm({
      name: "",
      youtubeLink: "",
      muscleGroup: "",
      notes: "",
      reps: "",
      sets: "",
      weight: "",
    });
  };

  // -----------------------------
  // REMOVE EXERCISE
  // -----------------------------
  const removeExerciseFromDay = (dayIndex, exIndex) => {
    const updated = removeExerciseFromDayUtil(weekDays, dayIndex, exIndex);
    setWeekDays(updated);
  };

  // -----------------------------
  // SAVE PLAN + ASSIGN WEEKLYPLAN
  // -----------------------------
  const savePlan = async () => {
    if (!selectedUser) return;

    const payload = {
      name: `${selectedUser.fullName} – Tjedan ${weekNumber}`,
      weekNumber,
      assignedTo: selectedUser._id,
      workouts: weekDays,
    };

    const savedPlan = await savePlanService(payload);

    const assignRes = await assignWeeklyPlan(selectedUser._id, savedPlan._id);

    if (!assignRes.ok) {
      alert("Plan spremljen, ali WeeklyPlan nije kreiran.");
      return;
    }

    alert("Plan uspješno spremljen i dodijeljen korisniku!");
  };

  // -----------------------------
  // DELETE PLAN
  // -----------------------------
  const deletePlan = async () => {
    if (!selectedUser) return;

    const res = await deletePlanService(selectedUser._id, weekNumber);

    if (res.ok) {
      alert("Plan obrisan");
      setWeekDays([]);
    } else {
      alert("Plan nije pronađen");
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h3>Korisnici</h3>
        <ul>
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={selectedUser?._id === user._id ? "active" : ""}
            >
              {user.fullName} ({user.email})
            </li>
          ))}
        </ul>
      </aside>

      {/* MAIN */}
      <main className="main-view">
        {!selectedUser ? (
          <p>Odaberi korisnika s lijeve strane.</p>
        ) : (
          <>
            {/* USER SUMMARY */}
            <section className="client-summary">
              <h2>{selectedUser.fullName}</h2>
              <p>Email: {selectedUser.email}</p>
              <p>Planova: {userPlans.length}</p>
            </section>

            {/* WEEK BUILDER */}
            <section className="week-builder">
              <h3>Tjedni plan za {selectedUser.fullName}</h3>

              <label>
                Tjedan:
                <select
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                >
                  {userPlans.map((p) => (
                    <option key={p._id} value={p.weekNumber}>
                      Tjedan {p.weekNumber}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const nextWeek =
                      (userPlans[userPlans.length - 1]?.weekNumber || 0) + 1;
                    setWeekNumber(nextWeek);

                    const numDays = selectedUser.planDays || 3;
                    const days = Array.from({ length: numDays }, (_, i) => ({
                      day: `Dan ${i + 1}`,
                      exercises: [],
                    }));

                    setWeekDays(days);
                  }}
                >
                  ➕ Dodaj novi tjedan
                </button>
              </label>

              {/* DAYS */}
              <div className="week-days">
                {weekDays.map((day, idx) => (
                  <div key={idx} className="day-card">
                    <h4>{day.day}</h4>

                    {day.exercises.length === 0 ? (
                      <p>Još nema vježbi.</p>
                    ) : (
                      <ul>
                        {day.exercises.map((exItem, i) => {
                          const ex =
                            typeof exItem === "string"
                              ? exerciseMap[exItem]
                              : exItem;

                          if (!ex) {
                            return (
                              <li key={i}>
                                Nepoznata vježba:{" "}
                                {typeof exItem === "string"
                                  ? exItem
                                  : exItem?._id}
                              </li>
                            );
                          }

                          return (
                            <li key={i}>
                              <p>
                                <strong>Naziv:</strong> {ex.name}
                              </p>
                              <p>
                                <strong>Mišićna skupina:</strong>{" "}
                                {ex.muscleGroup || "—"}
                              </p>
                              <p>
                                <strong>Bilješke:</strong> {ex.notes || "—"}
                              </p>
                              <p>
                                <strong>Ponavljanja:</strong> {ex.reps || "—"}
                              </p>
                              <p>
                                <strong>Setovi:</strong> {ex.sets || "—"}
                              </p>
                              <p>
                                <strong>Težina:</strong> {ex.weight || "—"} kg
                              </p>

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

                              <button
                                onClick={() => removeExerciseFromDay(idx, i)}
                              >
                                Obriši
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {/* ADD EXERCISE FORM */}
                    <div className="exercise-form">
                      <input
                        type="text"
                        placeholder="Naziv vježbe"
                        value={exerciseForm.name}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            name: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="YouTube link"
                        value={exerciseForm.youtubeLink}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            youtubeLink: e.target.value,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Mišićna skupina"
                        value={exerciseForm.muscleGroup}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            muscleGroup: e.target.value,
                          })
                        }
                      />
                      <textarea
                        placeholder="Bilješke"
                        value={exerciseForm.notes}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            notes: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Ponavljanja"
                        value={exerciseForm.reps}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            reps: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Setovi"
                        value={exerciseForm.sets}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            sets: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Težina (kg)"
                        value={exerciseForm.weight}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            weight: e.target.value,
                          })
                        }
                      />

                      <button onClick={() => addExerciseToDay(idx)}>
                        Dodaj vježbu
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* SAVE / DELETE */}
              <button className="save-plan-btn" onClick={savePlan}>
                Spremi plan
              </button>

              <button className="delete-plan-btn" onClick={deletePlan}>
                Obriši ovaj tjedan
              </button>
            </section>
          </>
        )}
      </main>

      {/* RIGHT ASIDE */}
      <AdminProgressAside
        weightHistory={weightHistory}
        progressPhotos={progressPhotos}
        photoIndex={photoIndex}
        scrollPhoto={scrollPhoto}
      />
    </div>
  );
}

export default AdminDashboard;
