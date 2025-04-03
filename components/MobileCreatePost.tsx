'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FcCalendar,
  FcGlobe,
  FcBriefcase,
  FcShop,
  FcPortraitMode,
  FcPicture,
  FcFullTrash,
  FcCheckmark
} from 'react-icons/fc';
import { usePostForm } from '@/hooks/usePostForm';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/lib/storage';
import EventForm from './forms/mobile/EventForm';
import PlaceForm from './forms/mobile/PlaceForm';
import OpportunityForm from './forms/mobile/OpportunityForm';
import ShopForm from './forms/mobile/ShopForm';

export default function MobileCreatePost() {
  const { submitPost, isLoading, error } = usePostForm();
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showPlaceForm, setShowPlaceForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    const userData = getUserData();
    if (!userData?.id || !userData.isVerified) {
      router.push('/auth/mobile/login');
      return;
    }
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
      router.push('/auth/mobile/login');
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
    { icon: <FcCalendar size={16} />, label: 'Évén.', onClick: () => handleFormOpen('event') },
    { icon: <FcGlobe size={16} />, label: 'Lieu', onClick: () => handleFormOpen('place') },
    { icon: <FcBriefcase size={16} />, label: 'Opp.', onClick: () => handleFormOpen('opportunity') },
    { icon: <FcShop size={16} />, label: 'Bout.', onClick: () => handleFormOpen('shop') }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
  <div className="p-2.5">
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
        <FcPortraitMode size={24} />
      </div>
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          placeholder="Publier quelque chose..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={handleFocus}
          className="w-full border border-gray-300 focus:border-primary outline-none resize-none p-2 rounded-lg text-sm placeholder:text-sm transition-all duration-150"
          style={{ height: isExpanded ? '80px' : '36px' }}
        />
        {isExpanded && (
          <>
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-1 mt-2.5">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-sm overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-0 right-0 bg-black/40 rounded-full p-1 hover:bg-black/60"
                    >
                      <FcFullTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center mt-2.5">
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
                className="flex items-center gap-1.5 p-1.5 hover:bg-gray-100 rounded-sm text-gray-600 text-sm"
              >
                <FcPicture size={18} />
                <span className="text-[10px]">({selectedFiles.length}/5)</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 border border-gray-300 rounded-sm hover:bg-gray-50 text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isLoading}
                  className="px-3 py-1.5 bg-primary text-white rounded-sm hover:bg-primary-hover transition-colors disabled:bg-gray-300 text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FcCheckmark size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>

  <div className={`${!isExpanded ? 'hidden sm:flex' : 'flex'} justify-between items-center p-1 sm:p-2`}>
    {actionButtons.map((button, index) => (
      <button
        key={index}
        onClick={button.onClick}
        className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 p-2 hover:bg-gray-100 rounded-sm transition-colors text-gray-600 text-sm"
      >
        {button.icon}
        <span className="text-[9px] sm:text-sm">{button.label}</span>
      </button>
    ))}
  </div>
</div>


      {showAuthDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAuthDialog(false)} />
          <div className="bg-white w-full m-4 rounded-xl p-4 relative z-50">
            <h3 className="text-lg font-bold mb-3">Connexion requise</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Pour ajouter du contenu sur Mall, vous devez être connecté à votre compte.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowAuthDialog(false);
                  router.push('/auth/mobile/login');
                }}
                className="w-full p-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                Continuer vers la connexion
              </button>
              <button
                onClick={() => setShowAuthDialog(false)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      )}

      {showEventForm && <EventForm onClose={() => setShowEventForm(false)} />}
      {showPlaceForm && <PlaceForm onClose={() => setShowPlaceForm(false)} />}
      {showOpportunityForm && <OpportunityForm onClose={() => setShowOpportunityForm(false)} />}
      {showShopForm && <ShopForm onClose={() => setShowShopForm(false)} />}
    </>
  );
}