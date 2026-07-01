export function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-success text-white"
      : score >= 65
        ? "bg-board text-white"
        : "bg-signal text-white";

  return (
    <span className={`inline-flex min-w-12 justify-center rounded-md px-2.5 py-1 text-sm font-semibold ${tone}`}>
      {score}
    </span>
  );
}
