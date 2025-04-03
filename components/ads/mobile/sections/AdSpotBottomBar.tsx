'use client';

interface AdSpotBottomBarProps {
  adSpotId: string;
  isOwner: boolean;
}

export default function AdSpotBottomBar({
  adSpotId,
  isOwner
}: AdSpotBottomBarProps) {
  if (isOwner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <button
        className="w-full py-3 px-4 bg-primary text-white rounded-xl text-sm font-medium"
      >
        Contacter
      </button>
    </div>
  );
}