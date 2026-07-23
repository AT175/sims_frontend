import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { spacing } from '@theme/index';

interface CardGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}

export function CardGrid({ children, columns, gap = spacing.md }: CardGridProps) {
  const width = Dimensions.get('window').width;
  const count = React.Children.count(children);

  let cols = columns;
  if (!cols) {
    if (count <= 2) cols = 2;
    else if (count <= 4) cols = width >= 768 ? 4 : 2;
    else cols = width >= 1024 ? 5 : width >= 768 ? 3 : 2;
  }

  const itemWidth = Math.floor((width - gap * (cols + 1)) / cols);

  const items = React.Children.map(children, (child) => (
    <View style={{ width: itemWidth, marginRight: gap, marginBottom: gap }}>
      {child}
    </View>
  ));

  return (
    <View style={styles.grid}>
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
