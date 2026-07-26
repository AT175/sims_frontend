import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { spacing } from '@theme/index';

interface CardGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}

export function CardGrid({ children, columns, gap = spacing.md }: CardGridProps) {
  const { width } = useWindowDimensions();
  const count = React.Children.count(children);

  let cols = columns;
  if (!cols) {
    if (count <= 2) cols = width < 480 ? 1 : 2;
    else if (count <= 4) cols = width >= 768 ? 4 : width < 480 ? 1 : 2;
    else cols = width >= 1280 ? 4 : width >= 768 ? 3 : width >= 480 ? 2 : 1;
  }

  const itemPercent = `${Math.floor(100 / cols)}%` as any;

  const items = React.Children.map(children, (child) => (
    <View style={{ width: itemPercent, paddingHorizontal: gap / 2, marginBottom: gap }}>
      {child}
    </View>
  ));

  return (
    <View style={[styles.grid, { marginHorizontal: -gap / 2 }]}>
      {items}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
