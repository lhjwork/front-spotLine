interface BlogTransitionBlockProps {
  content: string | null;
}

export default function BlogTransitionBlock({ content }: BlogTransitionBlockProps) {
  if (!content) {
    return (
      <div className="flex justify-center py-2">
        <div className="h-6 w-px bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-400">↕ {content}</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
