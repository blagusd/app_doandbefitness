import "./DashView.css";
import { useEffect, useState } from "react";

function Dashboard() {
  const userId = localStorage.getItem("userId");
  const [plan, setPlan] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    if (!userId) return;

    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/plans/${userId}/week/${selectedWeek}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Error while getting the plan...");
        }

        const data = await res.json();
        setPlan(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlan();
  }, [userId, selectedWeek]);

  if (!userId) {
    return <p>Nije pronađen korisnik.</p>;
  }

  if (!plan) return <p>Učitavanje...</p>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        {[1, 2, 3, 4].map((week) => (
          <div
            key={week}
            className={selectedWeek === week ? "active" : ""}
            onClick={() => setSelectedWeek(week)}
          >
            Tjedan {week}
          </div>
        ))}
      </aside>

      <main className="main-view">
        <h2>
          {plan.name} — Tjedan {plan.weekNumber}
        </h2>

        {plan.workouts.map((workout, idx) => (
          <div className="training-block" key={idx}>
            <h3>{workout.day}</h3>

            {workout.exercises.map((ex) => (
              <div className="exercise" key={ex._id}>
                <h4>{ex.name}</h4>

                {ex.youtubeLink && (
                  <iframe
                    width="100%"
                    height="200"
                    src={ex.youtubeLink}
                    title={ex.name}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}

                <textarea placeholder="Bilješke..." defaultValue={ex.notes} />

                <div className="inputs">
                  <label>
                    Ponavljanja:
                    <input type="number" />
                  </label>

                  <label>
                    Kilaža (kg):
                    <input type="number" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

export default Dashboard;
