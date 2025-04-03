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
import EventForm from './forms/EventForm';
import PlaceForm from './forms/PlaceForm';
import OpportunityForm from './forms/OpportunityForm';
import ShopForm from './forms/ShopForm';

export default function DesktopCreatePost() {
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
      setShowAuthDialog(true);
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
      router.push('/auth/desktop/login');
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
    { icon: <FcCalendar size={20} />, label: 'Événement', onClick: () => handleFormOpen('event') },
    { icon: <FcGlobe size={20} />, label: 'Lieu', onClick: () => handleFormOpen('place') },
    { icon: <FcBriefcase size={20} />, label: 'Opportunité', onClick: () => handleFormOpen('opportunity') },
    { icon: <FcShop size={20} />, label: 'Boutique', onClick: () => handleFormOpen('shop') }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-md mb-4 overflow-hidden">
      <div className="p-3">
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FcPortraitMode size={24} />
          </div>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              placeholder="Publier quelque chose..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              className="w-full border border-gray-300 focus:border-primary outline-none resize-none p-2 rounded-lg text-md placeholder:text-md transition-all duration-150"
              style={{ height: isExpanded ? '100px' : '42px' }}
            />
            {isExpanded && (
              <>
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-5 gap-1 mt-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-0 right-0 bg-black/40 rounded-full p-1 hover:bg-black/60"
                        >
                          <FcFullTrash size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center mt-3">
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
                    className="flex items-center gap-1.5 p-2 hover:bg-gray-100 rounded-md text-gray-600 text-md"
                  >
                    <FcPicture size={18} />
                    <span className="text-md">Image/Vidéo ({selectedFiles.length}/5)</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-md"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!content.trim() || isLoading}
                      className="px-3 py-1.5 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-300 text-md"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Publier'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-2">
        {actionButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.onClick}
            className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors text-gray-600 text-md"
          >
            {button.icon}
            <span className="text-md">{button.label}</span>
          </button>
        ))}
      </div>
</div>


      {showAuthDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAuthDialog(false)} />
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative z-50">
            <h3 className="text-xl font-bold mb-4">Connexion requise</h3>
            <p className="text-gray-600 mb-6">
              Pour ajouter du contenu sur Mall, vous devez être connecté à votre compte.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowAuthDialog(false);
                  router.push('/auth/login');
                }}
                className="w-full p-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Continuer vers la connexion
              </button>
              <button
                onClick={() => setShowAuthDialog(false)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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