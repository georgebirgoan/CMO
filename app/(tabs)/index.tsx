import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// =========================
// FIREBASE PLACEHOLDERS
// =========================
// 1) Uncomment these when you add Firebase to your project
// import { initializeApp } from 'firebase/app';
// import {
//   getFirestore,
//   collection,
//   doc,
//   onSnapshot,
//   setDoc,
//   deleteDoc,
//   query,
// } from 'firebase/firestore';

// 2) Your firebase config (from Firebase console)
// const firebaseConfig = { /* TODO: your config here */ };

// 3) Initialize once (outside the component)
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// 4) Collection helper (optionally per-user)
// const getNotesCollectionRef = (userId: string) =>
//   collection(db, 'users', userId, 'notes');

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

type NoteSnapshot = {
  title: string;
  content: string;
  checklist: ChecklistItem[];
  updatedLabel: string;
};

type Note = {
  id: string;
  title: string;
  content: string;
  updatedLabel: string;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  tags: string[]; // categories
  isChecklist: boolean;
  checklist: ChecklistItem[];
  history: NoteSnapshot[]; // simple version history
};

const MOCK_NOTES: Note[] = [
  {
    id: '1',
    title: 'Shopping list',
    content: 'Milk, eggs, bread, coffee',
    updatedLabel: 'Today',
    pinned: false,
    archived: false,
    trashed: false,
    tags: ['home', 'groceries'],
    isChecklist: true,
    checklist: [
      { id: 'c1', text: 'Milk', done: false },
      { id: 'c2', text: 'Eggs', done: true },
      { id: 'c3', text: 'Bread', done: false },
    ],
    history: [],
  },
  {
    id: '2',
    title: 'Ideas for app',
    content: 'Notes app with tags and colors',
    updatedLabel: 'Yesterday',
    pinned: true,
    archived: false,
    trashed: false,
    tags: ['work', 'idea'],
    isChecklist: false,
    checklist: [],
    history: [],
  },
  {
    id: '3',
    title: 'Exam prep',
    content: 'Ch. 3, 4, 6 — algorithms',
    updatedLabel: '2 days ago',
    pinned: false,
    archived: false,
    trashed: false,
    tags: ['school'],
    isChecklist: false,
    checklist: [],
    history: [],
  },
  {
    id: '4',
    title: 'Travel plan',
    content: 'Bucharest -> Cluj',
    updatedLabel: '3 days ago',
    pinned: false,
    archived: false,
    trashed: false,
    tags: ['travel'],
    isChecklist: false,
    checklist: [],
    history: [],
  },
];

type FilterMode = 'active' | 'archived' | 'trash';
type SortMode = 'newest' | 'oldest' | 'titleAsc' | 'titleDesc';

const NotesHome = () => {
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);

  const [filterMode, setFilterMode] = useState<FilterMode>('active');
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  // TODO: replace with real user id from auth
  const userId = 'demo-user-id';

  const selectedNote = selectedNoteId
    ? notes.find((n) => n.id === selectedNoteId) || null
    : null;

  // =========================
  // FIREBASE: SUBSCRIBE NOTES
  // =========================
  useEffect(() => {
    // When you add Firebase, replace local state with Firestore subscription.
    //
    // Example (pseudocode):
    //
    // if (!userId) return;
    // const colRef = getNotesCollectionRef(userId);
    // const qRef = query(colRef); // you can add orderBy here
    // const unsubscribe = onSnapshot(qRef, (snap) => {
    //   const remoteNotes: Note[] = [];
    //   snap.forEach((docSnap) => {
    //     const data = docSnap.data();
    //     remoteNotes.push({
    //       id: docSnap.id,
    //       title: data.title,
    //       content: data.content,
    //       updatedLabel: data.updatedLabel,
    //       pinned: data.pinned,
    //       archived: data.archived,
    //       trashed: data.trashed,
    //       tags: data.tags || [],
    //       isChecklist: data.isChecklist || false,
    //       checklist: data.checklist || [],
    //       history: [], // you can choose to sync history or not
    //     });
    //   });
    //   setNotes(remoteNotes);
    // });
    //
    // return () => unsubscribe();
  }, [userId]);

  // HELPER: write a note to Firestore
  const syncNoteToFirebase = (note: Note) => {
    // When ready to sync:
    //
    // if (!userId) return;
    // const colRef = getNotesCollectionRef(userId);
    // const docRef = doc(colRef, note.id);
    // const { history, ...rest } = note; // maybe you don't sync history
    // return setDoc(docRef, rest, { merge: true });
  };

  const deleteNoteFromFirebase = (noteId: string) => {
    // When ready to sync deletes:
    //
    // if (!userId) return;
    // const colRef = getNotesCollectionRef(userId);
    // const docRef = doc(colRef, noteId);
    // return deleteDoc(docRef);
  };

  // ------- helpers -------

  const setNotesAndKeepSelection = (updater: (prev: Note[]) => Note[]) => {
    setNotes((prev) => {
      const next = updater(prev);

      // make sure selection still exists
      if (selectedNoteId) {
        const stillExists = next.some((n) => n.id === selectedNoteId && !n.trashed);
        if (!stillExists) {
          setSelectedNoteId(null);
        }
      }

      // FIREBASE: batch-sync notes if you want
      // next.forEach((n) => syncNoteToFirebase(n));

      return next;
    });
  };

  const updateSelectedNote = (changes: Partial<Note>) => {
    if (!selectedNoteId) return;
    setNotesAndKeepSelection((prev) =>
      prev.map((note) =>
        note.id === selectedNoteId
          ? {
              ...note,
              ...changes,
              updatedLabel: 'Just now',
            }
          : note
      )
    );

    // FIREBASE: sync updated note
    const updated = notes.find((n) => n.id === selectedNoteId);
    if (updated) {
      const merged: Note = { ...updated, ...changes, updatedLabel: 'Just now' };
      syncNoteToFirebase(merged);
    }
  };

  const pushHistorySnapshot = () => {
    if (!selectedNote) return;
    const snapshot: NoteSnapshot = {
      title: selectedNote.title,
      content: selectedNote.content,
      checklist: selectedNote.checklist,
      updatedLabel: selectedNote.updatedLabel,
    };
    updateSelectedNote({
      history: [...selectedNote.history, snapshot],
    });
  };

  // ------- filter + sort -------

  const filteredNotes = useMemo(() => {
    let base = notes;

    // filter by archive/trash
    if (filterMode === 'active') {
      base = base.filter((n) => !n.archived && !n.trashed);
    } else if (filterMode === 'archived') {
      base = base.filter((n) => n.archived && !n.trashed);
    } else if (filterMode === 'trash') {
      base = base.filter((n) => n.trashed);
    }

    // search
    if (search.trim()) {
      const lower = search.toLowerCase();
      base = base.filter((n) => {
        const tagsString = n.tags.join(', ').toLowerCase();
        const text = (
          n.title +
          ' ' +
          n.content +
          ' ' +
          tagsString
        ).toLowerCase();
        return text.includes(lower);
      });
    }

    // pinned first
    const pinned = base.filter((n) => n.pinned && !n.trashed);
    const others = base.filter((n) => !n.pinned || n.trashed);

    const sortFn = (a: Note, b: Note) => {
      switch (sortMode) {
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'titleDesc':
          return b.title.localeCompare(a.title);
        case 'oldest':
          return a.id.localeCompare(b.id);
        case 'newest':
        default:
          return b.id.localeCompare(a.id);
      }
    };

    pinned.sort(sortFn);
    others.sort(sortFn);

    return [...pinned, ...others];
  }, [notes, search, filterMode, sortMode]);

  // ------- actions -------

  const handleAddNote = () => {
    const nowId = Date.now().toString();
    const newNote: Note = {
      id: nowId,
      title: 'New note',
      content: 'Tap to edit this note...',
      updatedLabel: 'Just now',
      pinned: false,
      archived: false,
      trashed: false,
      tags: [],
      isChecklist: false,
      checklist: [],
      history: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setEditorVisible(true);

    // FIREBASE: create note in Firestore
    syncNoteToFirebase(newNote);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setEditorVisible(true);
  };

  const handleUpdateNoteField = (field: keyof Note, value: any) => {
    updateSelectedNote({ [field]: value } as any);
  };

  const handleTogglePin = () => {
    if (!selectedNote) return;
    updateSelectedNote({ pinned: !selectedNote.pinned });
  };

  const handleArchive = () => {
    if (!selectedNote) return;
    updateSelectedNote({ archived: !selectedNote.archived, trashed: false });
  };

  const handleTrash = () => {
    if (!selectedNote) return;
    // If you want hard delete when trashing again, you can call deleteNoteFromFirebase here.
    updateSelectedNote({ trashed: !selectedNote.trashed, archived: false });
    // Example hard delete:
    // if (selectedNote.trashed) {
    //   deleteNoteFromFirebase(selectedNote.id);
    // }
  };

  const handleRestoreFromTrash = () => {
    if (!selectedNote) return;
    updateSelectedNote({ trashed: false });
  };

  const handleChangeTags = (tagsText: string) => {
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateSelectedNote({ tags });
  };

  const handleToggleChecklistMode = () => {
    if (!selectedNote) return;
    if (!selectedNote.isChecklist) {
      const lines = selectedNote.content.split('\n').filter((l) => l.trim());
      const checklist: ChecklistItem[] = lines.map((text, idx) => ({
        id: `${selectedNote.id}-chk-${idx}-${Date.now()}`,
        text,
        done: false,
      }));
      updateSelectedNote({
        isChecklist: true,
        checklist,
        content: selectedNote.content,
      });
    } else {
      const joined = selectedNote.checklist.map((c) => c.text).join('\n');
      updateSelectedNote({
        isChecklist: false,
        content: joined,
      });
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!selectedNote) return;
    const checklist = selectedNote.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    updateSelectedNote({ checklist });
  };

  const handleEditChecklistItem = (itemId: string, text: string) => {
    if (!selectedNote) return;
    const checklist = selectedNote.checklist.map((item) =>
      item.id === itemId ? { ...item, text } : item
    );
    updateSelectedNote({ checklist });
  };

  const handleAddChecklistItem = () => {
    if (!selectedNote) return;
    const newItem: ChecklistItem = {
      id: `${selectedNote.id}-chk-${Date.now()}`,
      text: '',
      done: false,
    };
    updateSelectedNote({ checklist: [...selectedNote.checklist, newItem] });
  };

  const handleApplyBullet = () => {
    if (!selectedNote || selectedNote.isChecklist) return;
    const content = selectedNote.content;
    const newContent = content ? `${content}\n- ` : '- ';
    updateSelectedNote({ content: newContent });
  };

  const handleApplyHeading = () => {
    if (!selectedNote) return;
    const title = selectedNote.title.startsWith('# ')
      ? selectedNote.title
      : `# ${selectedNote.title}`;
    updateSelectedNote({ title });
  };

  const handleRevertLastVersion = () => {
    if (!selectedNote || selectedNote.history.length === 0) return;
    const last = selectedNote.history[selectedNote.history.length - 1];
    const newHistory = selectedNote.history.slice(0, -1);
    updateSelectedNote({
      title: last.title,
      content: last.content,
      checklist: last.checklist,
      updatedLabel: `${last.updatedLabel} (restored)`,
      history: newHistory,
    });
  };

  const closeEditor = () => {
    if (selectedNote) {
      const snapshot: NoteSnapshot = {
        title: selectedNote.title,
        content: selectedNote.content,
        checklist: selectedNote.checklist,
        updatedLabel: selectedNote.updatedLabel,
      };
      updateSelectedNote({
        history: [...selectedNote.history, snapshot],
      });
    }
    setEditorVisible(false);
  };

  // ------- render -------

  const renderNote = ({ item }: { item: Note }) => {
    const isSelected = item.id === selectedNoteId;
    const completedCount = item.checklist.filter((c) => c.done).length;

    return (
      <TouchableOpacity
        onPress={() => handleSelectNote(item.id)}
        activeOpacity={0.8}
        style={[
          styles.noteCard,
          isSelected && styles.noteCardSelected,
          item.trashed && styles.noteCardTrashed,
          item.archived && styles.noteCardArchived,
        ]}
      >
        <View style={styles.noteTitleRow}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.pinned ? '📌 ' : ''}
            {item.title}
          </Text>
          {item.isChecklist && (
            <Text style={styles.checklistBadge}>
              {completedCount}/{item.checklist.length}
            </Text>
          )}
        </View>

        {!item.isChecklist ? (
          <Text style={styles.noteContent} numberOfLines={2}>
            {item.content}
          </Text>
        ) : (
          <Text style={styles.noteContent} numberOfLines={2}>
            {item.checklist.map((c) => (c.done ? `☑ ${c.text}` : `☐ ${c.text}`)).join('   ')}
          </Text>
        )}

        {item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.noteDate}>{item.updatedLabel}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>My Notes</Text>
        <Text style={styles.subtitle}>
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
        </Text>
      </View>

      {/* Filter + Sort */}
      <View style={styles.filterRow}>
        <View style={styles.filterGroup}>
          <FilterChip
            label="Active"
            active={filterMode === 'active'}
            onPress={() => setFilterMode('active')}
          />
          <FilterChip
            label="Archived"
            active={filterMode === 'archived'}
            onPress={() => setFilterMode('archived')}
          />
          <FilterChip
            label="Trash"
            active={filterMode === 'trash'}
            onPress={() => setFilterMode('trash')}
          />
        </View>
        <View style={styles.filterGroup}>
          <FilterChip
            label="Newest"
            active={sortMode === 'newest'}
            onPress={() => setSortMode('newest')}
          />
          <FilterChip
            label="Oldest"
            active={sortMode === 'oldest'}
            onPress={() => setSortMode('oldest')}
          />
          <FilterChip
            label="A–Z"
            active={sortMode === 'titleAsc'}
            onPress={() => setSortMode('titleAsc')}
          />
          <FilterChip
            label="Z–A"
            active={sortMode === 'titleDesc'}
            onPress={() => setSortMode('titleDesc')}
          />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notes, tags..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {/* Notes list */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderNote}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notes found.</Text>
            <Text style={styles.emptySubtext}>Try adding a new note.</Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddNote}
        activeOpacity={0.7}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Editor Modal */}
      <Modal
        visible={editorVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditorVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setEditorVisible(false)}
          />
          <View style={styles.modalContent}>
            {selectedNote ? (
              <>
                <View style={styles.modalTopRow}>
                  <TouchableOpacity onPress={handleTogglePin}>
                    <Text style={styles.modalActionText}>
                      {selectedNote.pinned ? 'Unpin' : 'Pin'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleArchive}>
                    <Text style={styles.modalActionText}>
                      {selectedNote.archived ? 'Unarchive' : 'Archive'}
                    </Text>
                  </TouchableOpacity>
                  {selectedNote.trashed ? (
                    <TouchableOpacity onPress={handleRestoreFromTrash}>
                      <Text style={[styles.modalActionText, { color: '#15803d' }]}>
                        Restore
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={handleTrash}>
                      <Text style={[styles.modalActionText, { color: '#b91c1c' }]}>
                        Trash
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.modalLabel}>Tags (comma separated)</Text>
                <TextInput
                  value={selectedNote.tags.join(', ')}
                  onChangeText={handleChangeTags}
                  style={styles.modalInput}
                  placeholder="work, school, idea..."
                  placeholderTextColor="#aaa"
                />

                <View style={styles.formatRow}>
                  <TouchableOpacity style={styles.formatChip} onPress={handleApplyHeading}>
                    <Text style={styles.formatChipText}>H1</Text>
                  </TouchableOpacity>
                  {!selectedNote.isChecklist && (
                    <TouchableOpacity style={styles.formatChip} onPress={handleApplyBullet}>
                      <Text style={styles.formatChipText}>• List</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.formatChip} onPress={handleToggleChecklistMode}>
                    <Text style={styles.formatChipText}>
                      {selectedNote.isChecklist ? 'Text note' : 'Checklist'}
                    </Text>
                  </TouchableOpacity>
                  {selectedNote.history.length > 0 && (
                    <TouchableOpacity
                      style={[styles.formatChip, { backgroundColor: '#fee2e2', borderColor: '#fecaca' }]}
                      onPress={handleRevertLastVersion}
                    >
                      <Text style={[styles.formatChipText, { color: '#b91c1c' }]}>
                        Undo to previous
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={[styles.modalLabel, { marginTop: 4 }]}>Title</Text>
                <TextInput
                  value={selectedNote.title}
                  onChangeText={(text) => handleUpdateNoteField('title', text)}
                  style={styles.modalInput}
                  placeholder="Note title"
                  placeholderTextColor="#aaa"
                />

                <Text style={[styles.modalLabel, { marginTop: 12 }]}>
                  {selectedNote.isChecklist ? 'Checklist' : 'Content'}
                </Text>

                {!selectedNote.isChecklist ? (
                  <TextInput
                    value={selectedNote.content}
                    onChangeText={(text) => handleUpdateNoteField('content', text)}
                    style={styles.modalTextarea}
                    placeholder="Write your note..."
                    placeholderTextColor="#aaa"
                    multiline
                    textAlignVertical="top"
                  />
                ) : (
                  <View style={styles.checklistContainer}>
                    {selectedNote.checklist.map((item) => (
                      <View key={item.id} style={styles.checklistRow}>
                        <TouchableOpacity
                          onPress={() => handleToggleChecklistItem(item.id)}
                          style={[
                            styles.checkbox,
                            item.done && styles.checkboxDone,
                          ]}
                        >
                          {item.done && <Text style={styles.checkboxTick}>✓</Text>}
                        </TouchableOpacity>
                        <TextInput
                          value={item.text}
                          onChangeText={(txt) => handleEditChecklistItem(item.id, txt)}
                          style={styles.checklistInput}
                          placeholder="Checklist item"
                          placeholderTextColor="#aaa"
                        />
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.addChecklistBtn}
                      onPress={handleAddChecklistItem}
                    >
                      <Text style={styles.addChecklistText}>+ Add item</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.modalDate}>{selectedNote.updatedLabel}</Text>

                <TouchableOpacity style={styles.closeBtn} onPress={closeEditor}>
                  <Text style={styles.closeBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={{ textAlign: 'center', color: '#666' }}>
                Select a note to edit
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const FilterChip = ({ label, active, onPress }: ChipProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
  </TouchableOpacity>
);

export default NotesHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 11,
    color: '#374151',
  },
  chipTextActive: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  noteCardSelected: {
    borderColor: '#CFE3FF',
  },
  noteCardTrashed: {
    opacity: 0.4,
  },
  noteCardArchived: {
    borderStyle: 'dashed',
  },
  noteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
    flex: 1,
    marginRight: 4,
  },
  checklistBadge: {
    fontSize: 11,
    color: '#2563eb',
  },
  noteContent: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#e0f2fe',
  },
  tagText: {
    fontSize: 10,
    color: '#0f172a',
  },
  noteDate: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
  emptyState: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
    marginBottom: 2,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 320,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginBottom: 8,
  },
  modalActionText: {
    fontSize: 12,
    color: '#4b5563',
  },
  modalLabel: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  modalTextarea: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 110,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  formatChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f9fafb',
  },
  formatChipText: {
    fontSize: 11,
    color: '#374151',
  },
  checklistContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#fff',
    maxHeight: 220,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxDone: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  checklistInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 2,
    fontSize: 13,
  },
  addChecklistBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addChecklistText: {
    fontSize: 12,
    color: '#2563eb',
  },
  modalDate: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 8,
    textAlign: 'right',
  },
  closeBtn: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
