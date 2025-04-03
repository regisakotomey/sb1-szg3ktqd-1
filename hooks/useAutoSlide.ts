'use client';

import { useState, useEffect } from 'react';

export function useAutoSlide<T>(items: T[], interval: number = 15000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((current) => (current + 1) % items.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrevious = () => {
    setIsTransitioning(true);
    setCurrentIndex((current) => (current - 1 + items.length) % items.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((current) => (current + 1) % items.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  return {
    currentIndex,
    isTransitioning,
    goToNext,
    goToPrevious
  };
}