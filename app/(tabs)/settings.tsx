// SettingsScreen.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock Firebase sync
const startFirebaseSync = async () => console.log("[SYNC] started");
const stopFirebaseSync = async () => console.log("[SYNC] stopped");

export default function SettingsScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Load user from storage
  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    })();
  }, []);

  useEffect(() => {
    syncEnabled ? startFirebaseSync() : stopFirebaseSync();
  }, [syncEnabled]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("access_token");
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* USER PROFILE */}
      <View style={styles.profileCard}>
        {user?.picture ? (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={{ color: "#fff", fontSize: 26 }}>
              {user?.name?.charAt(0) || "?"}
            </Text>
          </View>
        )}

        <Text style={styles.userName}>{user?.name || "Unknown User"}</Text>
        <Text style={styles.userEmail}>{user?.email || "No email found"}</Text>
      </View>

      {/* APP SETTINGS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Dark mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Sync notes (Firebase)</Text>
          <Switch value={syncEnabled} onValueChange={setSyncEnabled} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Notifications / toasts</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
      </View>

      {/* ACCOUNT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>MyApp v1.0.0</Text>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 25,
    borderRadius: 14,
    marginVertical: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#999",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#222",
  },
  logoutBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    textAlign: "center",
    marginTop: "auto",
    marginBottom: 12,
    color: "#aaa",
    fontSize: 12,
  },
});
