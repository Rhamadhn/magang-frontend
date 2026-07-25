import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface RadarData {
  kriteria: string;
  nilai: number;
  fullMark: number;
}

interface Props {
  data: RadarData[];
}

const InternRadarChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-[350px] flex items-center justify-center bg-white dark:bg-transparent rounded-3xl">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="kriteria"
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Performa"
            dataKey="nilai"
            stroke="#4F46E5"
            fill="#4F46E5"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InternRadarChart;