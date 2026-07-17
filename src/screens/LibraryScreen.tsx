import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card, Category } from '../types';
import {
  addCard,
  addCategory,
  deleteCard,
  deleteCategory,
  generateId,
  getCards,
  getCategories,
  saveCategories,
  updateCard,
} from '../storage/storageService';
import { importCardsFromFile } from '../storage/importService';
import { useAppTheme } from '../theme/ThemeContext';
import { refreshAllSurfaces } from '../widgets/syncAll';

const PALETTE = ['#2D6A4F', '#087E8B', '#E85D4C', '#7B5EA7', '#C97B3D', '#3563E9'];

export default function LibraryScreen() {
  const { theme } = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formFront, setFormFront] = useState('');
  const [formBack, setFormBack] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [c, cd] = await Promise.all([getCategories(), getCards()]);
    setCategories(c);
    setCards(cd);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCategory = async (id: string) => {
    const next = categories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    setCategories(next);
    await saveCategories(next);
    refreshAllSurfaces();
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const category: Category = {
      id: generateId(),
      name,
      enabled: true,
      color: PALETTE[categories.length % PALETTE.length],
    };
    await addCategory(category);
    setNewCategoryName('');
    load();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(`Delete "${name}"?`, 'This also deletes every card in this category. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCategory(id);
          load();
          refreshAllSurfaces();
        },
      },
    ]);
  };

  const openAddModal = () => {
    setEditingCard(null);
    setFormFront('');
    setFormBack('');
    setFormCategoryId(categories[0]?.id ?? null);
    setModalVisible(true);
  };

  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setFormFront(card.front);
    setFormBack(card.back);
    setFormCategoryId(card.categoryId);
    setModalVisible(true);
  };

  const handleSaveCard = async () => {
    if (!formFront.trim() || !formBack.trim() || !formCategoryId) {
      Alert.alert('Missing info', 'Please fill in front, back, and pick a category.');
      return;
    }
    if (editingCard) {
      await updateCard({
        ...editingCard,
        front: formFront.trim(),
        back: formBack.trim(),
        categoryId: formCategoryId,
      });
    } else {
      await addCard({
        id: generateId(),
        front: formFront.trim(),
        back: formBack.trim(),
        categoryId: formCategoryId,
        createdAt: Date.now(),
      });
    }
    setModalVisible(false);
    load();
    refreshAllSurfaces();
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert('Delete card?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCard(id);
          load();
          refreshAllSurfaces();
        },
      },
    ]);
  };

  const handleImport = async () => {
    try {
      const result = await importCardsFromFile();
      if (result.count === 0) return;
      Alert.alert(
        'Import complete',
        `Imported ${result.count} card(s)${
          result.newCategories > 0
            ? ` across ${result.newCategories} new categor${result.newCategories === 1 ? 'y' : 'ies'}.`
            : '.'
        }`
      );
      load();
      refreshAllSurfaces();
    } catch (e) {
      Alert.alert('Import failed', e instanceof Error ? e.message : 'Could not read that file.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.header, { color: theme.textColor }]}>Library</Text>

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Categories</Text>
        {categories.length === 0 && (
          <Text style={[styles.mutedText, { color: theme.subTextColor }]}>No categories yet — add one below.</Text>
        )}
        {categories.map((cat) => (
          <View key={cat.id} style={[styles.row, { borderColor: theme.cardBorder }]}>
            <View style={[styles.dot, { backgroundColor: cat.color }]} />
            <Text style={[styles.rowText, { color: theme.textColor }]}>{cat.name}</Text>
            <Text style={[styles.countText, { color: theme.subTextColor }]}>
              {cards.filter((c) => c.categoryId === cat.id).length}
            </Text>
            <Switch value={cat.enabled} onValueChange={() => toggleCategory(cat.id)} />
            <TouchableOpacity onPress={() => handleDeleteCategory(cat.id, cat.name)} style={styles.deleteBtn}>
              <Text style={{ color: '#C0392B', fontSize: 13 }}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addCategoryRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, borderColor: theme.cardBorder, color: theme.textColor }]}
            placeholder="New category name"
            placeholderTextColor={theme.subTextColor}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.accent }]} onPress={handleAddCategory}>
            <Text style={styles.smallButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Cards ({cards.length})</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={openAddModal}>
            <Text style={styles.buttonText}>+ Add card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton, { borderColor: theme.accent }]}
            onPress={handleImport}
          >
            <Text style={[styles.buttonText, { color: theme.accent }]}>Import file</Text>
          </TouchableOpacity>
        </View>

        {cards.map((card) => {
          const cat = categories.find((c) => c.id === card.categoryId);
          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.cardRow, { borderColor: theme.cardBorder }]}
              onPress={() => openEditModal(card)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardFront, { color: theme.textColor }]}>{card.front}</Text>
                <Text style={[styles.cardBack, { color: theme.subTextColor }]}>{card.back}</Text>
                {cat && <Text style={[styles.cardCat, { color: cat.color }]}>{cat.name}</Text>}
              </View>
              <TouchableOpacity onPress={() => handleDeleteCard(card.id)} style={styles.deleteBtn}>
                <Text style={{ color: '#C0392B', fontSize: 13 }}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              {editingCard ? 'Edit card' : 'New card'}
            </Text>

            <Text style={[styles.label, { color: theme.subTextColor }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setFormCategoryId(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      borderColor: cat.color,
                      backgroundColor: formCategoryId === cat.id ? cat.color : 'transparent',
                    },
                  ]}
                >
                  <Text style={{ color: formCategoryId === cat.id ? '#fff' : cat.color, fontSize: 13 }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: theme.subTextColor }]}>Front</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.cardBorder, color: theme.textColor }]}
              value={formFront}
              onChangeText={setFormFront}
              multiline
              placeholder="e.g. 1857"
              placeholderTextColor={theme.subTextColor}
            />
            <Text style={[styles.label, { color: theme.subTextColor }]}>Back</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.cardBorder, color: theme.textColor }]}
              value={formBack}
              onChangeText={setFormBack}
              multiline
              placeholder="e.g. Indian Rebellion of 1857"
              placeholderTextColor={theme.subTextColor}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={{ color: theme.subTextColor }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallButton, { backgroundColor: theme.accent }]} onPress={handleSaveCard}>
                <Text style={styles.smallButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 28, fontWeight: '700', margin: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, marginTop: 12, marginBottom: 8 },
  mutedText: { marginHorizontal: 20, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  rowText: { flex: 1, fontSize: 15 },
  countText: { fontSize: 13, marginRight: 10 },
  deleteBtn: { marginLeft: 12 },
  addCategoryRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 12, gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  smallButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, justifyContent: 'center' },
  smallButtonText: { color: '#fff', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#00000010', marginVertical: 16, marginHorizontal: 20 },
  actionsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 12 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1.5 },
  buttonText: { color: '#fff', fontWeight: '600' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
  },
  cardFront: { fontSize: 15, fontWeight: '600' },
  cardBack: { fontSize: 13, marginTop: 2 },
  cardCat: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000060' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, marginRight: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 8, alignItems: 'center' },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 8 },
});
