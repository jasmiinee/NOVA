import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

export const SkillsRadarChart = ({ skills = [] }) => {
  const labels = skills.map((s) => s.skill);

  const data = {
    labels,
    datasets: [
      {
        label: "Skill Level",
        data: skills.map((s) => s.level),
        // You can change these or set via props/theme
        backgroundColor: "rgba(59,130,246,0.15)",
        borderColor: "rgba(59,130,246,1)",
        pointBackgroundColor: "white",
        pointBorderColor: "rgba(59,130,246,1)",
        pointRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    // allow the canvas to size by CSS height/width rather than forcing aspect ratio
    maintainAspectRatio: false,
    layout: {
      // extra breathing room around the whole chart (prevents clipped labels)
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          // show radial ticks; adjust font if needed
          color: "#6b7280",
        },
        grid: {
          color: "rgba(0,0,0,0.06)",
        },
        angleLines: {
          color: "rgba(0,0,0,0.06)",
        },
        // point label styling (the labels around the radar)
        pointLabels: {
          // give a little padding so labels don't touch edges
          padding: 8,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    // parent container controls visual size; height is important so labels have space
    <div style={{ width: "100%", height: 270 }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default SkillsRadarChart;
