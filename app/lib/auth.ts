import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getUser() {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export async function getToken() {
  return await AsyncStorage.getItem("access_token");
}

export async function logout() {
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("access_token");
}
