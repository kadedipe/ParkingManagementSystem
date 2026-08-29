import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';

export default function Profile() {
  const { user, updateProfile, loading } = useAuth();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
  });

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
    });
    setAvatarPreview(user?.avatar || '');
  }, [user]);

  const change = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const openPhotoPicker = () => {
    // Photo selection is a profile edit, so make that state explicit rather than
    // leaving a disabled invisible file input under the avatar.
    setEditing(true);
    fileInputRef.current?.click();
  };

  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ severity: 'error', text: 'Please choose an image file.' });
      return;
    }
    if (file.size > 1_500_000) {
      setMessage({ severity: 'error', text: 'Profile image must be 1.5 MB or smaller.' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage(null);
  };

  const cancel = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || '');
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
    });
    setMessage(null);
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        bio: form.bio.trim(),
        ...(avatarFile ? { avatar: avatarFile } : {}),
      });
      setEditing(false);
      setAvatarFile(null);
      setMessage({ severity: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({
        severity: 'error',
        text: error?.message || 'Unable to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Profile</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile settings and preferences
      </Typography>

      {message && <Alert severity={message.severity} sx={{ mb: 3 }}>{message.text}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
            <Avatar
              src={avatarPreview || undefined}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              {!avatarPreview && <PersonIcon sx={{ fontSize: 64 }} />}
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={selectPhoto}
            />
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={openPhotoPicker}
              disabled={saving || loading}
              sx={{ mb: 2 }}
            >
              {avatarPreview ? 'Change photo' : 'Upload photo'}
            </Button>

            <Typography variant="h6" fontWeight={600}>
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">{user?.role || 'User'}</Typography>
            <Chip label={user?.status || 'Active'} color="success" size="small" sx={{ mt: 1 }} />

            <Stack spacing={1.5} sx={{ mt: 3, textAlign: 'left' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body2">{user?.email || 'Not provided'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body2">{user?.phone || 'Not provided'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Member Since</Typography>
                <Typography variant="body2">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>Profile Information</Typography>
              {!editing && (
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" value={form.firstName} onChange={change('firstName')} disabled={!editing || saving} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" value={form.lastName} onChange={change('lastName')} disabled={!editing || saving} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" value={form.email} disabled />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone Number" value={form.phone} onChange={change('phone')} disabled={!editing || saving} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" value={form.address} onChange={change('address')} disabled={!editing || saving} multiline minRows={2} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Bio" value={form.bio} onChange={change('bio')} disabled={!editing || saving} multiline minRows={3} />
              </Grid>
            </Grid>

            {editing && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button onClick={cancel} disabled={saving}>Cancel</Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                  onClick={save}
                  disabled={saving || !form.firstName.trim()}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
