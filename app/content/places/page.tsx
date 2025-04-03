import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import PlacesList from '@/components/places/PlacesList';
import MainLayout from '@/components/MainLayout';

export default function PlacesPage() {
  return (
    <MainLayout>
      <Header />
      <Sidebar />
      <PlacesList />
      <RightSidebar />
    </MainLayout>
  );
}