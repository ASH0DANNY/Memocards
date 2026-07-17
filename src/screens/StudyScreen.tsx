import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Category } from '../types';
import { getCards, getCategories } from '../storage/storageService';
import { useAppTheme } from '../theme/ThemeContext';
import FlashCard from '../components/FlashCard';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function StudyScreen() {
  const { theme, settings } = useAppTheme();
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const [allCards, allCategories] = await Promise.all([getCards(), getCategories()]);
      const enabledIds = new Set(allCategories.filter((c) => c.enabled).map((c) => c.id));
      let pool = allCards.filter((c) => enabledIds.has(c.categoryId));
      if (settings.shuffle) pool = shuffleArray(pool);
      setCards(pool);
      setCategories(allCategories);
      setIndex(0);
    })();
  }, [settings.shuffle]);

  const currentCard = cards[index];
  const currentCategory = useMemo(
    () => categories.find((c) => c.id === currentCard?.categoryId),
    [categories, currentCard]
  );

  const next = () => setIndex((i) => (cards.length ? (i + 1) % cards.length : 0));
  const prev = () => setIndex((i) => (cards.length ? (i - 1 + cards.length) % cards.length : 0));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.textColor }]}>Study</Text>

      {cards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.subTextColor }]}>
            No cards to show yet. Add cards or enable a category in Library to start studying.
          </Text>
        </View>
      ) : (
        <>
          <FlashCard card={currentCard} category={currentCategory} theme={theme} />
          <Text style={[styles.counter, { color: theme.subTextColor }]}>
            {index + 1} / {cards.length}
          </Text>
          <View style={styles.controls}>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={prev}>
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={next}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  counter: { textAlign: 'center', marginTop: 12, fontSize: 14 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
