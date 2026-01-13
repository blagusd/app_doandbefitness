import { useEffect, useState } from "react";
import "../views/AdminDashView.css";

const getEmbedUrl = (url) => {
  if (!url) return "";

  //  https://www.youtube.com/watch?v=abc123XYZ
  //  https://youtu.be/abc123XYZ
  //  https://www.youtube.com/embed/abc123XYZ
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
};

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [weekNumber, setWeekNumber] = useState(1);
  const [weekDays, setWeekDays] = useState([]);
  const [exerciseMap, setExerciseMap] = useState({});

  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    youtubeLink: "",
    muscleGroup: "",
    notes: "",
    reps: "",
    sets: "",
    weight: "",
  });

  const [userPlans, setUserPlans] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error while getting the clients:", err);
      }
    };

    const fetchExercises = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/exercises", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();

        const map = {};
        data.forEach((ex) => {
          map[ex._id] = ex;
        });

        setExerciseMap(map);
      } catch (err) {
        console.error("Error while getting exercises:", err);
      }
    };

    fetchUsers();
    fetchExercises();
  }, []);

  // 🔥 Fetch plan when user or week changes
  useEffect(() => {
    if (!selectedUser) return;

    const fetchPlan = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/plans/${selectedUser._id}/week/${weekNumber}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.status === 404) {
          console.log("Nema plana za ovaj tjedan — generiram prazne dane.");

          const numDays = selectedUser.planDays || 3;
          const days = Array.from({ length: numDays }, (_, i) => ({
            day: `Dan ${i + 1}`,
            exercises: [],
          }));

          setWeekDays(days);
          return;
        }

        const plan = await res.json();
        console.log("Učitani plan:", plan);

        setWeekDays(plan.workouts);
      } catch (err) {
        console.error("Greška pri dohvaćanju plana:", err);
      }
    };

    fetchPlan();
  }, [selectedUser, weekNumber]);

  const createExercise = async () => {
    const res = await fetch("http://localhost:5000/api/exercises", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(exerciseForm),
    });

    const newExercise = await res.json();
    setExerciseMap((prev) => ({ ...prev, [newExercise._id]: newExercise }));
    return newExercise._id;
  };

  const addExerciseToDay = async (dayIndex) => {
    if (!exerciseForm.name) return;
    const exerciseId = await createExercise();

    const updated = [...weekDays];
    updated[dayIndex].exercises.push(exerciseId);
    setWeekDays(updated);

    setExerciseForm({
      name: "",
      youtubeLink: "",
      muscleGroup: "",
      notes: "",
    });
  };

  const removeExerciseFromDay = (dayIndex, exIndex) => {
    const updated = [...weekDays];
    updated[dayIndex].exercises.splice(exIndex, 1);
    setWeekDays(updated);
  };

  const savePlan = async () => {
    if (!selectedUser) return;

    const payload = {
      name: `${selectedUser.fullName} – Tjedan ${weekNumber}`,
      weekNumber,
      assignedTo: selectedUser._id,
      workouts: weekDays,
    };

    console.log("Šaljem payload:", payload);

    const res = await fetch("http://localhost:5000/api/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Greška pri spremanju plana: " + err.message);
      return;
    }

    alert("Plan uspješno spremljen!");

    setWeekNumber((prev) => prev); // trigger useEffect
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setWeekNumber(1);

    const res = await fetch(`http://localhost:5000/api/plans/${user._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.ok) {
      const plans = await res.json();
      setUserPlans(plans);
    } else {
      setUserPlans([]);
    }
  };

  return (
    <div className="admin-dashboard">
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

      <main className="main-view">
        {selectedUser ? (
          <>
            <section className="client-summary">
              <h2>{selectedUser.fullName}</h2>
              <p>Email: {selectedUser.email}</p>
              <p>Planova: {selectedUser.weeklyPlans?.length || 0}</p>
            </section>

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
                    const nextWeek = selectedUser.weeklyPlans?.length + 1;
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

                          return ex ? (
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
                              </p>{" "}
                              <p>
                                <strong>Setovi:</strong> {ex.sets || "—"}
                              </p>{" "}
                              <p>
                                <strong>Težina:</strong> {ex.weight || "—"} kg
                              </p>
                              {ex.youtubeLink && (
                                <div className="video-preview">
                                  <iframe
                                    width="100%"
                                    height="200"
                                    src={getEmbedUrl(ex.youtubeLink)}
                                    title={ex.name}
                                    frameBorder="0"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              )}
                              <button
                                onClick={() => removeExerciseFromDay(idx, i)}
                              >
                                Obriši
                              </button>
                            </li>
                          ) : (
                            <li key={i}>Nepoznata vježba: {exId}</li>
                          );
                        })}
                      </ul>
                    )}

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
                      />{" "}
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
                      />{" "}
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

              <button className="save-plan-btn" onClick={savePlan}>
                Spremi plan
              </button>
              <button
                className="delete-plan-btn"
                onClick={async () => {
                  if (!selectedUser) return;

                  const res = await fetch(
                    `http://localhost:5000/api/plans/${selectedUser._id}/week/${weekNumber}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                    }
                  );

                  if (res.ok) {
                    alert("Plan obrisan");
                    setWeekDays([]); // reset
                  } else {
                    alert("Plan nije pronađen");
                  }
                }}
              >
                Obriši ovaj tjedan
              </button>
            </section>
          </>
        ) : (
          <p>Odaberi korisnika s lijeve strane.</p>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
