// SettingsScreen.js
import EditProfileModal from "@/components/modalEdit/EditProfileModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


export default function SettingsScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [editVisible, setEditVisible] = useState(false);

  // Load user from storage
  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    })();
  }, []);

  // SIMPLE LOGOUT
  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["user", "access_token"]);
    router.replace("/login");
  };

  // RESET APP
  const handleResetApp = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
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
        <Text style={styles.userEmail}>{user?.email || "No email"}</Text>

        {/* EDIT PROFILE */}
      <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditVisible(true)}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>

      </View>

      {/* LANGUAGE SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>

        <View style={styles.langRow}>
          <TouchableOpacity onPress={() => setLanguage("ro")}>
            <Text
              style={[
                styles.langBtn,
                language === "ro" && styles.langBtnActive,
              ]}
            >
              Română
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setLanguage("en")}>
            <Text
              style={[
                styles.langBtn,
                language === "en" && styles.langBtnActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* THEME SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>

        <View style={styles.themeRow}>
          <TouchableOpacity onPress={() => setTheme("light")}>
            <Text
              style={[
                styles.themeBtn,
                theme === "light" && styles.themeBtnActive,
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTheme("dark")}>
            <Text
              style={[
                styles.themeBtn,
                theme === "dark" && styles.themeBtnActive,
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTheme("system")}>
            <Text
              style={[
                styles.themeBtn,
                theme === "system" && styles.themeBtnActive,
              ]}
            >
              System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SUPPORT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity
          style={styles.supportBtn}
          onPress={() => router.push("/")}
        >
          <Text style={styles.supportText}>Get Help / Contact Support</Text>
        </TouchableOpacity>
      </View>

      {/* ACCOUNT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

       
      </View>
      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSave={() => {
          // reload user from storage
          (async () => {
            const u = await AsyncStorage.getItem("user");
            if (u) setUser(JSON.parse(u));
          })();
        }}
/>

      <Text style={styles.footer}>
        MyApp v{Constants.expoConfig?.version} Build{" "}
        {Constants.nativeBuildVersion}
      </Text>
    </SafeAreaView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F6", paddingHorizontal: 20 },

  /* PROFILE */
  profileCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 25,
    borderRadius: 14,
    marginVertical: 14,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarPlaceholder: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: { fontSize: 20, fontWeight: "600", color: "#111" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 4 },

  editBtn: {
    marginTop: 10,
    backgroundColor: "#E0F2FE",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editText: {
    color: "#0369A1",
    fontWeight: "500",
    fontSize: 14,
  },

  /* SECTIONS */
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 13, color: "#999", marginBottom: 10 },

  /* LANGUAGE */
  langRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  langBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    color: "#0F172A",
  },
  langBtnActive: {
    backgroundColor: "#007AFF",
    color: "#fff",
  },

  /* THEME */
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  themeBtn: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: "#334155",
  },
  themeBtnActive: {
    backgroundColor: "#007AFF",
    color: "#fff",
  },

  /* SUPPORT */
  supportBtn: {
    backgroundColor: "#E2E8F0",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  supportText: {
    color: "#1E293B",
    fontWeight: "600",
    fontSize: 15,
  },

  /* ACCOUNT */
  logoutBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  logoutText: { color: "#B91C1C", fontWeight: "700", fontSize: 16 },

  resetBtn: {
    backgroundColor: "#FFE4E6",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  resetText: {
    color: "#BE123C",
    fontWeight: "700",
    fontSize: 15,
  },

  footer: {
    textAlign: "center",
    marginTop: "auto",
    marginBottom: 12,
    color: "#aaa",
    fontSize: 12,
  },
});
