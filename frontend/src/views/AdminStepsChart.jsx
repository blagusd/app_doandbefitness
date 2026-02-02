import { useEffect, useState } from "react";
import StepsChart from "../views/StepsChart";

function AdminStepsChart({ userId, token }) {
  const [stepsData, setStepsData] = useState([]);

  const fetchUserSteps = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/progress/steps/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        console.error("Greška pri dohvaćanju koraka korisnika:", res.status);
        return;
      }

      const data = await res.json();
      setStepsData(data);
    } catch (err) {
      console.error("Error fetching user steps:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchUserSteps();
  }, [userId]);

  return (
    <div>
      <h3>Koraci korisnika</h3>
      <StepsChart data={stepsData} />
    </div>
  );
}

export default AdminStepsChart;
