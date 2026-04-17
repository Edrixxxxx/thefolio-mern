import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const PostsPage = () => {
  const { user } = useContext(AuthContext);
  const myId = user?._id || user?.id;

  const [posts, setPosts] = useState([]);
  const [commentsByPost, setCommentsByPost] = useState({}); // { postId: Comment[] }
  const [commentText, setCommentText] = useState({});       // { postId: "text" }

  // create post
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // IMPORTANT: use "content" (your backend post.routes uses content)

  // edit post
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // edit comment (optional)
  // const [editingCommentId, setEditingCommentId] = useState(null);
  // const [editCommentBody, setEditCommentBody] = useState('');

  const [error, setError] = useState('');

  ////////////////////////////////////////////////////
  // FETCH POSTS
  ////////////////////////////////////////////////////
  const fetchPosts = async () => {
    try {
      const res = await axios.get('/posts');
      setPosts(res.data);
      return res.data;
    } catch (e) {
      setError('Failed to load posts');
      return [];
    }
  };

  ////////////////////////////////////////////////////
  // FETCH COMMENTS FOR ONE POST
  ////////////////////////////////////////////////////
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`/comments/post/${postId}`);
      setCommentsByPost((prev) => ({ ...prev, [postId]: res.data }));
    } catch (e) {
      console.log('fetchComments error:', e.response?.data || e.message);
    }
  };

  useEffect(() => {
    (async () => {
      const loadedPosts = await fetchPosts();
      // load comments for every post
      loadedPosts.forEach((p) => fetchComments(p._id));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  ////////////////////////////////////////////////////
  // CREATE POST
  ////////////////////////////////////////////////////
  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) return;

    try {
      await axios.post('/posts', { title, content }); // ✅ backend expects content
      setTitle('');
      setContent('');

      const loadedPosts = await fetchPosts();
      loadedPosts.forEach((p) => fetchComments(p._id));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create post');
    }
  };

  ////////////////////////////////////////////////////
  // EDIT POST (only if you have PUT /api/posts/:id)
  ////////////////////////////////////////////////////
  const startEditPost = (post) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content); // ✅ post.content
  };

  const saveEditPost = async (id) => {
    try {
      await axios.put(`/posts/${id}`, { title: editTitle, content: editContent });
      setEditingPostId(null);

      const loadedPosts = await fetchPosts();
      loadedPosts.forEach((p) => fetchComments(p._id));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to edit post');
    }
  };

  ////////////////////////////////////////////////////
  // DELETE POST (owner OR admin)
  ////////////////////////////////////////////////////
  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;

    try {
      await axios.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));

      // remove comments cache too
      setCommentsByPost((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to delete post');
    }
  };

  ////////////////////////////////////////////////////
  // LIKE (only if you have PUT /api/posts/:id/like)
  ////////////////////////////////////////////////////
  const handleLike = async (id) => {
    try {
      await axios.put(`/posts/${id}/like`);
      const loadedPosts = await fetchPosts();
      loadedPosts.forEach((p) => fetchComments(p._id));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to like');
    }
  };

  ////////////////////////////////////////////////////
  // ADD COMMENT (POST /api/comments { postId, body })
  ////////////////////////////////////////////////////
  const handleComment = async (postId) => {
    setError('');
    const body = (commentText[postId] || '').trim();
    if (!body) return;

    try {
      const res = await axios.post('/comments', { postId, body });

      // ✅ update UI immediately
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data],
      }));

      setCommentText((prev) => ({ ...prev, [postId]: '' }));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to comment');
    }
  };

  ////////////////////////////////////////////////////
  // DELETE COMMENT (owner OR admin) (DELETE /api/comments/:id)
  ////////////////////////////////////////////////////
  const deleteComment = async (postId, commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await axios.delete(`/comments/${commentId}`);

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c._id !== commentId),
      }));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to delete comment');
    }
  };

  ////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////
  return (
    <main className="container">
      <section className="content-section">
        <h1>Community Posts</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* CREATE POST */}
        <form onSubmit={handleCreatePost}>
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="btn" type="submit">Create Post</button>
        </form>

        <hr style={{ margin: '2rem 0' }} />

        {/* POSTS */}
        {posts.map((post) => {
          const postAuthorId = post.author?._id || post.author;
          const isOwner = myId && String(postAuthorId) === String(myId);
          const isAdmin = user?.role === 'admin';
          const canManagePost = isOwner || isAdmin;

          const comments = commentsByPost[post._id] || [];

          return (
            <div key={post._id} style={{ marginBottom: '2rem' }}>
              {/* EDIT MODE */}
              {editingPostId === post._id ? (
                <>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <button className="btn" style={{ width: 'auto' }} onClick={() => saveEditPost(post._id)}>
                    Save
                  </button>
                </>
              ) : (
                <>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </>
              )}

              <small>
                By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleString()}
              </small>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                <button className="btn" style={{ width: 'auto' }} onClick={() => handleLike(post._id)}>
                  ❤️ {post.likes?.length || 0}
                </button>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                  {canManagePost && (
                    <>
                      <button className="btn" style={{ width: 'auto' }} onClick={() => startEditPost(post)}>
                        Edit
                      </button>
                      <button className="btn" style={{ width: 'auto', background: '#e74c3c' }} onClick={() => deletePost(post._id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* COMMENTS */}
              <div style={{ marginTop: '1.5rem' }}>
                <strong>Comments</strong>

                {comments.length === 0 ? (
                  <p style={{ color: '#666', marginTop: '0.5rem' }}>No comments yet.</p>
                ) : (
                  comments.map((comment) => {
                    const commentAuthorId = comment.author?._id || comment.author;
                    const isCommentOwner = myId && String(commentAuthorId) === String(myId);
                    const canManageComment = isCommentOwner || isAdmin;

                    return (
                      <div
                        key={comment._id}
                        style={{
                          background: '#f9f9f9',
                          padding: '0.75rem',
                          borderRadius: '6px',
                          marginTop: '0.5rem'
                        }}
                      >
                        <strong>{comment.author?.name || 'User'}:</strong> {comment.body}

                        {canManageComment && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                              className="btn"
                              style={{ width: 'auto', background: '#e74c3c' }}
                              onClick={() => deleteComment(post._id, comment._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* ADD COMMENT */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[post._id] || ''}
                    onChange={(e) =>
                      setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    style={{ flex: 1 }}
                  />
                  <button className="btn" style={{ width: 'auto' }} onClick={() => handleComment(post._id)}>
                    Comment
                  </button>
                </div>
              </div>

              <hr style={{ marginTop: '2rem' }} />
            </div>
          );
        })}
      </section>
    </main>
  );
};

export default PostsPage;