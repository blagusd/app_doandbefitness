import { useState } from "react";

function StepsForm({ onSaved }) {
  const [steps, setSteps] = useState("");
  console.log("Submitting steps:", steps);

  const saveSteps = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/progress/steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ steps: Number(steps) }),
      });

      if (!res.ok) {
        console.error("Greška pri spremanju koraka:", res.status);
        return;
      }

      setSteps("");
      onSaved();
    } catch (err) {
      console.error("Greška pri spremanju koraka:", err);
    }
  };

  return (
    <form onSubmit={saveSteps} className="steps-form">
      <input
        type="number"
        placeholder="Broj koraka"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />
      <button type="submit">Spremi</button>
    </form>
  );
}

export default StepsForm;
