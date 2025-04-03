'use client';

import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/storage';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostComments from './PostComments';
import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
  onPostUpdate: (updatedPost: any) => void;
}

export default function PostCard({ post, onPostUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [content, setContent] = useState(post.content);

  useEffect(() => {
    const recordView = async () => {
      const userData = getUserData();
      if (!userData?.id) return;

      try {
        await fetch(`/api/posts/${post._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id })
        });
      } catch (error) {
        console.error('Error recording view:', error);
      }
    };

    recordView();
  }, [post._id]);

  const handlePostUpdate = (updatedData: any) => {
    // Si la mise à jour concerne le contenu du post
    if (updatedData.content) {
      setContent(updatedData.content);
    }
    
    // Propager la mise à jour au composant parent
    onPostUpdate({
      ...updatedData,
      postId: post._id
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4">
        <PostHeader
          author={post.author}
          createdAt={post.createdAt}
          postId={post._id}
          content={content}
          onPostUpdate={handlePostUpdate}
        />

        <p className="text-gray-800 whitespace-pre-wrap mb-4">{content}</p>

        {post.media.length > 0 && (
          <PostMedia media={post.media} />
        )}

        <PostActions
          post={post}
          postId={post._id}
          likes={post.likes}
          commentCount={post.comments.length}
          onShowComments={() => setShowComments(!showComments)}
          onPostUpdate={handlePostUpdate}
        />
      </div>

      {showComments && (
        <PostComments
          postId={post._id}
          onPostUpdate={handlePostUpdate}
          post={post}
          onClose={() => setShowComments(false)}
        />
      )}
    </div>
  );
}