'use client';

interface OpportunityGalleryProps {
  images: string[];
}

export default function OpportunityGallery({ images }: OpportunityGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Galerie photos</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg overflow-hidden"
          >
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}