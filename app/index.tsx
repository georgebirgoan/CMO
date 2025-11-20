import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";


export default function StartPoint() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const token = await AsyncStorage.getItem("access_token");
      router.replace(token ? "/(tabs)" : "/(auth)/login");
    };
    check();
  }, []);




  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
