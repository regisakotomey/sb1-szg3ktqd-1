'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Briefcase, Store, ShoppingBag, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoSlide } from '@/hooks/useAutoSlide';
import { useRouter } from 'next/navigation';

// Données de test pour les contenus sponsorisés
const sponsoredContent = {
  events: [
    {
      id: 1,
      type: 'event',
      title: 'Festival de Musique',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400'
    }
  ],
  places: [
    {
      id: 2,
      type: 'place',
      title: 'Le Café Parisien',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400'
    }
  ],
  opportunities: [
    {
      id: 3,
      type: 'opportunity',
      title: 'Développeur Full Stack',
      location: 'Lyon, France',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400'
    }
  ]
};

const sponsoredProducts = {
  shops: [
    {
      id: 1,
      type: 'shop',
      title: 'Mode Élégante',
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400'
    }
  ],
  products: [
    {
      id: 2,
      type: 'product',
      title: 'Sneakers Urban Style',
      price: '89,99 €',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400'
    }
  ]
};

const sponsoredProfiles = [
  {
    id: 1,
    name: 'Marie Laurent',
    role: 'Designer',
    followers: '1.2k',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    name: 'Thomas Martin',
    role: 'Entrepreneur',
    followers: '3.4k',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    name: 'Sophie Bernard',
    role: 'Artiste',
    followers: '2.8k',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400'
  }
];

// Combine all sponsored content into a single array
const combinedSponsored = [
  ...sponsoredContent.events,
  ...sponsoredContent.places,
  ...sponsoredContent.opportunities
];

// Combine all products and shops into a single array
const combinedProducts = [
  ...sponsoredProducts.shops,
  ...sponsoredProducts.products
];

export default function RightSidebar() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const { currentIndex: sponsoredIndex, isTransitioning: sponsoredTransitioning, goToNext: nextSponsored, goToPrevious: previousSponsored } = useAutoSlide(combinedSponsored);
  const { currentIndex: productsIndex, isTransitioning: productsTransitioning, goToNext: nextProduct, goToPrevious: previousProduct } = useAutoSlide(combinedProducts);

  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSponsoredClick = (item: any) => {
    switch (item.type) {
      case 'event':
        router.push(`/events/${item.id}`);
        break;
      case 'place':
        router.push(`/places/${item.id}`);
        break;
      case 'opportunity':
        router.push(`/opportunities/${item.id}`);
        break;
    }
  };

  const handleProductClick = (item: any) => {
    if (item.type === 'shop') {
      router.push(`/shops/${item.id}`);
    } else {
      router.push(`/marketplace/${item.id}`);
    }
  };

  const handleProfileClick = (profileId: number) => {
    router.push(`/profile/${profileId}`);
  };

  if (!isVisible) return null;

  const currentSponsored = combinedSponsored[sponsoredIndex];
  const currentProduct = combinedProducts[productsIndex];

  return (
    <aside style={{
      width: '250px',
      height: 'calc(100vh - 60px)',
      backgroundColor: '#f8f9fa',
      position: 'fixed',
      top: '60px',
      right: 0,
      padding: '1.5rem',
      overflowY: 'auto',
      boxSizing: 'border-box',
      flexShrink: 0
    }}>
      {/* Section 1: Événements, Lieux et Opportunités sponsorisés */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '0.9rem',
          color: '#666',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {currentSponsored.type === 'event' && <Calendar size={18} />}
          {currentSponsored.type === 'place' && <MapPin size={18} />}
          {currentSponsored.type === 'opportunity' && <Briefcase size={18} />}
          {currentSponsored.type === 'event' ? 'Événements sponsorisés' :
           currentSponsored.type === 'place' ? 'Lieux sponsorisés' :
           'Opportunités sponsorisées'}
        </h3>
        <div 
          onClick={() => handleSponsoredClick(currentSponsored)}
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '100%',
            height: '120px',
            position: 'relative',
            opacity: sponsoredTransitioning ? 0 : 1,
            transition: 'opacity 0.5s ease'
          }}>
            <img
              src={currentSponsored.image}
              alt={currentSponsored.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div style={{ 
            padding: '1rem',
            opacity: sponsoredTransitioning ? 0 : 1,
            transition: 'opacity 0.5s ease'
          }}>
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}>
              {currentSponsored.title}
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#666'
            }}>
              <MapPin size={14} />
              <span>{currentSponsored.location}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              previousSponsored();
            }}
            style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSponsored();
            }}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Section 2: Boutiques et Articles sponsorisés */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '0.9rem',
          color: '#666',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {currentProduct.type === 'shop' ? <Store size={18} /> : <ShoppingBag size={18} />}
          {currentProduct.type === 'shop' ? 'Boutiques sponsorisées' : 'Articles sponsorisés'}
        </h3>
        <div 
          onClick={() => handleProductClick(currentProduct)}
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '100%',
            height: '120px',
            position: 'relative',
            opacity: productsTransitioning ? 0 : 1,
            transition: 'opacity 0.5s ease'
          }}>
            <img
              src={currentProduct.image}
              alt={currentProduct.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div style={{ 
            padding: '1rem',
            opacity: productsTransitioning ? 0 : 1,
            transition: 'opacity 0.5s ease'
          }}>
            <h4 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}>
              {currentProduct.title}
            </h4>
            {currentProduct.type === 'product' ? (
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#1a1a1a'
              }}>
                {currentProduct.price}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#666'
              }}>
                <MapPin size={14} />
                <span>{currentProduct.location}</span>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              previousProduct();
            }}
            style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextProduct();
            }}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* Section 3: Profils sponsorisés */}
      <section>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          color: '#666',
          marginBottom: '1rem'
        }}>
          <User size={18} />
          Profils sponsorisés
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {sponsoredProfiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleProfileClick(profile.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden'
              }}>
                <img
                  src={profile.image}
                  alt={profile.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}>
                  {profile.name}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#666'
                }}>
                  {profile.role} • {profile.followers} abonnés
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}