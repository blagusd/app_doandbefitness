import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function WeightChart({ data }) {
  if (!data || data.length === 0) return <p>Nema podataka za grafikon.</p>;

  const chartData = {
    labels: data.map((entry) =>
      new Date(entry.date).toLocaleDateString("hr-HR")
    ),
    datasets: [
      {
        label: "Kilaža (kg)",
        data: data.map((entry) => entry.weight),
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.3)",
        tension: 0.3,
      },
    ],
  };

  return <Line data={chartData} />;
}

export default WeightChart;
