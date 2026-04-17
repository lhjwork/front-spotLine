import { Sparkles } from "lucide-react";

interface SpotCrewNoteProps {
  crewNote: string;
  source: string;
}

export default function SpotCrewNote({ crewNote, source }: SpotCrewNoteProps) {
  const isCrew = source === "CREW" || source === "crew";

  return (
    <section className="mt-4 rounded-2xl border-l-4 border-blue-400 bg-gradient-to-r from-blue-50/80 to-white p-4">
      <blockquote>
        <p className="text-base italic leading-relaxed text-gray-700">
          &ldquo;{crewNote}&rdquo;
        </p>
        <footer className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
          {isCrew && <Sparkles className="h-3.5 w-3.5 text-blue-500" />}
          <span>— {isCrew ? "Spotline 크루 추천" : "한줄 소개"}</span>
        </footer>
      </blockquote>
    </section>
  );
}
