import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Switch,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { logout } from "../../services/auth.service";

export default function HomeScreen({ setIsLoggedIn }) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSettings();
  }, []);

  const checkBiometricAvailability = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(hasHardware && isEnrolled);
  };

  const loadBiometricSettings = async () => {
    const enabled = await SecureStore.getItemAsync("biometricEnabled");
    setBiometricEnabled(enabled === "true");
  };

  const toggleBiometricLogin = async (enabled) => {
    if (enabled && !isBiometricAvailable) {
      Alert.alert(
        "Biometric Not Available",
        "Please set up biometric authentication in your device settings first."
      );
      return;
    }

    if (enabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to enable biometric login",
      });

      if (result.success) {
        const storedEmail = await SecureStore.getItemAsync("userEmail");
        const storedPassword = await SecureStore.getItemAsync("userPassword");

        if (storedEmail && storedPassword) {
          await SecureStore.setItemAsync(
            "userCredentials",
            JSON.stringify({ email: storedEmail, password: storedPassword })
          );
        }

        await SecureStore.setItemAsync("biometricEnabled", "true");
        setBiometricEnabled(true);
        Alert.alert("Success", "Biometric login enabled");
      } else {
        Alert.alert("Error", "Authentication failed");
      }
    } else {
      await SecureStore.setItemAsync("biometricEnabled", "false");
      await SecureStore.deleteItemAsync("userCredentials");
      setBiometricEnabled(false);
      Alert.alert("Success", "Biometric login disabled");
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (refreshToken) {
        await logout();
      }

      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");

      setIsLoggedIn(false);
    } catch (error) {
      console.log("Logout error:", error);

      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      setIsLoggedIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>You are successfully logged in</Text>

        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Biometric Login</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometricLogin}
              disabled={!isBiometricAvailable}
            />
          </View>

          {!isBiometricAvailable && (
            <Text style={styles.warningText}>
              Biometric authentication is not available on this device
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
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
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  settingsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
  warningText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 10,
    fontStyle: "italic",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
