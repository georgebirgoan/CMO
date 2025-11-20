import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();

  // GOOGLE OAUTH ----------------------------
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "696028825275-206ktunhf0sb9eafu34f0q6lol34l014.apps.googleusercontent.com",
  });

  console.log("Redirect URI:", AuthSession.makeRedirectUri());

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === "success") {
        const token = response.authentication?.accessToken;

        // Get user details from Google API
        const userInfo = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).then((res) => res.json());

        // Save token + user in storage
        await AsyncStorage.setItem("access_token", token!);
        await AsyncStorage.setItem("user", JSON.stringify(userInfo));

        Alert.alert("Welcome", userInfo.name || userInfo.email);
        router.push("/(tabs)");
      }
    };

    handleResponse();
  }, [response]);

  // EMAIL & PASSWORD ------------------------
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      // Fake login example
      if (data.email === "test@gmail.com" && data.password === "1234") {
        // Save token
        await AsyncStorage.setItem("access_token", "fake_token_example");

        // Save fake user object
        const fakeUser = {
          name: "Test User",
          email: data.email,
          picture: null,
        };

        await AsyncStorage.setItem("user", JSON.stringify(fakeUser));

        Alert.alert("Login success", `Welcome ${data.email}`);
        router.push("/(tabs)");
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Invalid email format",
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Email"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password */}
      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required", minLength: 4 }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Password"
            style={styles.input}
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleSubmit(handleLogin)}
        disabled={isSubmitting}
        style={styles.loginButton}
      >
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.or}>OR</Text>

      {/* Google Login */}
      <TouchableOpacity
        onPress={() => promptAsync()}
        disabled={!request}
        style={styles.googleButton}
      >
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

// STYLES ------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F7FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#005C99",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 16,
    borderColor: "#B8E7FF",
    borderWidth: 1,
  },
  error: {
    color: "red",
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  or: {
    marginVertical: 10,
    fontSize: 14,
    color: "#555",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    width: "100%",
  },
  googleText: {
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
  },
});
