'use client';

import { ReactNode } from 'react';

interface MainColumnProps {
  children: ReactNode;
}

export default function MainColumn({ children }: MainColumnProps) {
  return (
    <main className="flex-1 mt-[60px] mx-auto w-full max-w-[550px] transition-all">
      <div className="p-2">
        {children}
      </div>
    </main>
  );
}