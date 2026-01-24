import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

function StepsChart({ data }) {
  if (!data || data.length === 0) return <p>Nema podataka za korake.</p>;

  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  const last7 = sorted.slice(-7);

  const chartData = {
    labels: last7.map((entry) =>
      new Date(entry.date).toLocaleDateString("hr-HR"),
    ),
    datasets: [
      {
        label: "Koraci",
        data: last7.map((entry) => entry.steps),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1000 },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

export default StepsChart;
