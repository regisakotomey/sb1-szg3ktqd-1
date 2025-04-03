import Header from '@/components/Header';
import ProductDetails from '@/components/marketplace/ProductDetails';
import MainLayout from '@/components/MainLayout';

// This is required for static site generation with dynamic routes
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ];
}

export default function ProductPage() {
  return (
    <MainLayout>
      <Header />
      <ProductDetails />
    </MainLayout>
  );
}