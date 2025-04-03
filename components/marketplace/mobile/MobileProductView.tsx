'use client';

import { ChevronLeft, Share2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import ProductHeader from './sections/ProductHeader';
import ProductActions from './sections/ProductActions';
import ProductStatistics from './sections/ProductStatistics';
import ProductShop from './sections/ProductShop';
import ProductDetails from './sections/ProductDetails';
import ProductComments from './sections/ProductComments';
import ProductBottomBar from './sections/ProductBottomBar';
import ProductMenu from './sections/ProductMenu';
import EditProductForm from '@/components/forms/mobile/EditProductForm';
import { getUserData } from '@/lib/storage';
import { Product } from '@/types/product';

interface MobileProductViewProps {
  product: Product;
  isOwner: boolean;
  isShopFollowing: boolean;
  activeTab: 'details' | 'comments';
  onTabChange: (tab: 'details' | 'comments') => void;
  onBack: () => void;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
}

export default function MobileProductView({
  product,
  isOwner,
  isShopFollowing,
  activeTab,
  onTabChange,
  onBack,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleFollow
}: MobileProductViewProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);

  const handleEditComplete = async () => {
    try {
      const userData = getUserData();
      const response = await fetch(`/api/products/get?id=${product._id}&currentUserId=${userData?.id || ''}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du produit');
      }
      const updatedProduct = await response.json();
      setCurrentProduct(updatedProduct);
    } catch (error) {
      console.error('Error refreshing product data:', error);
    }
    setShowEditForm(false);
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setShowMenu(false);
  };

  if (showEditForm) {
    return <EditProductForm product={currentProduct} onClose={handleEditComplete} />;
  }

  return (
    <main className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="flex items-center h-14 px-4">
        <button 
          onClick={onBack}
          className="hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="flex-1 text-lg font-semibold truncate ml-2">
          {currentProduct.name}
        </h1>
        <button
          onClick={() => setShowMenu(true)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Image and Content */}
        <ProductHeader product={currentProduct} />

        {/* Navigation Tabs */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-40">
          <div className="flex">
            <button
              onClick={() => onTabChange('details')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Détails
            </button>
            <button
              onClick={() => onTabChange('comments')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'comments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Commentaires
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <div className="space-y-4">
            {isOwner ? (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Statistiques</h3>
                <ProductStatistics
                  viewCount={currentProduct.views?.length || 0}
                />
              </div>
            ) : currentProduct.shop && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3">Vendu par</h3>
                <ProductShop
                  shop={currentProduct.shop}
                  isOwner={isOwner}
                  isFollowing={isShopFollowing}
                  onFollow={() => onToggleFollow(!isShopFollowing)}
                />
              </div>
            )}

            <ProductDetails product={currentProduct} />
          </div>
        ) : (
          <div className="p-4">
            <ProductComments productId={currentProduct._id} />
          </div>
        )}

        {/* Add bottom padding to account for the fixed bottom bar */}
        <div className="h-20"></div>
      </div>

      {/* Fixed Bottom Bar */}
      <ProductBottomBar
        productId={currentProduct._id}
        isOwner={isOwner}
        price={currentProduct.price}
      />

      {/* Menu */}
      <ProductMenu
        isOpen={showMenu}
        isOwner={isOwner}
        productId={currentProduct._id}
        onClose={() => setShowMenu(false)}
        onShare={onShare}
        onEdit={handleEdit}
        onDelete={onDelete}
        onReport={onReport}
      />
    </main>
  );
}