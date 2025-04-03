'use client';

import { Eye } from 'lucide-react';

interface ProductStatisticsProps {
  viewCount: number;
}

export default function ProductStatistics({
  viewCount
}: ProductStatisticsProps) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Statistiques</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-gray-500" />
            <span className="font-medium">Vues</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{viewCount}</span>
        </div>
      </div>
    </div>
  );
}