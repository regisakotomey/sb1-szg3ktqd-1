'use client';

import Header from '@/components/Header';
import MainLayout from '@/components/MainLayout';
import MessagingInterface from '@/components/messaging/MessagingInterface';
import Sidebar from '@/components/Sidebar';

export default function MessagesPage() {
  return (
    <MainLayout>
      <Header />
      <Sidebar />
      <div className="flex-1 pt-[76px] ml-[250px] p-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-100px)]">
          <MessagingInterface />
        </div>
      </div>
    </MainLayout>
  );
}