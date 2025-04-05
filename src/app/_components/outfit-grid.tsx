"use client";

interface OutfitGridProps {
  outfits: string[];
}

export function OutfitGrid({ outfits }: OutfitGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {outfits.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-400 mb-2">no outfits yet</div>
          <div className="text-sm text-gray-500">
            use the search bar above to generate outfits based on your wardrobe
          </div>
        </div>
      ) : (
        outfits.map((outfit, index) => (
          <div key={index} className="aspect-square rounded-lg overflow-hidden">
            <img 
              src={outfit} 
              alt={`outfit ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))
      )}
    </div>
  );
} 