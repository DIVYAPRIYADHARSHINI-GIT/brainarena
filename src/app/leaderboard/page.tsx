import type { Metadata } from "next";
import { Suspense } from "react";
import { LeaderboardView } from "@/components/LeaderboardView";
import { LoadingBrain } from "@/components/LoadingBrain";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<LoadingBrain />}>
      <LeaderboardView />
    </Suspense>
  );
}
