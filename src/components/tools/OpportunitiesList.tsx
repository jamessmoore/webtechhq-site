"use client";

import { useState } from "react";
import type { Opportunity } from "@/lib/tools/reportData";
import OpportunityCard from "./OpportunityCard";

interface OpportunitiesListProps {
  opportunities: Opportunity[];
}

export default function OpportunitiesList({ opportunities }: OpportunitiesListProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([opportunities[0]?.rank]));

  function toggle(rank: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(rank)) next.delete(rank);
      else next.add(rank);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {opportunities.map((opp) => (
        <OpportunityCard key={opp.rank} opp={opp} expanded={expanded.has(opp.rank)} onToggle={() => toggle(opp.rank)} />
      ))}
    </div>
  );
}
