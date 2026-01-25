import "./AdminDashView.css";
import { useEffect, useState } from "react";

// SERVICES
import { fetchUsers } from "../services/userService";
import { fetchExercises, createExercise } from "../services/exerciseService";
import {
  fetchPlanForWeek,
  savePlanService,
  assignWeeklyPlan,
  deletePlanService,
} from "../services/planService";
import { fetchWeightHistoryAdmin } from "../services/weightService";
import { fetchPhotosAdmin } from "../services/photoService";
import { fetchStepsAdmin } from "../services/stepsService";
import { fetchUserWeeklyPlans } from "../services/weeklyPlanService";

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
  const [stepsData, setStepsData] = useState([]);

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
  // LOAD USERS + EXERCISES
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      const usersData = await fetchUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);

      const exercises = await fetchExercises();
      const map = {};
      exercises.forEach((ex) => (map[ex._id] = ex));
      setExerciseMap(map);
    };

    load();
  }, []);

  // -----------------------------
  // LOAD WEEK DATA WHEN USER / WEEK OR USERPLANS CHANGE
  // -----------------------------
  useEffect(() => {
    if (!selectedUser) return;

    const loadWeek = async () => {
      const weeklyPlan = userPlans.find((p) => p.weekNumber === weekNumber);

      if (weeklyPlan) {
        setWeekDays(weeklyPlan.days || []);
        return;
      }

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
      setWeekDays(plan.workouts || []);
    };

    loadWeek();
  }, [selectedUser, weekNumber, userPlans]);

  // -----------------------------
  // FETCH STEPS FOR SELECTED USER
  // -----------------------------
  const fetchUserSteps = async (userId) => {
    if (!userId) return;
    const steps = await fetchStepsAdmin(userId);
    setStepsData(steps || []);
  };

  useEffect(() => {
    if (selectedUser) {
      fetchUserSteps(selectedUser._id);
    }
  }, [selectedUser]);

  // -----------------------------
  // SELECT USER
  // -----------------------------
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setWeekNumber(1);

    const plans = await fetchUserWeeklyPlans(user._id);
    setUserPlans(Array.isArray(plans) ? plans : []);

    const weight = await fetchWeightHistoryAdmin(user._id);
    setWeightHistory(weight.weightHistory || []);

    const photos = await fetchPhotosAdmin(user._id);
    setProgressPhotos(photos.progressPhotos || {});

    const steps = await fetchStepsAdmin(user._id);
    setStepsData(steps || []);

    console.log("Photos for user:", user.fullName, photos.progressPhotos);
  };

  // -----------------------------
  // CREATE EXERCISE
  // -----------------------------
  const handleCreateExercise = async () => {
    const newExercise = await createExercise(exerciseForm);

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

    const plans = await fetchUserWeeklyPlans(selectedUser._id);
    setUserPlans(Array.isArray(plans) ? plans : []);

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
      const plans = await fetchUserWeeklyPlans(selectedUser._id);
      setUserPlans(Array.isArray(plans) ? plans : []);
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
              <h3>
                Tjedni plan za {selectedUser.fullName}
                {selectedUser.completedWeeks?.includes(weekNumber) && (
                  <span className="week-done"> ✔ Tjedan završen</span>
                )}
              </h3>

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

                              {/* PLANIRANO */}
                              <p>
                                <strong>Planirano:</strong>
                              </p>
                              <p>Serije: {ex.plannedSets ?? "—"}</p>
                              <p>Ponavljanja: {ex.plannedReps ?? "—"}</p>
                              <p>Kilaža: {ex.plannedWeight ?? "—"} kg</p>

                              {/* ODRAĐENO */}
                              <p>
                                <strong>Odrađeno:</strong>
                              </p>
                              <p>Serije: {ex.actualSets ?? "—"}</p>
                              <p>Ponavljanja: {ex.actualReps ?? "—"}</p>
                              <p>Kilaža: {ex.actualWeight ?? "—"} kg</p>

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
        stepsData={stepsData}
        weightHistory={weightHistory}
        progressPhotos={progressPhotos}
        photoIndex={photoIndex}
        scrollPhoto={scrollPhoto}
      />
    </div>
  );
}

export default AdminDashboard;
