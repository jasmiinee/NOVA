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
  const trim = (s, n = 28) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const labels = skills.map((s) => trim(s.skill));

  const data = {
    labels,
    datasets: [
      {
        label: "Skill Level",
        data: skills.map((s) => s.level),
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
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 6,
        right: 16,
        bottom: 6,
        left: 16,
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
        callbacks: {
          // show full label in tooltip
          title: (items) => skills[items[0].dataIndex]?.skill || items[0].label,
          label: (ctx) => `Level: ${ctx.parsed.r}/5`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          display: false,
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
    <Radar data={data} options={options} />
  );
};

export default SkillsRadarChart;
