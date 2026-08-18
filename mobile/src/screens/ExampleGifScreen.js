// ============================================================================
// Sample Usage - How to use GIFs in your app
// ============================================================================

// parking-management-system/mobile/src/screens/ExampleGifScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import GifComponent from '../assets/animations/gifs/GifComponent';
import { useGif, useGifPreload } from '../assets/animations/gifs/useGif';
import GifService from '../assets/animations/gifs/service';
import GifUtils from '../assets/animations/gifs/utils';

const ExampleGifScreen = () => {
  const [currentGif, setCurrentGif] = useState('loading');
  const [isLoading, setIsLoading] = useState(true);

  // Preload GIFs
  const { preloaded, progress } = useGifPreload(['loading', 'success', 'error'], {
    autoPreload: true
  });

  // Use GIF hook
  const { gif, loading, error, reload } = useGif(currentGif, {
    width: 200,
    height: 200,
    autoLoad: true
  });

  // Get available GIFs
  const gifKeys = GifUtils.getGifKeys('loading');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleGifChange = (key) => {
    setCurrentGif(key);
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const renderGifSelector = () => {
    const categories = GifUtils.getGifCategories();
    
    return Object.keys(categories).map((category) => (
      <View key={category} style={styles.categorySection}>
        <Text style={styles.categoryTitle}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories[category].map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.gifButton,
                currentGif === key && styles.gifButtonActive
              ]}
              onPress={() => handleGifChange(key)}
            >
              <View style={styles.gifPreview}>
                <GifComponent
                  name={key}
                  width={80}
                  height={80}
                  showLoading={false}
                />
              </View>
              <Text style={styles.gifName}>
                {GifUtils.formatGifName(key)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <GifComponent name="loading" width={150} height={150} />
        <Text style={styles.loadingText}>Loading GIFs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>GIF Animations</Text>
      
      {/* Main GIF Display */}
      <View style={styles.mainGifContainer}>
        <GifComponent
          name={currentGif}
          width={250}
          height={250}
          resizeMode="contain"
          showLoading={true}
          onLoad={() => console.log('GIF loaded')}
          onError={() => console.log('GIF error')}
        />
        <Text style={styles.currentGifName}>
          {GifUtils.formatGifName(currentGif)}
        </Text>
        {loading && <Text style={styles.loadingText}>Loading...</Text>}
        {error && <Text style={styles.errorText}>Error loading GIF</Text>}
      </View>

      {/* GIF Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>Select a GIF:</Text>
        {renderGifSelector()}
      </View>

      {/* GIF Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>GIF Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Key:</Text>
          <Text style={styles.infoValue}>{currentGif}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Preloaded:</Text>
          <Text style={styles.infoValue}>{preloaded ? 'Yes' : 'No'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Progress:</Text>
          <Text style={styles.infoValue}>{Math.round(progress)}%</Text>
        </View>
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={reload}
        >
          <Text style={styles.reloadButtonText}>Reload GIF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    color: '#333'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  mainGifContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center'
  },
  currentGifName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ff3b30'
  },
  selectorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333'
  },
  categorySection: {
    marginBottom: 16
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8
  },
  gifButton: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  gifButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd'
  },
  gifPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa'
  },
  gifName: {
    fontSize: 10,
    marginTop: 4,
    color: '#666',
    textAlign: 'center'
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  infoLabel: {
    fontSize: 14,
    color: '#666'
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  reloadButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center'
  },
  reloadButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600'
  }
});

export default ExampleGifScreen;