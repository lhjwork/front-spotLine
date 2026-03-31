interface TagListProps {
  tags: string[];
  className?: string;
}

export default function TagList({ tags, className }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className || ""}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
