import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const INITIAL_NOTES = [
  {
    id: '1',
    title: 'Shopping list',
    content: 'Milk, eggs, bread, coffee',
    updatedAt: 'Today',
    reminderAt: null,
  },
  {
    id: '2',
    title: 'Ideas for app',
    content: 'Notes app with tags and colors',
    updatedAt: 'Yesterday',
    reminderAt: null,
  },
];

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  reminderAt: string | null;
};
const formatReminder = (iso: string | number | Date) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString();
};

const NotesWithReminders = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [sortByReminder, setSortByReminder] = useState('none'); // 'none' | 'asc' | 'desc'
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // date/time picker state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date'); // 'date' or 'time'
  const [tempDate, setTempDate] = useState(new Date());

  const selectedNote = selectedNoteId
    ? notes.find((n) => n.id === selectedNoteId)
    : null;

  const filteredNotes = useMemo(() => {
    let base = notes;
    if (search.trim()) {
      const lower = search.toLowerCase();
      base = base.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.content.toLowerCase().includes(lower)
      );
    }
    if (sortByReminder === 'asc') {
      return [...base].sort((a, b) => {
        if (!a.reminderAt && !b.reminderAt) return 0;
        if (!a.reminderAt) return 1;
        if (!b.reminderAt) return -1;
        return new Date(a.reminderAt).getTime() - new Date(b.reminderAt).getTime();
      });
    }
    if (sortByReminder === 'desc') {
      return [...base].sort((a, b) => {
        if (!a.reminderAt && !b.reminderAt) return 0;
        if (!a.reminderAt) return 1;
        if (!b.reminderAt) return -1;
        return new Date(b.reminderAt).getTime() - new Date(a.reminderAt).getTime();
      });
    }
    return base;
  }, [notes, search, sortByReminder]);

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New note',
      content: 'Tap to edit this note...',
      updatedAt: 'Just now',
      reminderAt: null,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  };

  const handleSelectNote = (id: string | null) => {
    setSelectedNoteId(id);
  };

  const updateSelectedNote = (changes: { title?: any; content?: any; reminderAt?: string | null; }) => {
    if (!selectedNoteId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNoteId
          ? { ...n, ...changes, updatedAt: 'Just now' }
          : n
      )
    );
  };

  const handleTitleChange = (text: any) => {
    updateSelectedNote({ title: text });
  };

  const handleContentChange = (text: any) => {
    updateSelectedNote({ content: text });
  };

  // reminder flow:
  // 1. user taps "Set reminder"
  // 2. we show date picker, then (optionally) time picker
  const startSetReminder = () => {
    setPickerMode('date');
    setTempDate(new Date());
    setShowPicker(true);
  };

  const onPickerChange = (event: any, date?: Date) => {
    // Android 'dismissed' or cancelled
    if (event?.type === 'dismissed' || !date) {
      setShowPicker(false);
      return;
    }

    if (pickerMode === 'date') {
      // first choose date, then choose time
      const chosenDate = date;
      setTempDate(chosenDate);
      if (Platform.OS === 'android') {
        // open time picker immediately on android
        setPickerMode('time');
        setShowPicker(true);
      } else {
        // on iOS we keep the picker visible; set to time mode
        setPickerMode('time');
      }
    } else {
      // pickerMode === 'time'
      const finalDate = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        tempDate.getDate(),
        date.getHours(),
        date.getMinutes()
      );
      updateSelectedNote({ reminderAt: finalDate.toISOString() });
      setShowPicker(false);
    }
  };

  const handleClearReminder = () => {
    updateSelectedNote({ reminderAt: null });
  };

  const renderNote = ({ item }: { item: Note }) => {
    const isSelected = item.id === selectedNoteId;
    return (
      <TouchableOpacity
        style={[styles.noteCard, isSelected && styles.noteCardSelected]}
        onPress={() => handleSelectNote(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content}
        </Text>
        {item.reminderAt ? (
          <Text style={styles.noteReminder}>
            Reminder: {formatReminder(item.reminderAt)}
          </Text>
        ) : null}
        <Text style={styles.noteDate}>{item.updatedAt}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* header + actions */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>My Notes</Text>
          <Text style={styles.subtitle}>
            {filteredNotes.length}{' '}
            {filteredNotes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddNote}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* sort + search */}
      <View style={styles.controlsRow}>
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortByReminder === 'none' && styles.sortChipActive,
            ]}
            onPress={() => setSortByReminder('none')}
          >
            <Text
              style={
                sortByReminder === 'none'
                  ? styles.sortChipTextActive
                  : styles.sortChipText
              }
            >
              None
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortByReminder === 'asc' && styles.sortChipActive,
            ]}
            onPress={() => setSortByReminder('asc')}
          >
            <Text
              style={
                sortByReminder === 'asc'
                  ? styles.sortChipTextActive
                  : styles.sortChipText
              }
            >
              Earliest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortByReminder === 'desc' && styles.sortChipActive,
            ]}
            onPress={() => setSortByReminder('desc')}
          >
            <Text
              style={
                sortByReminder === 'desc'
                  ? styles.sortChipTextActive
                  : styles.sortChipText
              }
            >
              Latest
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notes..."
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.mainRow}>
        {/* notes list */}
        <View style={styles.listCol}>
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) => item.id}
            renderItem={renderNote}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>

        {/* editor */}
        <View style={styles.editorCol}>
          {selectedNote ? (
            <>
              <TextInput
                value={selectedNote.title}
                onChangeText={handleTitleChange}
                style={styles.editorTitleInput}
                placeholder="Note title"
                placeholderTextColor="#aaa"
              />
              <TextInput
                value={selectedNote.content}
                onChangeText={handleContentChange}
                style={styles.editorBodyInput}
                placeholder="Write your note..."
                placeholderTextColor="#aaa"
                multiline
                textAlignVertical="top"
              />
              <View style={styles.reminderRow}>
                <View>
                  <Text style={styles.reminderLabel}>Reminder</Text>
                  <Text style={styles.reminderValue}>
                    {selectedNote.reminderAt
                      ? formatReminder(selectedNote.reminderAt)
                      : 'No reminder set'}
                  </Text>
                </View>
                {selectedNote.reminderAt ? (
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={handleClearReminder}
                  >
                    <Text style={styles.clearBtnText}>Clear</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.setBtn}
                    onPress={startSetReminder}
                  >
                    <Text style={styles.setBtnText}>Set</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyEditor}>
              <Text style={styles.emptyEditorText}>
                Select or create a note to edit it.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Date/time picker */}
      {showPicker && (
        <DateTimePicker
          value={tempDate}
          mode={pickerMode}
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
    </SafeAreaView>
  );
};

export default NotesWithReminders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, lineHeight: 22 },
  controlsRow: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  sortLabel: { fontSize: 12, color: '#6b7280', marginRight: 4 },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  sortChipText: { fontSize: 11, color: '#374151' },
  sortChipTextActive: { fontSize: 11, color: '#fff', fontWeight: '600' },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    fontSize: 14,
  },
  mainRow: {
    flex: 1,
    flexDirection: 'row',
  },
  listCol: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  editorCol: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    marginRight: 20,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  noteContent: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  noteReminder: {
    fontSize: 11,
    color: '#2563eb',
    marginTop: 6,
  },
  noteDate: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'right',
  },
  editorTitleInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 6,
  },
  editorBodyInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 120,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  reminderLabel: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  reminderValue: { fontSize: 12, color: '#111827' },
  setBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  setBtnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  clearBtn: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  clearBtnText: { fontSize: 12, color: '#111827' },
  emptyEditor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEditorText: { color: '#9ca3af' },
});

