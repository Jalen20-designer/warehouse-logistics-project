import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MdArrowBack, MdCameraAlt } from 'react-icons/md';

const Profile = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    created_at: '',
    avatar: ''
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchProfile(storedUserId);
    } else {
      setMessage({ type: 'error', text: 'No user ID found. Please log in.' });
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      const response = await fetch(`http://localhost/backend/auth/profile.php?id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        const userData = {
          username: data.data.username || '',
          email: data.data.email || '',
          created_at: data.data.created_at || '',
          avatar: data.data.avatar || ''
        };
        setProfile(userData);
        setOriginalProfile(userData);
        if (data.data.avatar) {
          setAvatarPreview(`http://localhost/backend/uploads/profiles/${data.data.avatar}`);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred while fetching profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProfile(originalProfile);
      setAvatarFile(null);
      setAvatarPreview(originalProfile?.avatar ? `http://localhost/backend/uploads/profiles/${originalProfile.avatar}` : null);
      setMessage({ type: '', text: '' });
    }
    setIsEditing(!isEditing);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('id', userId);
    formData.append('username', profile.username);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const response = await fetch('http://localhost/backend/auth/profile.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        const updatedProfile = { ...profile, avatar: data.avatar || profile.avatar };
        setOriginalProfile(updatedProfile);
        setProfile(updatedProfile);
        setIsEditing(false);
        
        const storedUserItem = localStorage.getItem('user');
        if (storedUserItem) {
          const storedUser = JSON.parse(storedUserItem);
          const newStoredUser = { ...storedUser, username: updatedProfile.username, avatar: updatedProfile.avatar };
          localStorage.setItem('user', JSON.stringify(newStoredUser));
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred while updating profile.' });
    }
  };

  if (loading) {
    return <div style={{...styles.container, backgroundColor: isDark ? '#121417' : '#f9fafb'}}><p style={{color: isDark ? '#9CA3AF' : '#6b7280'}}>Loading profile...</p></div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{...styles.container, backgroundColor: isDark ? '#121417' : '#f9fafb', color: isDark ? '#FFFFFF' : '#1f2937'}}>
      <div style={{...styles.card, backgroundColor: isDark ? '#1E2126' : '#ffffff', borderColor: isDark ? '#343A40' : '#e5e7eb'}}>
        <div style={styles.header}>
          <button style={{...styles.backButton, color: isDark ? '#9CA3AF' : '#6b7280'}} onClick={() => navigate(-1)}>
            <MdArrowBack size={32} />
          </button>
          <h2 style={styles.title}>User Profile</h2>
        </div>

        {message.text && (
          <div style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
            {message.text}
          </div>
        )}

        <div style={styles.avatarContainer}>
          <div style={styles.avatarInner}>
            <div style={{...styles.avatar, overflow: 'hidden', position: 'relative'}}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.username ? profile.username.charAt(0).toUpperCase() : 'U'
              )}
              {isEditing && (
                <div style={styles.avatarOverlay} onClick={() => document.getElementById('avatarUpload').click()}>
                  <MdCameraAlt size={40} color="#fff" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              id="avatarUpload" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleAvatarChange} 
            />
          </div>
        </div>

        <form onSubmit={handleUpdate} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={{...styles.label, color: isDark ? '#9CA3AF' : '#6b7280'}}>Username</label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                style={{...styles.inputActive, backgroundColor: isDark ? '#121417' : '#f9fafb', color: isDark ? '#FFFFFF' : '#1f2937'}}
                required
              />
            ) : (
              <div style={{...styles.fixedText, borderBottomColor: isDark ? '#343A40' : '#e5e7eb', color: isDark ? '#FFFFFF' : '#1f2937'}}>{profile.username || 'Not set'}</div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={{...styles.label, color: isDark ? '#9CA3AF' : '#6b7280'}}>Email Address</label>
            <div style={{...styles.fixedText, borderBottomColor: isDark ? '#343A40' : '#e5e7eb', color: isDark ? '#FFFFFF' : '#1f2937'}}>{profile.email || 'Not set'}</div>
          </div>

          <div style={styles.inputGroup}>
            <label style={{...styles.label, color: isDark ? '#9CA3AF' : '#6b7280'}}>Member Since</label>
            <div style={{...styles.fixedText, borderBottomColor: isDark ? '#343A40' : '#e5e7eb', color: isDark ? '#FFFFFF' : '#1f2937'}}>{formatDate(profile.created_at)}</div>
          </div>

          <div style={styles.buttonGroup}>
            {isEditing ? (
              <>
                <button type="button" onClick={handleEditToggle} style={{...styles.cancelButton, borderColor: isDark ? '#343A40' : '#d1d5db', color: isDark ? '#FFFFFF' : '#1f2937'}}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveButton}>
                  Save Changes
                </button>
              </>
            ) : (
              <button type="button" onClick={handleEditToggle} style={styles.editButton}>
                Edit Profile
              </button>
            )}</div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Roboto Condensed, sans-serif', padding: '20px'
  },
  card: {
    borderRadius: '4px', padding: '40px', width: '100%', maxWidth: '450px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '2px solid', position: 'relative'
  },
  header: { marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  backButton: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
    transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start'
  },
  title: { margin: '0', fontSize: '2rem', fontWeight: 'bold', color: '#F37021', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' },
  avatarContainer: { display: 'flex', justifyContent: 'center', marginBottom: '30px' },
  avatarInner: { position: 'relative', width: '130px', height: '130px' },
  avatar: {
    width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#F37021',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', fontWeight: 'bold', color: '#fff', border: '4px solid #F37021', boxShadow: '0 4px 12px rgba(243, 112, 33, 0.4)'
  },
  avatarOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0.8,
    transition: 'opacity 0.2s', zIndex: 10
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  fixedText: {
    padding: '0.75rem', backgroundColor: 'transparent', borderBottom: '1px solid',
    fontSize: '1rem', fontWeight: '400'
  },
  inputActive: {
    padding: '0.75rem', border: '2px solid #F37021',
    borderRadius: '4px', fontSize: '1rem', outline: 'none'
  },
  buttonGroup: { display: 'flex', gap: '15px', marginTop: '10px' },
  editButton: {
    flex: 1, padding: '0.9rem', backgroundColor: '#F37021', color: '#FFFFFF', border: 'none',
    borderRadius: '4px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase'
  },
  saveButton: {
    flex: 2, padding: '0.9rem', backgroundColor: '#F37021', color: '#FFFFFF', border: 'none',
    borderRadius: '4px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase'
  },
  cancelButton: {
    flex: 1, padding: '0.9rem', backgroundColor: 'transparent',
    border: '2px solid', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase'
  },
  successMessage: { backgroundColor: '#064e3b', color: '#34d399', padding: '12px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' },
  errorMessage: { backgroundColor: '#450a0a', color: '#fca5a5', padding: '12px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }
};

export default Profile;
