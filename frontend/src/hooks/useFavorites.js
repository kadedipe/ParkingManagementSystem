// ============================================================================
// useFavorites Hook
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { favoritesService } from '../services/favorites.service';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoritesService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const isFavorite = useCallback((id) => {
    return favorites.some(item => item.id === id);
  }, [favorites]);

  const toggleFavorite = useCallback(async (id) => {
    try {
      const isFav = isFavorite(id);
      if (isFav) {
        await favoritesService.removeFavorite(id);
        setFavorites(prev => prev.filter(item => item.id !== id));
      } else {
        const newFavorite = await favoritesService.addFavorite(id);
        setFavorites(prev => [...prev, newFavorite]);
      }
      return true;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  }, [isFavorite]);

  const clearFavorites = useCallback(async () => {
    try {
      await favoritesService.clearFavorites();
      setFavorites([]);
      return true;
    } catch (error) {
      console.error('Failed to clear favorites:', error);
      return false;
    }
  }, []);

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    clearFavorites,
    refresh: loadFavorites,
  };
};

export default useFavorites;