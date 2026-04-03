"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface CommentMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function CommentMenu({ onEdit, onDelete }: CommentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <MoreHorizontal size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-8 z-10 min-w-[100px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => { onEdit(); setIsOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil size={14} />
            수정
          </button>
          <button
            onClick={() => { onDelete(); setIsOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
