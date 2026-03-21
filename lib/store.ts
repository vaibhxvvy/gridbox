import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { PatternState, AnimationDir } from '@/types/pattern';
import { DEFAULT_STATE } from '@/lib/url-state';

interface UIState {
  previewLayout: '16:9' | 'phone' | 'custom';
  customW: string;
  customH: string;
  isPaused: boolean;
  toast: { visible: boolean; msg: string };
}

interface GridmintStore {
  // Pattern state
  patternState: PatternState;
  setPatternState: (patch: Partial<PatternState>) => void;

  // UI state
  ui: UIState;
  setUI: (patch: Partial<UIState>) => void;

  // Toast helper
  showToast: (msg: string) => void;

  // Computed
  isAnimating: () => boolean;
  aspectRatio: () => string;
}

export const useGridmintStore = create<GridmintStore>()(
  subscribeWithSelector((set, get) => ({
    patternState: { ...DEFAULT_STATE },

    setPatternState: (patch) =>
      set(s => ({ patternState: { ...s.patternState, ...patch } })),

    ui: {
      previewLayout: '16:9',
      customW: '16',
      customH: '9',
      isPaused: false,
      toast: { visible: false, msg: '' },
    },

    setUI: (patch) =>
      set(s => ({ ui: { ...s.ui, ...patch } })),

    showToast: (msg) => {
      set(s => ({ ui: { ...s.ui, toast: { visible: true, msg } } }));
      setTimeout(() => set(s => ({ ui: { ...s.ui, toast: { ...s.ui.toast, visible: false } } })), 2200);
    },

    isAnimating: () => get().patternState.animation !== 'none',

    aspectRatio: () => {
      const { previewLayout, customW, customH } = get().ui;
      if (previewLayout === 'phone') return '9/16';
      if (previewLayout === 'custom') {
        const w = Math.max(1, parseInt(customW) || 16);
        const h = Math.max(1, parseInt(customH) || 9);
        return `${w}/${h}`;
      }
      return '16/9';
    },
  }))
);
