// ============================================================================
// CardMedia Component - Media/Image Section of Card
// ============================================================================

// parking-management-system/mobile/src/components/common/Card/CardMedia.js

import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS } from '../../../constants/theme';

/**
 * CardMedia Component - Media/image section of a card
 */
const CardMedia = ({
  source,
  aspectRatio = 16 / 9,
  height,
  width,
  resizeMode = 'cover',
  style,
  imageStyle,
  children,
  ...props
}) => {
  const containerStyles = [
    styles.container,
    height && { height },
    width && { width },
    !height && { aspectRatio },
    style,
  ];

  const imageStyles = [styles.image, imageStyle];

  return (
    <View style={containerStyles} {...props}>
      {source ? (
        <Image
          source={source}
          style={imageStyles}
          resizeMode={resizeMode}
        />
      ) : (
        <View style={[styles.placeholder, imageStyles]} />
      )}
      {children && <View style={styles.overlay}>{children}</View>}
    </View>
  );
};

CardMedia.propTypes = {
  source: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    PropTypes.number,
  ]),
  aspectRatio: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
  resizeMode: PropTypes.oneOf(['cover', 'contain', 'stretch', 'repeat', 'center']),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  imageStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node,
};

CardMedia.defaultProps = {
  source: null,
  aspectRatio: 16 / 9,
  height: null,
  width: null,
  resizeMode: 'cover',
  style: null,
  imageStyle: null,
  children: null,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CardMedia;