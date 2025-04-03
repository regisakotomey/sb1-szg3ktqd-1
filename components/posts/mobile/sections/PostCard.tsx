'use client';

import { useState } from 'react';
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

  return (
    <div className="bg-white">
      <div className="p-3">
        <PostHeader
          author={post.author}
          createdAt={post.createdAt}
          postId={post._id}
          onPostUpdate={onPostUpdate}
        />

        <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">{post.content}</p>

        {post.media.length > 0 && (
          <PostMedia media={post.media} />
        )}

        <PostActions
          author={post.author}
          createdAt={post.createdAt}
          postId={post._id}
          likes={post.likes}
          commentCount={post.comments.length}
          onShowComments={() => setShowComments(!showComments)}
          onPostUpdate={onPostUpdate}
        />
      </div>

      {showComments && (
        <PostComments
          postId={post._id}
          comments={post.comments}
          onPostUpdate={onPostUpdate}
        />
      )}
    </div>
  );
}