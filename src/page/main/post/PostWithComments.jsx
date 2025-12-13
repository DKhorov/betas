import React, { useState, useMemo, useCallback, memo } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import PostHeader from './PostHeader';
import PostText from './PostText';
import PostPhoto from './PostPhoto';
import CommentSection from '../../../components/CommentSection';
import axios from '../../../system/axios';
import { FiMessageSquare, FiThumbsUp, FiThumbsDown } from "react-icons/fi";

const PostWithComments = memo(({ post, onDelete, onPostUpdate }) => {
    const [hovered, setHovered] = useState(null); 

  const safePost = useMemo(() => ({
    ...post,
    user: post?.user || {},
    likes: { count: post.likes?.count || 0, users: post.likes?.users || [] },
    dislikes: { count: post.dislikes?.count || 0, users: post.dislikes?.users || [] },
    commentsCount: post?.commentsCount || 0
  }), [post]);

  const [localLikes, setLocalLikes] = useState(safePost.likes.count);
  const [localDislikes, setLocalDislikes] = useState(safePost.dislikes.count);
  const [localCommentsCount, setLocalCommentsCount] = useState(safePost.commentsCount);
  const [showComments, setShowComments] = useState(false);

  const userId = localStorage.getItem('userId');

  const [userReaction, setUserReaction] = useState(() => {
    if (!userId) return null;
    if (safePost.likes.users.includes(userId)) return 'like';
    if (safePost.dislikes.users.includes(userId)) return 'dislike';
    return null;
  });

  const handleReaction = useCallback(async (type) => {
    if (type === 'like') {
      setLocalLikes(prev => userReaction === 'like' ? prev - 1 : prev + 1);
      if (userReaction === 'dislike') setLocalDislikes(prev => prev - 1);
      setUserReaction(userReaction === 'like' ? null : 'like');
    } else {
      setLocalDislikes(prev => userReaction === 'dislike' ? prev - 1 : prev + 1);
      if (userReaction === 'like') setLocalLikes(prev => prev - 1);
      setUserReaction(userReaction === 'dislike' ? null : 'dislike');
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || !safePost._id) return;

      const endpoint = `posts/${safePost._id}/${type}`;
      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.post) {
        onPostUpdate({
  ...safePost,                
  ...response.data.post,      
  user: safePost.user
});

      }
    } catch (error) {
      console.error(`Ошибка ${type}:`, error);
      if (type === 'like') {
        setLocalLikes(prev => userReaction === 'like' ? prev + 1 : prev - 1);
        if (userReaction === 'dislike') setLocalDislikes(prev => prev + 1);
      } else {
        setLocalDislikes(prev => userReaction === 'dislike' ? prev + 1 : prev - 1);
        if (userReaction === 'like') setLocalLikes(prev => prev + 1);
      }
      setUserReaction(userReaction);
    }
  }, [userReaction, safePost._id, safePost.user, onPostUpdate]);

  const handleCommentClick = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  const handleCommentCountUpdate = useCallback((newCount) => {
    if (onPostUpdate) {
      onPostUpdate({
        ...post,
        commentsCount: newCount,
        user: safePost.user 
      });
    }
    setLocalCommentsCount(newCount);
  }, [post, safePost.user, onPostUpdate]);

  const commentsText = useMemo(() => {
    const count = localCommentsCount;
    if (!count || count === 0) return 'Нет комментариев';
    if (count % 10 === 1 && count % 100 !== 11) return `${count} комментарий`;
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} комментария`;
    return `${count} комментариев`;
  }, [localCommentsCount]);

  return (
    <Box sx={{
     backgroundColor: "var(--theme-surface)",
    border: "1px solid var(--theme-border)",
      borderRadius: 4,
      mb: 0,
      position: 'relative',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      p: 2,
      pb: 1.5,
      '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.2)' },
    }}>
      <PostHeader
        post={post}
        onDelete={onDelete}
        onPostUpdate={onPostUpdate}
        onCommentClick={handleCommentClick}
      />
<PostText postId={post._id} >
      {post.title || 'Этот пост не имеет текст :/'}
    </PostText>
      

{(post.imageUrl || post.videoUrl) && <PostPhoto post={post} sx={{ mb: 1 }} />}
     

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', mt: 2 ,ml:1,mb:1}}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleCommentClick}>
          <FiMessageSquare 
            style={{ fontSize: 25, color: showComments ? '#42a5f5' : 'rgba(84, 163, 247, 1)', marginRight: 8 }} 
          />
          <Typography sx={{ fontSize: '13px', color: showComments ? '#42a5f5' : 'rgba(84, 163, 247, 1)' }}>
            {commentsText}
          </Typography>
        </Box>

       <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: '40px',
          height: '40px',
          borderRadius: '100px',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mr: 2,
          position: 'relative',
          cursor:'pointer'
        }}
        onClick={() => handleReaction('like')}
        onMouseEnter={() => setHovered('like')}
        onMouseLeave={() => setHovered(null)}
      >
          <Typography sx={{ fontWeight: 'bold', color: '#42a5f5',fontSize:'15px' ,fontFamily:'sf',cursor:'pointer'}}>
            {localLikes}
          </Typography>
      
      </Box>

      <Box
        sx={{
          width: '40px',
          height: '40px',
          borderRadius: '100px',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
                onClick={() => handleReaction('dislike')}

        onMouseEnter={() => setHovered('dislike')}
        onMouseLeave={() => setHovered(null)}
      >
          <Typography sx={{ fontWeight: 'bold', color: '#f44336',fontSize:'15px' ,fontFamily:'sf' ,cursor:'pointer' }}>
            {localDislikes}
          </Typography>
      
         
      </Box>
    </Box>
      </Box>

      {showComments && (
        <CommentSection
          postId={post._id}
          postAuthorId={post.user._id}
          onCommentCountUpdate={handleCommentCountUpdate}
        />
      )}
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.post._id === nextProps.post._id &&
    prevProps.post.likes?.count === nextProps.post.likes?.count &&
    prevProps.post.dislikes?.count === nextProps.post.dislikes?.count &&
    prevProps.post.commentsCount === nextProps.post.commentsCount &&
    prevProps.post.imageUrl === nextProps.post.imageUrl &&
    // 🛑 ИСПРАВЛЕНИЕ 2: Добавили проверку videoUrl для memo
    prevProps.post.videoUrl === nextProps.post.videoUrl
  );
});

PostWithComments.displayName = 'PostWithComments';

export default PostWithComments;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/