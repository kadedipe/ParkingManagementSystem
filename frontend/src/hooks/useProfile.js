// ============================================================================
// useProfile Hook
// ============================================================================

import { useState, useCallback } from 'react';
import { profileService } from '../services/profile.service';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.getProfile();
      setProfile(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.updateProfile(data);
      setProfile(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAvatar = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.updateAvatar(file);
      setProfile(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.updatePreferences(preferences);
      setProfile(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    updatePreferences,
  };
};

export default useProfile;