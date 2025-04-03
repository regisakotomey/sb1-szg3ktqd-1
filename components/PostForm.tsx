'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Briefcase, Store, UserCircle2, ImageIcon, X } from 'lucide-react';
import { usePostForm } from '@/hooks/usePostForm';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import EventForm from './forms/EventForm';
import PlaceForm from './forms/PlaceForm';
import OpportunityForm from './forms/OpportunityForm';
import ShopForm from './forms/ShopForm';

export default function PostForm() {
  const { submitPost, isLoading, error } = usePostForm();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setSelectedFiles([]);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length <= 5) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const checkAuth = () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/login');
      return false;
    }
    return userData.isVerified;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await submitPost({
        content,
        media: selectedFiles
      });
      
      // Reset form
      handleCancel();

      // Dispatch custom event to notify PostFeed
      window.dispatchEvent(new CustomEvent('postCreated'));
    } catch (err) {
      console.error('Error submitting post:', err);
    }
  };

  const handleFormOpen = (formType: string) => {
    if (!checkAuth()) {
      return;
    }

    switch (formType) {
      case 'event':
        setShowEventForm(true);
        break;
      case 'place':
        setShowPlaceForm(true);
        break;
      case 'opportunity':
        setShowOpportunityForm(true);
        break;
      case 'shop':
        setShowShopForm(true);
        break;
    }
  };

  const actionButtons = [
    { icon: <Calendar size={20} />, label: 'Événement', onClick: () => handleFormOpen('event') },
    { icon: <MapPin size={20} />, label: 'Lieu', onClick: () => handleFormOpen('place') },
    { icon: <Briefcase size={20} />, label: 'Opportunité', onClick: () => handleFormOpen('opportunity') },
    { icon: <Store size={20} />, label: 'Boutique', onClick: () => handleFormOpen('shop') }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
        <div className="p-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle2 size={24} />
            </div>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                placeholder="Publier une annonce..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={handleFocus}
                className="w-full border border-gray-200 outline-none resize-none p-3 rounded-xl text-[15px] transition-all duration-200"
                style={{ height: isExpanded ? '100px' : '40px' }}
              />
              {isExpanded && (
                <>
                  {selectedFiles.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-black/50 rounded-full p-1 hover:bg-black/70"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <ImageIcon size={20} />
                      <span className="text-sm">Image/Vidéo ({selectedFiles.length}/5)</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isLoading}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-300 text-sm"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : 'Publier'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={`${!isExpanded ? 'hidden sm:flex' : 'flex'} justify-between items-center p-2 sm:p-3`}>
          {actionButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
            >
              {button.icon}
              <span className="text-xs sm:text-sm">{button.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showEventForm && <EventForm onClose={() => setShowEventForm(false)} />}
      {showPlaceForm && <PlaceForm onClose={() => setShowPlaceForm(false)} />}
      {showOpportunityForm && <OpportunityForm onClose={() => setShowOpportunityForm(false)} />}
      {showShopForm && <ShopForm onClose={() => setShowShopForm(false)} />}
    </>
  );
}