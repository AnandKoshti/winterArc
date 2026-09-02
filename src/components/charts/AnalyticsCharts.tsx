"use client";

import { Card } from "@/components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

const XP_DATA = [
  { day: "Mon", xp: 320 },
  { day: "Tue", xp: 450 },
  { day: "Wed", xp: 580 },
  { day: "Thu", xp: 410 },
  { day: "Fri", xp: 520 },
  { day: "Sat", xp: 380 },
  { day: "Sun", xp: 490 },
];

export function AnalyticsCharts() {
  return (
    <>
      <Card variant="glass">
        <h2 className="font-bold mb-4">XP Over Time</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={XP_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1a2234", border: "1px solid #2a3548", borderRadius: 12 }}
              />
              <Line type="monotone" dataKey="xp" stroke="#67e8f9" strokeWidth={2} dot={{ fill: "#67e8f9" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card variant="glass">
        <h2 className="font-bold mb-4">Weekly Performance</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={XP_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1a2234", border: "1px solid #2a3548", borderRadius: 12 }}
              />
              <Bar dataKey="xp" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}
