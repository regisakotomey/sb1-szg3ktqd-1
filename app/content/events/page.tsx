import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import EventsList from '@/components/events/EventsList';
import MainLayout from '@/components/MainLayout';

export default function EventsPage() {
  return (
    <MainLayout>
      <Header />
      <Sidebar />
      <EventsList />
      <RightSidebar />
    </MainLayout>
  );
}