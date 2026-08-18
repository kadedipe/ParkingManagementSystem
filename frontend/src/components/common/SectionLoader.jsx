// ============================================================================
// SectionLoader Component
// ============================================================================

import React from 'react';
import { Box, Paper } from '@mui/material';
import { SkeletonCard } from './LoadingSpinner';

export const SectionLoader = ({ count = 3, columns = 3 }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 3,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </Box>
  );
};

export default SectionLoader;