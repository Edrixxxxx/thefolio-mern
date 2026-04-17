import React, { useContext, useEffect, useState } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, refreshMe } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState('');

  ////////////////////////////////////////////////////
  // LOAD DATA
  ////////////////////////////////////////////////////
  useEffect(() => {
    const load = async () => {
      try {
        const postsRes = await axios.get('/users/me/posts');
        const commentsRes = await axios.get('/users/me/comments');

        setPosts(postsRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error(err);
        setMessage('Failed to load profile data.');
      }
    };

    load();
  }, []);

  ////////////////////////////////////////////////////
  // AVATAR
  ////////////////////////////////////////////////////
  const handleAvatarClick = () => {
    document.getElementById('avatarInput')?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
    setMessage('');
  };

  const uploadAvatar = async () => {
    if (!avatar) {
      setMessage('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      await axios.put('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('✅ Avatar updated successfully!');
      setAvatar(null);
      setPreview(null);

      // Refresh user (updates profilePic in context + localStorage)
      await refreshMe();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || 'Upload failed');
    }
  };

  ////////////////////////////////////////////////////
  // PASSWORD
  ////////////////////////////////////////////////////
  const changePassword = async () => {
    try {
      if (!currentPassword || !newPassword) {
        setMessage('Both fields are required.');
        return;
      }
      if (newPassword.length < 6) {
        setMessage('New password must be at least 6 characters.');
        return;
      }

      await axios.put('/users/me/password', {
        currentPassword,
        newPassword
      });

      setMessage('✅ Password changed. Please login again.');
      setCurrentPassword('');
      setNewPassword('');
      setActivePanel(null);
      setShowMenu(false);

      // Force logout then go to login
      logout();
      navigate('/login');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to change password');
    }
  };

  ////////////////////////////////////////////////////
  // DELETE
  ////////////////////////////////////////////////////
  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;

    try {
      await axios.delete('/users/me');
      logout();
      navigate('/register');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete account');
    }
  };

  const avatarSrc = preview
    ? preview
    : user?.profilePic
      ? `http://localhost:5000/uploads/${user.profilePic}`
      : '/default-avatar.png';

  ////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////
  return (
    <main className="container">
      <section className="content-section">

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* AVATAR */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleAvatarClick}>
              <img
                src={avatarSrc}
                alt="avatar"
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #4e2c50'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#4e2c50',
                color: 'white',
                borderRadius: '50%',
                padding: '6px',
                fontSize: '0.8rem'
              }}>✏️</div>
            </div>

            <h1>My Profile</h1>
          </div>

          {/* SETTINGS BUTTON */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn"
              style={{ width: 'auto' }}
              onClick={() => setShowMenu((s) => !s)}
            >
              ⚙️ Settings
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                marginTop: '0.5rem',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                minWidth: '200px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 10
              }}>
                <button
                  onClick={() => {
                    setActivePanel('password');
                    setShowMenu(false);
                    setMessage('');
                  }}
                  style={menuStyle}
                >
                  🔑 Change Password
                </button>

                <button
                  onClick={() => {
                    setActivePanel('delete');
                    setShowMenu(false);
                    setMessage('');
                  }}
                  style={{ ...menuStyle, color: 'red', borderBottom: 'none' }}
                >
                  🗑️ Delete Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HIDDEN FILE INPUT */}
        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />

        {/* MESSAGE */}
        {message && (
          <p style={{
            color: message.includes('✅') ? 'green' : 'red',
            margin: '1rem 0'
          }}>
            {message}
          </p>
        )}

        {/* AVATAR UPLOAD PANEL */}
        {avatar && activePanel === null && (
          <div style={{ marginTop: '1rem' }}>
            <p>Selected: {avatar.name}</p>
            <button className="btn" style={{ width: 'auto' }} onClick={uploadAvatar}>
              Save New Avatar
            </button>
            <button
              className="btn"
              style={{ width: 'auto', background: '#999', marginLeft: '0.5rem' }}
              onClick={() => {
                setAvatar(null);
                setPreview(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* PASSWORD PANEL */}
        {activePanel === 'password' && (
          <div style={panelStyle}>
            <h3>🔑 Change Password</h3>
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />

            <button className="btn" style={{ width: 'auto' }} onClick={changePassword}>
              Change Password
            </button>
            <button
              className="btn"
              style={{ width: 'auto', background: '#999', marginLeft: '0.5rem' }}
              onClick={() => setActivePanel(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* DELETE PANEL */}
        {activePanel === 'delete' && (
          <div style={panelStyle}>
            <h3 style={{ color: 'red' }}>🗑️ Delete Account</h3>
            <p>This will permanently remove your account.</p>
            <button
              className="btn"
              style={{ background: '#e74c3c', width: 'auto' }}
              onClick={deleteAccount}
            >
              Confirm Delete
            </button>
            <button
              className="btn"
              style={{ width: 'auto', background: '#999', marginLeft: '0.5rem' }}
              onClick={() => setActivePanel(null)}
            >
              Cancel
            </button>
          </div>
        )}

        <hr style={{ margin: '2rem 0' }} />

        {/* MY POSTS */}
        <h2>My Posts</h2>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((p) => (
            <div key={p._id} style={{ marginBottom: '1rem' }}>
              <strong>{p.title}</strong>
            </div>
          ))
        )}

        {/* MY COMMENTS */}
        <h2>My Comments</h2>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} style={{ marginBottom: '1rem' }}>
              <strong>{c.post?.title || 'Unknown Post'}</strong><br />
              {c.body || c.content || c.text || ''}
            </div>
          ))
        )}
      </section>
    </main>
  );
};

const menuStyle = {
  display: 'block',
  width: '100%',
  padding: '12px',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  borderBottom: '1px solid #eee'
};

const panelStyle = {
  marginTop: '1rem',
  border: '1px solid #ddd',
  padding: '1.5rem',
  borderRadius: '8px'
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.6rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #ddd'
};

export default Profile;