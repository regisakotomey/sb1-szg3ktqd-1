import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Shop } from '@/types/shop';

interface ShopDetailsProps {
  shop: Shop;
}

export default function ShopDetails({ shop }: ShopDetailsProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Description</h3>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">
          {shop.description}
        </p>
      </div>

      {/* Pays desservis */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Pays desservis</h3>
        <div className="flex items-start gap-2 text-sm">
          <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
          <span>{shop.countries.join(', ')}</span>
        </div>
      </div>

      {/* Contact */}
      {(shop.contact.phone || shop.contact.email || shop.contact.website) && (
        <div className="bg-white rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Contact</h3>
          <div className="space-y-2">
            {shop.contact.phone && (
              <a 
                href={`tel:${shop.contact.phone}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Phone size={16} className="text-gray-500" />
                <span>{shop.contact.phone}</span>
              </a>
            )}
            {shop.contact.email && (
              <a 
                href={`mailto:${shop.contact.email}`}
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Mail size={16} className="text-gray-500" />
                <span>{shop.contact.email}</span>
              </a>
            )}
            {shop.contact.website && (
              <a 
                href={shop.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary"
              >
                <Globe size={16} className="text-gray-500" />
                <span>{shop.contact.website}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}