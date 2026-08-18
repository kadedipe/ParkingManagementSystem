// ============================================================================
// useSettings Hook
// ============================================================================

import { useState, useCallback } from 'react';
import { settingsService } from '../services/settings.service';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsService.getSettings();
      setSettings(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsService.updateSettings(data);
      setSettings(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsService.exportSettings();
      // Trigger download
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `settings_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return response;
    } catch (err) {
      setError(err.message || 'Failed to export settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const importSettings = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      const text = await file.text();
      const data = JSON.parse(text);
      const response = await settingsService.importSettings(data);
      setSettings(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to import settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsService.resetSettings();
      setSettings(response);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to reset settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    exportSettings,
    importSettings,
    resetSettings,
  };
};

export default useSettings;