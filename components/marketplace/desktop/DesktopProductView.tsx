'use client';

import { useState } from 'react';
import ProductHeader from './sections/ProductHeader';
import ProductActions from './sections/ProductActions';
import ProductStatistics from './sections/ProductStatistics';
import ProductShop from './sections/ProductShop';
import ProductDetails from './sections/ProductDetails';
import ProductComments from './sections/ProductComments';
import EditProductForm from '@/components/forms/EditProductForm';
import { getUserData } from '@/lib/storage';
import { Product } from '@/types/product';

interface DesktopProductViewProps {
  product: Product;
  isOwner: boolean;
  isShopFollowing: boolean;
  currentMediaIndex: number;
  onChangeMedia: (index: number) => void;
  onShare: () => void;
  onSponsor: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onToggleFollow: (newState: boolean) => void;
}

export default function DesktopProductView({
  product,
  isOwner,
  isShopFollowing,
  currentMediaIndex,
  onChangeMedia,
  onShare,
  onSponsor,
  onEdit,
  onDelete,
  onReport,
  onToggleFollow
}: DesktopProductViewProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);

  const handleEdit = () => {
    setShowEditForm(true);
  };

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

  return (
    <>
      <main className="flex-1 pt-[76px] mx-auto w-full max-w-[800px] transition-all">
        <div className="p-4">
          <ProductHeader
            name={currentProduct.name}
            price={currentProduct.price}
            media={currentProduct.media}
            currentIndex={currentMediaIndex}
            onChangeMedia={onChangeMedia}
          />

          <ProductActions
            productId={currentProduct._id}
            isOwner={isOwner}
            onSponsor={onSponsor}
            onEdit={handleEdit}
            onDelete={onDelete}
            onReport={onReport}
            onShare={onShare}
          />

          {isOwner ? (
            <ProductStatistics
              viewCount={currentProduct.views?.length || 0}
            />
          ) : currentProduct.shop && (
            <ProductShop
              shop={currentProduct.shop}
              isOwner={isOwner}
              isFollowing={isShopFollowing}
              onFollow={() => onToggleFollow(!isShopFollowing)}
            />
          )}

          <ProductDetails
            description={currentProduct.description}
          />

          <ProductComments productId={currentProduct._id} />
        </div>
      </main>

      {showEditForm && (
        <EditProductForm 
          product={currentProduct}
          onClose={handleEditComplete}
        />
      )}
    </>
  );
}