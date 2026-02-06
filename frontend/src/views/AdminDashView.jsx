import "./AdminDashView.css";
import { useEffect, useState } from "react";

import { fetchUsers, updateUser } from "../services/userService";
import { fetchExercises, createExercise } from "../services/exerciseService";
import { fetchWeightHistoryAdmin } from "../services/weightService";
import { fetchPhotosAdmin } from "../services/photoService";
import { fetchStepsAdmin } from "../services/stepsService";
import {
  fetchUserWeeklyPlans,
  fetchWeeklyPlanForWeek,
  saveWeeklyPlan,
  deleteWeeklyPlan,
} from "../services/weeklyPlanService";

import {
  addExerciseToDayUtil,
  removeExerciseFromDayUtil,
  normalizeDays,
} from "../utils/dayUtils";

import AdminProgressAside from "../components/AdminProgressAside";

function AdminDashboard() {
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

  const [weightHistory, setWeightHistory] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState({});
  const [photoIndex, setPhotoIndex] = useState({
    front: 0,
    side: 0,
    back: 0,
  });
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
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

  useEffect(() => {
    if (!selectedUser) {
      setWeekDays([]);
      return;
    }

    const loadWeek = async () => {
      const weeklyPlan = userPlans.find((p) => p.weekNumber === weekNumber);

      if (weeklyPlan) {
        setWeekDays(normalizeDays(weeklyPlan.days));
        return;
      }

      const res = await fetchWeeklyPlanForWeek(selectedUser._id, weekNumber);
      if (!res || !Array.isArray(res.days)) {
        const numDays = selectedUser.planDays || 3;
        const days = Array.from({ length: numDays }, (_, i) => ({
          day: `Dan ${i + 1}`,
          exercises: [],
        }));
        setWeekDays(normalizeDays(days));
        return;
      }
      setWeekDays(normalizeDays(res.days));
    };

    loadWeek();
  }, [selectedUser, weekNumber, userPlans]);

  useEffect(() => {
    if (!selectedUser) {
      setWeekDays([]);
      setWeekNumber(1);
      return;
    }

    setWeekDays([]);
    setWeekNumber(1);
  }, [selectedUser]);

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
  };

  const handleCreateExercise = async () => {
    const newExercise = await createExercise(exerciseForm);

    setExerciseMap((prev) => ({
      ...prev,
      [newExercise._id]: newExercise,
    }));

    return newExercise._id;
  };

  const addExerciseToDay = async (dayIndex) => {
    if (!exerciseForm.name || !selectedUser) return;

    const exerciseId = await handleCreateExercise();

    const updated = addExerciseToDayUtil(
      normalizeDays(weekDays),
      dayIndex,
      exerciseId,
    );

    setWeekDays(updated);

    const plans = await fetchUserWeeklyPlans(selectedUser._id);
    setUserPlans(plans);

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

  const removeExerciseFromDay = (dayIndex, exIndex) => {
    const updated = removeExerciseFromDayUtil(weekDays, dayIndex, exIndex);
    setWeekDays(updated);
  };

  const savePlan = async () => {
    if (!selectedUser) return;

    const payload = {
      userId: selectedUser._id,
      weekNumber,
      days: weekDays,
    };

    await saveWeeklyPlan(payload);

    const plans = await fetchUserWeeklyPlans(selectedUser._id);
    setUserPlans(plans);

    setWeekDays(normalizeDays(payload.days));

    alert("Tjedni plan spremljen!");
  };

  const deletePlan = async () => {
    if (!selectedUser) return;

    const res = await deleteWeeklyPlan(selectedUser._id, weekNumber);

    if (res.success) {
      alert("Tjedni plan obrisan!");
      setWeekDays([]);

      const plans = await fetchUserWeeklyPlans(selectedUser._id);
      setUserPlans(plans);
    } else {
      alert("Plan nije pronađen.");
    }
  };

  const increasePlanDays = async () => {
    if (!selectedUser) return;

    const newValue = selectedUser.planDays + 1;

    await updateUser(selectedUser._id, { planDays: newValue });

    setSelectedUser({ ...selectedUser, planDays: newValue });

    setWeekDays((prev) =>
      normalizeDays([
        ...prev,
        { day: `Dan ${prev.length + 1}`, exercises: [] },
      ]),
    );

    const plans = await fetchUserWeeklyPlans(selectedUser._id);
    setUserPlans(plans);
  };

  const decreasePlanDays = async () => {
    if (!selectedUser || selectedUser.planDays <= 1) return;

    const newValue = selectedUser.planDays - 1;

    await updateUser(selectedUser._id, { planDays: newValue });

    setSelectedUser({ ...selectedUser, planDays: newValue });

    setWeekDays((prev) => normalizeDays(prev.slice(0, -1)));

    const plans = await fetchUserWeeklyPlans(selectedUser._id);
    setUserPlans(plans);
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

  return (
    <div className="admin-dashboard">
      {" "}
      {/* SIDEBAR */}{" "}
      <aside className="sidebar">
        {" "}
        <h3>Korisnici</h3>{" "}
        <ul>
          {" "}
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={selectedUser?._id === user._id ? "active" : ""}
            >
              {" "}
              {user.fullName} ({user.email}){" "}
            </li>
          ))}{" "}
        </ul>{" "}
      </aside>{" "}
      {/* MAIN */}{" "}
      <main className="main-view">
        {" "}
        {!selectedUser ? (
          <p>Odaberi korisnika s lijeve strane.</p>
        ) : (
          <>
            {" "}
            {/* USER SUMMARY */}{" "}
            <section className="client-summary">
              {" "}
              <h2>{selectedUser.fullName}</h2>{" "}
              <p>Email: {selectedUser.email}</p>{" "}
              <p>Broj tjednih planova: {userPlans.length}</p>{" "}
            </section>{" "}
            {/* WEEK BUILDER */}{" "}
            <section className="week-builder">
              {" "}
              <h3>
                {" "}
                Tjedni plan za {selectedUser.fullName}{" "}
                {selectedUser.completedWeeks?.includes(weekNumber) && (
                  <span className="week-done"> ✔ Tjedan završen</span>
                )}{" "}
              </h3>{" "}
              <div className="day-controls">
                {" "}
                <button onClick={increasePlanDays}>➕ Dodaj dan</button>{" "}
                {selectedUser.planDays > 1 && (
                  <button onClick={decreasePlanDays}>➖ Ukloni dan</button>
                )}{" "}
              </div>{" "}
              <label>
                {" "}
                Tjedan:{" "}
                <select
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                >
                  {" "}
                  {userPlans.map((p) => (
                    <option key={p._id} value={p.weekNumber}>
                      {" "}
                      Tjedan {p.weekNumber}{" "}
                    </option>
                  ))}{" "}
                </select>{" "}
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
                  {" "}
                  ➕ Dodaj novi tjedan{" "}
                </button>{" "}
              </label>{" "}
              {/* DAYS */}{" "}
              <div className="week-days">
                {" "}
                {weekDays.map((day, idx) => (
                  <div key={idx} className="day-card">
                    {" "}
                    <h4>{day.day}</h4>{" "}
                    {day.exercises.length === 0 ? (
                      <p>Još nema vježbi.</p>
                    ) : (
                      <ul>
                        {" "}
                        {day.exercises.map((exItem, i) => {
                          const exercise = exerciseMap[exItem.exerciseId];
                          if (!exercise) {
                            return (
                              <li key={i}>
                                {" "}
                                Nepoznata vježba (ID: {exItem.exerciseId}){" "}
                              </li>
                            );
                          }
                          return (
                            <li key={i}>
                              {" "}
                              <p>
                                {" "}
                                <strong>Naziv:</strong> {exercise.name}{" "}
                              </p>{" "}
                              <p>
                                {" "}
                                <strong>Mišićna skupina:</strong>{" "}
                                {exercise.muscleGroup || "—"}{" "}
                              </p>{" "}
                              <p>
                                {" "}
                                <strong>Bilješke:</strong>{" "}
                                {exercise.notes || "—"}{" "}
                              </p>{" "}
                              {/* PLANIRANO */}{" "}
                              <p>
                                {" "}
                                <strong>Planirano:</strong>{" "}
                              </p>{" "}
                              <p>Serije: {exercise.sets ?? "—"}</p>{" "}
                              <p>Ponavljanja: {exercise.reps ?? "—"}</p>{" "}
                              <p>Kilaža: {exercise.weight ?? "—"} kg</p>{" "}
                              {/* ODRAĐENO */}{" "}
                              <p>
                                {" "}
                                <strong>Odrađeno:</strong>{" "}
                              </p>{" "}
                              <p>Serije: {exItem.actualSets ?? "—"}</p>{" "}
                              <p>Ponavljanja: {exItem.actualReps ?? "—"}</p>{" "}
                              <p>Kilaža: {exItem.actualWeight ?? "—"} kg</p>{" "}
                              {exercise.youtubeLink && (
                                <iframe
                                  width="100%"
                                  height="200"
                                  src={exercise.youtubeLink.replace(
                                    "watch?v=",
                                    "embed/",
                                  )}
                                  title={exercise.name}
                                  frameBorder="0"
                                  allowFullScreen
                                ></iframe>
                              )}{" "}
                              <button
                                onClick={() => removeExerciseFromDay(idx, i)}
                              >
                                {" "}
                                Obriši{" "}
                              </button>{" "}
                            </li>
                          );
                        })}{" "}
                      </ul>
                    )}{" "}
                    {/* ADD EXERCISE FORM */}{" "}
                    <div className="exercise-form">
                      {" "}
                      <button onClick={() => addExerciseToDay(idx)}>
                        {" "}
                        Dodaj vježbu{" "}
                      </button>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              {/* SAVE / DELETE */}{" "}
              <button className="save-plan-btn" onClick={savePlan}>
                {" "}
                Spremi plan{" "}
              </button>{" "}
              <button className="delete-plan-btn" onClick={deletePlan}>
                {" "}
                Obriši ovaj tjedan{" "}
              </button>{" "}
            </section>{" "}
          </>
        )}{" "}
      </main>{" "}
      {/* RIGHT ASIDE */}{" "}
      <AdminProgressAside
        stepsData={stepsData}
        weightHistory={weightHistory}
        progressPhotos={progressPhotos}
        photoIndex={photoIndex}
        scrollPhoto={scrollPhoto}
        openFullscreen={openFullscreen}
      />{" "}
      {/* FULLSCREEN OVERLAY */}{" "}
      {fullscreenPhoto && (
        <div className="fullscreen-overlay" onClick={closeFullscreen}>
          {" "}
          <img
            src={
              progressPhotos[fullscreenPhoto.pos][
                fullscreenPhoto.index
              ].startsWith("http")
                ? progressPhotos[fullscreenPhoto.pos][fullscreenPhoto.index]
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
  );
}

export default AdminDashboard;
