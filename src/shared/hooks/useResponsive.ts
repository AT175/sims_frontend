import { useWindowDimensions } from 'react-native';

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
  scale: number;
  fontScale: number;
  /** Number of columns for card grids at current width */
  cardColumns: number;
  /** Max content width for centered layouts on large screens */
  maxContentWidth: number | undefined;
  /** Sidebar mode: 'drawer' on mobile, 'persistent' on desktop */
  sidebarMode: 'drawer' | 'persistent';
  /** Padding for main content area */
  contentPadding: number;
}

export function useResponsive(): ResponsiveBreakpoints {
  const { width, height, scale, fontScale } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1440;

  let cardColumns = 1;
  if (width >= 1280) cardColumns = 4;
  else if (width >= 1024) cardColumns = 3;
  else if (width >= 640) cardColumns = 2;
  else cardColumns = 1;

  const maxContentWidth = isWide ? 1200 : undefined;
  const sidebarMode: 'drawer' | 'persistent' = isDesktop ? 'persistent' : 'drawer';
  const contentPadding = isMobile ? 12 : 20;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    width,
    height,
    scale,
    fontScale,
    cardColumns,
    maxContentWidth,
    sidebarMode,
    contentPadding,
  };
}
