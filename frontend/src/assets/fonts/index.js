// ============================================================================
// Font Assets
// ============================================================================

/**
 * Font assets for the parking management system.
 * 
 * This module exports all font assets and configuration for easy import
 * and use throughout the application.
 */

// ============================================================================
// Font Imports (for CSS)
// ============================================================================

// Inter Font - Primary font
import InterThinWoff2 from './inter/Inter-Thin.woff2';
import InterThinWoff from './inter/Inter-Thin.woff';
import InterExtraLightWoff2 from './inter/Inter-ExtraLight.woff2';
import InterExtraLightWoff from './inter/Inter-ExtraLight.woff';
import InterLightWoff2 from './inter/Inter-Light.woff2';
import InterLightWoff from './inter/Inter-Light.woff';
import InterRegularWoff2 from './inter/Inter-Regular.woff2';
import InterRegularWoff from './inter/Inter-Regular.woff';
import InterMediumWoff2 from './inter/Inter-Medium.woff2';
import InterMediumWoff from './inter/Inter-Medium.woff';
import InterSemiBoldWoff2 from './inter/Inter-SemiBold.woff2';
import InterSemiBoldWoff from './inter/Inter-SemiBold.woff';
import InterBoldWoff2 from './inter/Inter-Bold.woff2';
import InterBoldWoff from './inter/Inter-Bold.woff';
import InterExtraBoldWoff2 from './inter/Inter-ExtraBold.woff2';
import InterExtraBoldWoff from './inter/Inter-ExtraBold.woff';
import InterBlackWoff2 from './inter/Inter-Black.woff2';
import InterBlackWoff from './inter/Inter-Black.woff';

// Roboto Font - Secondary font
import RobotoThinWoff2 from './roboto/Roboto-Thin.woff2';
import RobotoThinWoff from './roboto/Roboto-Thin.woff';
import RobotoLightWoff2 from './roboto/Roboto-Light.woff2';
import RobotoLightWoff from './roboto/Roboto-Light.woff';
import RobotoRegularWoff2 from './roboto/Roboto-Regular.woff2';
import RobotoRegularWoff from './roboto/Roboto-Regular.woff';
import RobotoMediumWoff2 from './roboto/Roboto-Medium.woff2';
import RobotoMediumWoff from './roboto/Roboto-Medium.woff';
import RobotoBoldWoff2 from './roboto/Roboto-Bold.woff2';
import RobotoBoldWoff from './roboto/Roboto-Bold.woff';
import RobotoBlackWoff2 from './roboto/Roboto-Black.woff2';
import RobotoBlackWoff from './roboto/Roboto-Black.woff';

// Material Icons
import MaterialIconsWoff2 from './icons/material-icons.woff2';
import MaterialIconsWoff from './icons/material-icons.woff';

// ============================================================================
// Font Family Configuration
// ============================================================================

export const FONTS = {
  primary: {
    family: 'Inter',
    weights: {
      thin: 100,
      extraLight: 200,
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
      extraBold: 800,
      black: 900,
    },
    files: {
      thin: { woff2: InterThinWoff2, woff: InterThinWoff },
      extraLight: { woff2: InterExtraLightWoff2, woff: InterExtraLightWoff },
      light: { woff2: InterLightWoff2, woff: InterLightWoff },
      regular: { woff2: InterRegularWoff2, woff: InterRegularWoff },
      medium: { woff2: InterMediumWoff2, woff: InterMediumWoff },
      semiBold: { woff2: InterSemiBoldWoff2, woff: InterSemiBoldWoff },
      bold: { woff2: InterBoldWoff2, woff: InterBoldWoff },
      extraBold: { woff2: InterExtraBoldWoff2, woff: InterExtraBoldWoff },
      black: { woff2: InterBlackWoff2, woff: InterBlackWoff },
    },
    fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  secondary: {
    family: 'Roboto',
    weights: {
      thin: 100,
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
      black: 900,
    },
    files: {
      thin: { woff2: RobotoThinWoff2, woff: RobotoThinWoff },
      light: { woff2: RobotoLightWoff2, woff: RobotoLightWoff },
      regular: { woff2: RobotoRegularWoff2, woff: RobotoRegularWoff },
      medium: { woff2: RobotoMediumWoff2, woff: RobotoMediumWoff },
      bold: { woff2: RobotoBoldWoff2, woff: RobotoBoldWoff },
      black: { woff2: RobotoBlackWoff2, woff: RobotoBlackWoff },
    },
    fallback: '"Helvetica Neue", Arial, sans-serif',
  },
  icons: {
    family: 'Material Icons',
    files: {
      woff2: MaterialIconsWoff2,
      woff: MaterialIconsWoff,
    },
    fallback: 'sans-serif',
  },
};

// ============================================================================
// Font Face Definitions
// ============================================================================

/**
 * Generate font-face CSS for a font family
 */
export const generateFontFaces = (fontConfig) => {
  const { family, weights, files, fallback } = fontConfig;
  
  return Object.entries(weights).map(([name, weight]) => {
    const fontFiles = files[name];
    if (!fontFiles) return '';
    
    return `
      @font-face {
        font-family: '${family}';
        font-weight: ${weight};
        font-display: swap;
        src: 
          local('${family} ${name}'),
          local('${family}-${name}'),
          url('${fontFiles.woff2}') format('woff2'),
          url('${fontFiles.woff}') format('woff');
      }
    `;
  }).join('\n');
};

/**
 * Generate complete font-face CSS
 */
export const generateAllFontFaces = () => {
  return `
    /* ==========================================================================
       Font Faces
       ========================================================================== */
    
    ${generateFontFaces(FONTS.primary)}
    
    ${generateFontFaces(FONTS.secondary)}
    
    /* ==========================================================================
       Material Icons
       ========================================================================== */
    
    @font-face {
      font-family: 'Material Icons';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: 
        local('Material Icons'),
        url('${FONTS.icons.files.woff2}') format('woff2'),
        url('${FONTS.icons.files.woff}') format('woff');
    }
  `;
};

// ============================================================================
// Font CSS Classes
// ============================================================================

export const FONT_CLASSES = {
  // Primary font weights
  'font-thin': 'font-weight: 100;',
  'font-extra-light': 'font-weight: 200;',
  'font-light': 'font-weight: 300;',
  'font-regular': 'font-weight: 400;',
  'font-medium': 'font-weight: 500;',
  'font-semi-bold': 'font-weight: 600;',
  'font-bold': 'font-weight: 700;',
  'font-extra-bold': 'font-weight: 800;',
  'font-black': 'font-weight: 900;',
  
  // Secondary font weights
  'font-roboto-thin': 'font-family: Roboto; font-weight: 100;',
  'font-roboto-light': 'font-family: Roboto; font-weight: 300;',
  'font-roboto-regular': 'font-family: Roboto; font-weight: 400;',
  'font-roboto-medium': 'font-family: Roboto; font-weight: 500;',
  'font-roboto-bold': 'font-family: Roboto; font-weight: 700;',
  'font-roboto-black': 'font-family: Roboto; font-weight: 900;',
};

// ============================================================================
// Font Utilities
// ============================================================================

/**
 * Get font family with fallback
 */
export const getFontFamily = (fontKey = 'primary') => {
  const font = FONTS[fontKey];
  return font ? `'${font.family}', ${font.fallback}` : 'inherit';
};

/**
 * Get font weight value
 */
export const getFontWeight = (fontKey = 'primary', weight = 'regular') => {
  const font = FONTS[fontKey];
  return font?.weights?.[weight] || 400;
};

/**
 * Generate font import statements
 */
export const getFontImports = () => {
  return Object.entries(FONTS).map(([key, font]) => {
    if (key === 'icons') return '';
    return `@import url('https://fonts.googleapis.com/css2?family=${font.family}:wght@${Object.values(font.weights).join(';')}&display=swap');`;
  }).filter(Boolean).join('\n');
};

// ============================================================================
// Font Component
// ============================================================================

import React from 'react';

/**
 * Font component for applying font styles
 */
export const FontStyles = () => {
  const fontFaces = generateAllFontFaces();
  
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          ${fontFaces}
          
          /* ==========================================================================
             Font Classes
             ========================================================================== */
          
          ${Object.entries(FONT_CLASSES).map(([className, styles]) => 
            `.${className} { ${styles} }`
          ).join('\n')}
          
          /* ==========================================================================
             Font Family Classes
             ========================================================================== */
          
          .font-primary {
            font-family: ${getFontFamily('primary')};
          }
          
          .font-secondary {
            font-family: ${getFontFamily('secondary')};
          }
          
          .font-icons {
            font-family: 'Material Icons';
          }
        `,
      }}
    />
  );
};

// ============================================================================
// Font Loader
// ============================================================================

/**
 * Preload fonts for performance
 */
export const preloadFonts = () => {
  const fontFiles = [];
  
  // Primary font - Regular and Bold
  fontFiles.push(FONTS.primary.files.regular.woff2);
  fontFiles.push(FONTS.primary.files.bold.woff2);
  
  // Secondary font - Regular and Bold
  fontFiles.push(FONTS.secondary.files.regular.woff2);
  fontFiles.push(FONTS.secondary.files.bold.woff2);
  
  // Material Icons
  fontFiles.push(FONTS.icons.files.woff2);
  
  // Create preload links
  fontFiles.forEach((file) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = file;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// ============================================================================
// Check if font is loaded
// ============================================================================

export const checkFontLoaded = (fontFamily) => {
  return new Promise((resolve) => {
    if (!window.document) {
      resolve(false);
      return;
    }
    
    try {
      document.fonts.load(`1rem ${fontFamily}`).then((fonts) => {
        resolve(fonts.length > 0);
      }).catch(() => {
        resolve(false);
      });
    } catch (error) {
      resolve(false);
    }
  });
};

// ============================================================================
// Export
// ============================================================================

export default {
  FONTS,
  FONT_CLASSES,
  generateFontFaces,
  generateAllFontFaces,
  getFontFamily,
  getFontWeight,
  getFontImports,
  FontStyles,
  preloadFonts,
  checkFontLoaded,
};