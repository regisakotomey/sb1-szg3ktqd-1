'use client';

interface OpportunityHeaderProps {
  title: string;
  mainImage: string;
  locationDetails: string;
}

export default function OpportunityHeader({
  title,
  mainImage,
  locationDetails
}: OpportunityHeaderProps) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden mb-6 relative">
      <img
        src={mainImage}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            {locationDetails}
          </span>
        </div>
      </div>
    </div>
  );
}