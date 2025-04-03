'use client';

import { Eye } from 'lucide-react';

interface ProductStatisticsProps {
  viewCount: number;
}

export default function ProductStatistics({
  viewCount
}: ProductStatisticsProps) {
  return (
    <div className="bg-white rounded-lg">
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-gray-500" />
              <span className="text-sm">Vues</span>
            </div>
            <span className="text-lg font-semibold">{viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}