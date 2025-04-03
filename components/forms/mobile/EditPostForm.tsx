'use client';

import { useState } from 'react';
import { Post } from '@/types/post';
import { usePostForm } from '@/hooks/usePostForm';
import MobileFormLayout from './common/MobileFormLayout';
import MobileFormHeader from './common/MobileFormHeader';
import MobileFormError from './common/MobileFormError';
import MobileFormActions from './common/MobileFormActions';
import MobileMultipleImageUpload from './common/MobileMultipleImageUpload';

interface EditPostFormProps {
  post: Post;
  onClose: () => void;
  onPostUpdate: (updatedPost: any) => void;
}

export default function EditPostForm({ post, onClose, onPostUpdate }: EditPostFormProps) {
  const { updatePost, isLoading, error } = usePostForm();
  const [content, setContent] = useState(post.content);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentMedia, setCurrentMedia] = useState<string[]>(post.media);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const formData = new FormData();
      formData.append('postId', post._id);
      formData.append('userId', post.userId);
      formData.append('content', content);
      
      // Add current media URLs
      formData.append('currentMedia', JSON.stringify(currentMedia));

      // Add new media files
      selectedFiles.forEach(file => {
        formData.append('media', file);
      });

      await updatePost(formData);
      onPostUpdate({
        postId: post._id,
        content,
        media: [...currentMedia, ...selectedFiles.map(file => URL.createObjectURL(file))]
      });
      onClose();
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  const handleImageRemove = (index: number, isExisting?: boolean) => {
    if (isExisting) {
      setCurrentMedia(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <MobileFormLayout>
      <MobileFormHeader 
        title="Modifier la publication"
        onClose={onClose}
      />
      <MobileFormError error={error} />

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {/* Contenu */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Contenu *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 text-sm placeholder:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent leading-tight min-h-[120px] resize-none"
              placeholder="Que voulez-vous partager ?"
              required
            />
          </div>

          {/* Images */}
          <MobileMultipleImageUpload
            label="Photos"
            images={selectedFiles}
            onImagesSelect={(files) => setSelectedFiles(prev => [...prev, ...files])}
            onImageRemove={handleImageRemove}
            maxImages={5}
            currentImages={currentMedia}
          />
        </div>
      </form>

      <MobileFormActions
        onCancel={onClose}
        isSubmitting={isLoading}
        submitLabel="Modifier la publication"
        onSubmit={handleSubmit}
      />
    </MobileFormLayout>
  );
}