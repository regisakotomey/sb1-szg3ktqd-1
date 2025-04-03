import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import OpportunitiesList from '@/components/opportunities/OpportunitiesList';
import MainLayout from '@/components/MainLayout';

export default function OpportunitiesPage() {
  return (
    <MainLayout>
      <Header />
      <Sidebar />
      <OpportunitiesList />
      <RightSidebar />
    </MainLayout>
  );
}