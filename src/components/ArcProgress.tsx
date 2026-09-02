"use client";

import { Arc } from "@/types";
import { getArcDay, getArcProgress } from "@/lib/utils";
import { Card } from "./ui/Card";
import { ProgressBar } from "./ui/ProgressBar";
import { Snowflake } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ArcProgressProps {
  arc: Arc;
}

export function ArcProgress({ arc }: ArcProgressProps) {
  const currentDay = getArcDay(arc.startDate);
  const progress = getArcProgress(currentDay, arc.durationDays);

  return (
    <Card variant="strong" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-frost-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="flex items-center gap-2 mb-4">
        <Snowflake className="text-frost-300" size={20} />
        <h2 className="text-lg font-bold tracking-wide">WINTER ARC</h2>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-bold text-gradient-ice">Day {currentDay}</span>
        <span className="text-arc-muted">/ {arc.durationDays}</span>
      </div>
      <ProgressBar value={progress} showLabel />
      <div className="flex justify-between mt-4 text-xs text-arc-muted">
        <span>Start: {formatDate(arc.startDate)}</span>
        <span>End: {formatDate(arc.endDate)}</span>
      </div>
    </Card>
  );
}
