import AdSpotDetails from '@/components/ads/AdSpotDetails';
import Header from '@/components/Header';
import MainLayout from '@/components/MainLayout';

// Pour la génération statique avec routes dynamiques
export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' }
  ];
}

export default function AdSpotPage() {
  return (
    <MainLayout>
      <Header />
      <AdSpotDetails />
    </MainLayout>
  );
}