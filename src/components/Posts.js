import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Posts = () => {
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load posts');
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`/comments/post/${postId}`);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.log('Fetch comments error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Load comments whenever posts change
  useEffect(() => {
    posts.forEach((p) => fetchComments(p._id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const handleAddComment = async (postId) => {
    setCommentError('');
    const body = (commentInputs[postId] || '').trim();

    if (!body) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    try {
      await axios.post('/comments', { postId, body });

      // ✅ safest: refetch comments so UI matches DB
      await fetchComments(postId);

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.log('Add comment error:', err.response?.data || err.message);
      setCommentError(err.response?.data?.error || 'Failed to comment');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>Posts</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {commentError && <p style={{ color: 'red' }}>{commentError}</p>}

      {posts.map((post) => {
        const comments = commentsByPost[post._id] || [];

        return (
          <div key={post._id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>

            <div style={{ marginTop: '1rem' }}>
              <h4>Comments</h4>

              {comments.length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <b>{c.author?.name || 'User'}:</b> {c.body}
                  </div>
                ))
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({ ...prev, [post._id]: e.target.value }))
                  }
                  style={{ flex: 1, padding: 10 }}
                />
                <button onClick={() => handleAddComment(post._id)}>
                  Comment
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Posts;