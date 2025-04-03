import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import ShopsList from '@/components/shops/ShopsList';
import MainLayout from '@/components/MainLayout';

export default function ShopsPage() {
  return (
    <MainLayout>
      <Header />
      <Sidebar />
      <ShopsList />
      <RightSidebar />
    </MainLayout>
  );
}