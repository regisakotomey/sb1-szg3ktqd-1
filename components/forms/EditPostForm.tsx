'use client';

import { useState } from 'react';
import { Post } from '@/types/post';
import { usePostForm } from '@/hooks/usePostForm';
import FormLayout from './common/FormLayout';
import FormHeader from './common/FormHeader';
import FormError from './common/FormError';
import FormActions from './common/FormActions';
import MultipleImageUpload from './common/MultipleImageUpload';

interface EditPostFormProps {
  post: Post;
  onClose: () => void;
}

export default function EditPostForm({ post, onClose }: EditPostFormProps) {
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
    <FormLayout>
      <FormHeader 
        title="Modifier la publication"
        onClose={onClose}
      />
      <FormError error={error} />

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Contenu */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-700 mb-2">
            Contenu *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2.5 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[150px] resize-y"
            placeholder="Que voulez-vous partager ?"
            required
          />
        </div>

        {/* Images */}
        <MultipleImageUpload
          label="Photos"
          images={selectedFiles}
          onImagesSelect={(files) => setSelectedFiles(prev => [...prev, ...files])}
          onImageRemove={handleImageRemove}
          maxImages={5}
          className="mb-6"
          currentImages={currentMedia}
        />

        {/* Actions */}
        <FormActions
          onCancel={onClose}
          isSubmitting={isLoading}
          submitLabel="Modifier la publication"
        />
      </form>
    </FormLayout>
  );
}