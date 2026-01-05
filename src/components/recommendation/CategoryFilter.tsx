'use client';

import { CategoryType } from '@/types';
import { getCategoryLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: CategoryType | null;
  onCategoryChange: (category: CategoryType | null) => void;
  className?: string;
}

const categories: { value: CategoryType; label: string; emoji: string }[] = [
  { value: 'next_meal', label: '식사', emoji: '🍽️' },
  { value: 'dessert', label: '디저트', emoji: '🧁' },
  { value: 'activity', label: '활동', emoji: '🎯' },
  { value: 'shopping', label: '쇼핑', emoji: '🛍️' },
  { value: 'culture', label: '문화', emoji: '🎨' },
  { value: 'rest', label: '휴식', emoji: '☕' },
];

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  className 
}: CategoryFilterProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">카테고리</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* 전체 버튼 */}
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors',
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          <span>🌟</span>
          <span>전체</span>
        </button>
        
        {/* 카테고리 버튼들 */}
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-colors',
              selectedCategory === category.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
      
      {/* 선택된 카테고리 설명 */}
      {selectedCategory && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{getCategoryLabel(selectedCategory)}</span> 카테고리의 추천 장소를 보고 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}