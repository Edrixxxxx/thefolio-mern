import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState('');

  ////////////////////////////////////////////////////
  // ✅ PROTECT - REDIRECT IF NOT ADMIN
  ////////////////////////////////////////////////////
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  ////////////////////////////////////////////////////
  // ✅ FETCH DATA (ROBUST VERSION)
  ////////////////////////////////////////////////////
  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get('/admin/users'),
        axios.get('/admin/posts'),
        axios.get('/admin/comments'),
        axios.get('/admin/contacts'),
      ]);

      const [usersRes, postsRes, commentsRes, contactsRes] = results;

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      else console.error('❌ users failed:', usersRes.reason?.response?.data || usersRes.reason);

      if (postsRes.status === 'fulfilled') setPosts(postsRes.value.data);
      else console.error('❌ posts failed:', postsRes.reason?.response?.data || postsRes.reason);

      if (commentsRes.status === 'fulfilled') setComments(commentsRes.value.data);
      else console.error('❌ comments failed:', commentsRes.reason?.response?.data || commentsRes.reason);

      if (contactsRes.status === 'fulfilled') setContacts(contactsRes.value.data);
      else console.error('❌ contacts failed:', contactsRes.reason?.response?.data || contactsRes.reason);

      // Show first error message if any failed
      const firstFail = results.find(r => r.status === 'rejected');
      if (firstFail) {
        const msg = firstFail.reason?.response?.data?.error || 'Failed to load some data. Check console.';
        setMessage(msg);
      } else {
        setMessage('');
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to load admin data');
    }
  };

  ////////////////////////////////////////////////////
  // ✅ TOGGLE USER STATUS
  ////////////////////////////////////////////////////
  const toggleStatus = async (id) => {
    try {
      const res = await axios.put(`/admin/users/${id}/status`);
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  };

  ////////////////////////////////////////////////////
  // ✅ DELETE USER
  ////////////////////////////////////////////////////
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their content?')) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      setMessage('User deleted');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  };

  ////////////////////////////////////////////////////
  // ✅ DELETE POST
  ////////////////////////////////////////////////////
  const deletePost = async (id) => {
    if (!window.confirm('Remove this post?')) return;
    try {
      await axios.delete(`/admin/posts/${id}`);
      setMessage('Post removed');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  };

  ////////////////////////////////////////////////////
  // ✅ DELETE COMMENT
  ////////////////////////////////////////////////////
  const deleteComment = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/admin/comments/${id}`);
      setMessage('Comment deleted');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  };

  ////////////////////////////////////////////////////
  // ✅ MARK CONTACT AS READ
  ////////////////////////////////////////////////////
  const markContactRead = async (id) => {
    try {
      await axios.put(`/admin/contacts/${id}/read`);
      setMessage('Marked as read');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  };

  ////////////////////////////////////////////////////
  // ✅ DELETE CONTACT
  ////////////////////////////////////////////////////
  const deleteContact = async (id) => {
    if (!window.confirm('Delete this contact message?')) return;
    try {
      await axios.delete(`/admin/contacts/${id}`);
      setMessage('Message deleted');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <main className="container">
      <section className="content-section">
        <h1>Admin Dashboard</h1>

        {message && (
          <p style={{ color: message.toLowerCase().includes('fail') ? 'red' : 'green' }}>
            {message}
          </p>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button className="btn" style={{ width: 'auto', background: activeTab === 'users' ? '#4e2c50' : '#999' }} onClick={() => setActiveTab('users')}>
            Users ({users.length})
          </button>
          <button className="btn" style={{ width: 'auto', background: activeTab === 'posts' ? '#4e2c50' : '#999' }} onClick={() => setActiveTab('posts')}>
            Posts ({posts.length})
          </button>
          <button className="btn" style={{ width: 'auto', background: activeTab === 'comments' ? '#4e2c50' : '#999' }} onClick={() => setActiveTab('comments')}>
            Comments ({comments.length})
          </button>
          <button className="btn" style={{ width: 'auto', background: activeTab === 'contacts' ? '#4e2c50' : '#999' }} onClick={() => setActiveTab('contacts')}>
            Contacts ({contacts.length})
          </button>
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <h2>All Users</h2>
            {users.map((u) => (
              <div key={u._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{u.name}</strong>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#666' }}>{u.email}</p>
                  <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '20px', background: u.status === 'active' ? '#2ecc71' : '#e74c3c', color: 'white' }}>
                    {u.status}
                  </span>
                  {u.role === 'admin' && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '20px', background: '#3498db', color: 'white' }}>
                      admin
                    </span>
                  )}
                </div>

                {u.role !== 'admin' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" style={{ width: 'auto', padding: '6px 12px', background: u.status === 'active' ? '#e67e22' : '#2ecc71' }} onClick={() => toggleStatus(u._id)}>
                      {u.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn" style={{ width: 'auto', padding: '6px 12px', background: '#e74c3c' }} onClick={() => deleteUser(u._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === 'posts' && (
          <div>
            <h2>All Posts</h2>
            {posts.map((p) => (
              <div key={p._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.title}</strong>
                  <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#666' }}>By {p.author?.name}</p>
                  <small>{new Date(p.createdAt).toLocaleString()}</small>
                </div>
                <button className="btn" style={{ width: 'auto', padding: '6px 12px', background: '#e74c3c' }} onClick={() => deletePost(p._id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === 'comments' && (
          <div>
            <h2>All Comments</h2>
            {comments.map((c) => (
              <div key={c._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0 }}>{c.body}</p>
                  <small style={{ color: '#666' }}>By {c.author?.name} on "{c.post?.title}"</small>
                </div>
                <button className="btn" style={{ width: 'auto', padding: '6px 12px', background: '#e74c3c' }} onClick={() => deleteComment(c._id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
          <div>
            <h2>Contact Messages</h2>

            {contacts.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              contacts.map((m) => (
                <div key={m._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <strong>{m.name}</strong> <span style={{ color: '#666' }}>({m.email})</span>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                      <div style={{ marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>
                        {m.message}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        background: m.status === 'new' ? '#e67e22' : '#2ecc71',
                        color: '#fff',
                        textAlign: 'center'
                      }}>
                        {m.status}
                      </span>

                      {m.status === 'new' && (
                        <button className="btn" style={{ width: 'auto' }} onClick={() => markContactRead(m._id)}>
                          Mark Read
                        </button>
                      )}
                      <button className="btn" style={{ width: 'auto', background: '#e74c3c' }} onClick={() => deleteContact(m._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminPage;