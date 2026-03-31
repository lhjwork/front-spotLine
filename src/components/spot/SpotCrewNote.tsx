import { Sparkles } from "lucide-react";

interface SpotCrewNoteProps {
  crewNote: string;
  source: string;
}

export default function SpotCrewNote({ crewNote, source }: SpotCrewNoteProps) {
  const isCrew = source === "CREW" || source === "crew";

  return (
    <section className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-700">
          {isCrew ? "크루 추천" : "한줄 소개"}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{crewNote}</p>
    </section>
  );
}
