// ============================================================================
// UI Slice - UI State Management
// ============================================================================

// parking-management-system/mobile/src/store/slices/uiSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  isLoading: boolean;
  isNetworkConnected: boolean;
  theme: 'light' | 'dark';
  modal: {
    isVisible: boolean;
    type: string;
    data: any;
  };
  toast: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  };
  bottomSheet: {
    isVisible: boolean;
    content: React.ReactNode | null;
    snapPoints: string[];
  };
}

const initialState: UIState = {
  isLoading: false,
  isNetworkConnected: true,
  theme: 'light',
  modal: {
    isVisible: false,
    type: '',
    data: null,
  },
  toast: {
    isVisible: false,
    message: '',
    type: 'info',
  },
  bottomSheet: {
    isVisible: false,
    content: null,
    snapPoints: ['50%'],
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setNetworkConnected: (state, action: PayloadAction<boolean>) => {
      state.isNetworkConnected = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    showModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modal.isVisible = true;
      state.modal.type = action.payload.type;
      state.modal.data = action.payload.data || null;
    },
    hideModal: (state) => {
      state.modal.isVisible = false;
      state.modal.type = '';
      state.modal.data = null;
    },
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type?: 'success' | 'error' | 'warning' | 'info';
      }>
    ) => {
      state.toast.isVisible = true;
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type || 'info';
    },
    hideToast: (state) => {
      state.toast.isVisible = false;
      state.toast.message = '';
      state.toast.type = 'info';
    },
    showBottomSheet: (
      state,
      action: PayloadAction<{
        content: React.ReactNode;
        snapPoints?: string[];
      }>
    ) => {
      state.bottomSheet.isVisible = true;
      state.bottomSheet.content = action.payload.content;
      state.bottomSheet.snapPoints = action.payload.snapPoints || ['50%'];
    },
    hideBottomSheet: (state) => {
      state.bottomSheet.isVisible = false;
      state.bottomSheet.content = null;
      state.bottomSheet.snapPoints = ['50%'];
    },
  },
});

export const {
  setLoading,
  setNetworkConnected,
  setTheme,
  toggleTheme,
  showModal,
  hideModal,
  showToast,
  hideToast,
  showBottomSheet,
  hideBottomSheet,
} = uiSlice.actions;

// Selectors
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectIsLoading = (state: { ui: UIState }) => state.ui.isLoading;
export const selectIsNetworkConnected = (state: { ui: UIState }) =>
  state.ui.isNetworkConnected;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectToast = (state: { ui: UIState }) => state.ui.toast;
export const selectBottomSheet = (state: { ui: UIState }) => state.ui.bottomSheet;

export default uiSlice.reducer;