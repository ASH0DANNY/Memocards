import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Theme } from '../theme/themes';
import { Card, Category } from '../types';

type Props = {
  card: Card;
  category?: Category;
  theme: Theme;
};

export default function FlashCard({ card, category, theme }: Props) {
  const [flipped, setFlipped] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const flip = () => {
    Animated.timing(anim, {
      toValue: flipped ? 0 : 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <Pressable onPress={flip} style={styles.wrapper}>
      <Animated.View
        style={[
          styles.face,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            borderRadius: theme.borderRadius,
            transform: [{ rotateY: frontRotate }],
          },
        ]}
      >
        {category && (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={styles.badgeText}>{category.name}</Text>
          </View>
        )}
        <Text style={[styles.text, { color: theme.textColor }]}>{card.front}</Text>
        <Text style={[styles.hint, { color: theme.subTextColor }]}>Tap to flip</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.face,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            borderRadius: theme.borderRadius,
            transform: [{ rotateY: backRotate }],
          },
        ]}
      >
        <Text style={[styles.text, { color: theme.textColor }]}>{card.back}</Text>
        <Text style={[styles.hint, { color: theme.subTextColor }]}>Tap to flip back</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 320,
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backfaceVisibility: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: 16,
    fontSize: 12,
  },
});
