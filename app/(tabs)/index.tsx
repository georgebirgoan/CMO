import React, { useMemo, useState } from 'react';
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

const MOCK_NOTES = [
  { id: '1', title: 'Shopping list', content: 'Milk, eggs, bread, coffee', updatedAt: 'Today' },
  { id: '2', title: 'Ideas for app', content: 'Notes app with tags and colors', updatedAt: 'Yesterday' },
  { id: '3', title: 'Exam prep', content: 'Ch. 3, 4, 6 — algorithms', updatedAt: '2 days ago' },
  { id: '4', title: 'Travel plan', content: 'Bucharest -> Cluj', updatedAt: '3 days ago' },
];

const NotesHome = () => {
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [editorVisible, setEditorVisible] = useState(false);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const lower = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.content.toLowerCase().includes(lower)
    );
  }, [search, notes]);

  const selectedNote = selectedNoteId
    ? notes.find((n) => n.id === selectedNoteId)
    : null;

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New note',
      content: 'Tap to edit this note...',
      updatedAt: 'Just now',
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setEditorVisible(true);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setEditorVisible(true);
  };

  const handleUpdateNote = (field: string, value: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedNoteId
          ? { ...note, [field]: value, updatedAt: 'Just now' }
          : note
      )
    );
  };

  type Note = {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
  };

  const renderNote = ({ item }: { item: Note }) => {
    const isSelected = item.id === selectedNoteId;
    return (
      <TouchableOpacity
        onPress={() => handleSelectNote(item.id)}
        activeOpacity={0.8}
        style={[styles.noteCard, isSelected && styles.noteCardSelected]}
      >
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.noteDate}>{item.updatedAt}</Text>
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

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notes..."
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
                <Text style={styles.modalLabel}>Title</Text>
                <TextInput
                  value={selectedNote.title}
                  onChangeText={(text) => handleUpdateNote('title', text)}
                  style={styles.modalInput}
                  placeholder="Note title"
                  placeholderTextColor="#aaa"
                />

                <Text style={[styles.modalLabel, { marginTop: 12 }]}>
                  Content
                </Text>
                <TextInput
                  value={selectedNote.content}
                  onChangeText={(text) => handleUpdateNote('content', text)}
                  style={styles.modalTextarea}
                  placeholder="Write your note..."
                  placeholderTextColor="#aaa"
                  multiline
                  textAlignVertical="top"
                />

                <Text style={styles.modalDate}>{selectedNote.updatedAt}</Text>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setEditorVisible(false)}
                >
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
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
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
  },
  noteContent: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
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
    minHeight: 260,
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
  modalDate: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 6,
    textAlign: 'right',
  },
  closeBtn: {
    marginTop: 12,
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
