'use client';

interface AdSpotGalleryProps {
  media: Array<{
    url: string;
    caption: string;
  }>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function AdSpotGallery({
  media,
  currentIndex,
  onSelect
}: AdSpotGalleryProps) {
  if (media.length <= 1) return null;

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Galerie</h2>
      <div className="grid grid-cols-5 gap-4">
        {media.map((item, index) => (
          <div
            key={index}
            onClick={() => onSelect(index)}
            className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${
              index === currentIndex ? 'ring-2 ring-primary' : ''
            }`}
          >
            {item.url.includes('.mp4') ? (
              <video
                src={item.url}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={item.url}
                alt={item.caption}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}