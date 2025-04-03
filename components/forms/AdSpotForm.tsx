'use client';

import { useState, useRef } from 'react';
import { X, ImageIcon } from 'lucide-react';
import { useAdSpotForm } from '@/hooks/useAdSpotForm';
import FormLayout from './common/FormLayout';
import FormHeader from './common/FormHeader';
import FormError from './common/FormError';
import FormActions from './common/FormActions';

interface AdSpotFormProps {
  onClose: () => void;
  placeId?: string;
  shopId?: string;
}

interface MediaFile {
  file: File;
  caption: string;
}

export default function AdSpotForm({ onClose, placeId, shopId }: AdSpotFormProps) {
  const { submitAdSpot, isLoading, error } = useAdSpotForm();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newMediaFiles = files.map(file => ({
      file,
      caption: ''
    }));
    
    if (mediaFiles.length + newMediaFiles.length <= 10) {
      setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, caption: string) => {
    setMediaFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, caption } : file
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitAdSpot({
        media: mediaFiles,
        placeId,
        shopId
      });
      onClose();
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

  return (
    <FormLayout>
      <FormHeader 
        title="Créer un spot publicitaire"
        onClose={onClose}
      />
      <FormError error={error} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Médias ({mediaFiles.length}/10)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ImageIcon size={20} />
            <span>Ajouter des images ou vidéos</span>
          </button>

          {mediaFiles.length > 0 && (
            <div className="mt-4 space-y-4">
              {mediaFiles.map((media, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-32 h-32 relative rounded-lg overflow-hidden">
                      {media.file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(media.file)}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(media.file)}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={media.caption}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        placeholder="Ajouter une légende..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormActions
          onCancel={onClose}
          isSubmitting={isLoading}
          submitLabel="Créer le spot publicitaire"
        />
      </form>
    </FormLayout>
  );
}