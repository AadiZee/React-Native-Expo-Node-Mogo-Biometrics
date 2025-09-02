import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { login } from "../../services/auth.service";

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    checkBiometricSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(hasHardware && isEnrolled);
  };

  const checkBiometricSettings = async () => {
    const enabled = await SecureStore.getItemAsync("biometricEnabled");
    setBiometricEnabled(enabled === "true");
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to login",
        fallbackLabel: "Use Password",
      });

      if (result.success) {
        const storedCredentials = await SecureStore.getItemAsync(
          "userCredentials"
        );
        if (storedCredentials) {
          const { email, password } = JSON.parse(storedCredentials);
          await handleLogin(email, password);
        } else {
          Alert.alert("Error", "No stored credentials found");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication failed");
    }
  };

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    try {
      const response = login(loginEmail, loginPassword);

      const { token, refreshToken } = response.data;

      await SecureStore.setItemAsync("userEmail", loginEmail);
      await SecureStore.setItemAsync("userPassword", loginPassword);

      await SecureStore.setItemAsync("accessToken", token);
      await SecureStore.setItemAsync("refreshToken", refreshToken);

      setIsLoggedIn(true);
    } catch (error) {
      Alert.alert("Error", "Login failed. Please check your credentials.");
    }
  };

  const handleEmailPasswordLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    handleLogin();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>

        {biometricEnabled && isBiometricAvailable && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
          >
            <Text style={styles.biometricButtonText}>
              🔐 Login with Biometrics
            </Text>
          </TouchableOpacity>
        )}

        {/* Debug info - remove this after testing */}
        <Text
          style={{
            textAlign: "center",
            marginBottom: 10,
            fontSize: 12,
            color: "#666",
          }}
        >
          Biometric Available: {isBiometricAvailable ? "Yes" : "No"} | Enabled:{" "}
          {biometricEnabled ? "Yes" : "No"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleEmailPasswordLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.linkText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  biometricButton: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  biometricButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkText: {
    color: "#007AFF",
    textAlign: "center",
    fontSize: 16,
  },
});
