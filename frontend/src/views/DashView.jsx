import "./DashView.css";
import { useEffect, useState } from "react";

function Dashboard() {
  const userId = localStorage.getItem("userId");
  const [plans, setPlans] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [completedWeeks, setCompletedWeeks] = useState([]);
  const [feedbackWeek, setFeedbackWeek] = useState(null);

  console.log("Plans:", plans);

  useEffect(() => {
    if (!userId) return;

    const fetchPlans = async () => {
      const res = await fetch(`/api/plans/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      const sorted = data.sort((a, b) => a.weekNumber - b.weekNumber);

      setPlans(sorted);

      setCompletedWeeks(data[0]?.assignedTo?.completedWeeks || []);
    };

    fetchPlans();
  }, [userId]);

  const toggleWeek = (week) => {
    setExpandedWeek(expandedWeek === week ? null : week);
  };

  const markWeekCompleted = (week) => {
    setFeedbackWeek(week);
  };

  const sendFeedback = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    await fetch("/api/send-feedback", {
      method: "POST",
      body: formData,
    });

    setCompletedWeeks([...completedWeeks, feedbackWeek]);
    setFeedbackWeek(null);
  };

  if (!plans.length) return <p>Učitavanje...</p>;

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

                {isCompleted && <span className="checkmark">✔</span>}
                {!isCompleted && (
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
