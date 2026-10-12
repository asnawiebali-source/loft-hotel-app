import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { colors, spacing, radius, shadow } from "../theme";

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
      Alert.alert("Login failed", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>Guest</Text>
        </View>
      </View>

      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Ionicons name="bed-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.brand}>Loft Hotel</Text>
      </View>

      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor={colors.textLight}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textLight}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
        <Text style={styles.primaryBtnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.footerText}>
          Don't have an account? <Text style={styles.footerLink}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...shadow,
  },
  rolePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  rolePillText: { color: "#FFF", fontWeight: "600" },
  logoWrap: { alignItems: "center", marginVertical: 40 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...shadow,
  },
  brand: { fontSize: 22, fontWeight: "700", color: colors.text },
  label: { color: colors.textLight, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: "#FFF",
    borderRadius: radius.md,
    padding: 16,
    fontSize: 15,
    color: colors.text,
    ...shadow,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.pill,
    alignItems: "center",
    marginTop: 24,
    ...shadow,
  },
  primaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  footerText: { textAlign: "center", color: colors.textLight, marginTop: 20 },
  footerLink: { color: colors.primary, fontWeight: "700" },
});