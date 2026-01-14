import "./DashView.css";
import { useEffect, useState } from "react";

function Dashboard() {
  const userId = localStorage.getItem("userId");

  const [plans, setPlans] = useState(null);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [feedbackWeek, setFeedbackWeek] = useState(null);

  // -----------------------------
  // FETCH PLANS + USER DATA
  // -----------------------------
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // 1) Fetch plans
        const resPlans = await fetch(
          `http://localhost:5000/api/plans/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!resPlans.ok) {
          const text = await resPlans.text();
          console.error("Plans fetch failed:", resPlans.status, text);
          setPlans([]);
          return;
        }

        const plansData = await resPlans.json();

        if (!Array.isArray(plansData)) {
          console.error("Plans are not an array:", plansData);
          setPlans([]);
          return;
        }

        const sorted = plansData.sort((a, b) => a.weekNumber - b.weekNumber);
        setPlans(sorted);

        // 2) Fetch user (completedWeeks)
        const resUser = await fetch(
          `http://localhost:5000/auth/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!resUser.ok) {
          const text = await resUser.text();
          console.error("User fetch failed:", resUser.status, text);
          setCompletedWeeks([]);
        } else {
          const userData = await resUser.json();
          setCompletedWeeks(userData.completedWeeks || []);
        }

        // 3) Auto-open first unfinished week
        const firstUnfinished =
          sorted.find((p) => !completedWeeks.includes(p.weekNumber)) ||
          sorted[0];

        setExpandedWeek(firstUnfinished?.weekNumber || null);
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

  // -----------------------------
  // RENDER
  // -----------------------------
  if (plans === null) return <p>Učitavanje...</p>;
  if (plans.length === 0) return <p>Nema dostupnih planova.</p>;

  return (
    <div className="dashboard">
      <main className="main-view">
        <h2>Tvoji tjedni planovi</h2>

        {plans.map((plan) => {
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
                  {plan.workouts.map((day, idx) => (
                    <div key={idx} className="day-block">
                      <h3>{day.day}</h3>

                      {day.exercises.map((ex) => (
                        <div className="exercise" key={ex._id}>
                          <h4>{ex.name}</h4>

                          {/* SAFE YOUTUBE PREVIEW */}
                          {ex.youtubeLink && (
                            <a
                              href={ex.youtubeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={`https://img.youtube.com/vi/${
                                  ex.youtubeLink.split("v=")[1]
                                }/0.jpg`}
                                alt={ex.name}
                                className="youtube-thumb"
                              />
                            </a>
                          )}

                          <p>
                            <strong>Bilješke trenera:</strong> {ex.notes || "—"}
                          </p>
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
    </div>
  );
}

export default Dashboard;
