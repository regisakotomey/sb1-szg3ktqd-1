import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProductsList from '@/components/marketplace/ProductsList';
import MainLayout from '@/components/MainLayout';

export default function MarketplacePage() {
  return (
    <MainLayout>
      <Header />
      <Sidebar />
      <ProductsList />
    </MainLayout>
  );
}