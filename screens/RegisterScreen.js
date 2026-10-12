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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { colors, spacing, radius, shadow } from "../theme";

export default function RegisterScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await signUp(fullName, email, password);
      Alert.alert("Success", "Account created! You can now log in.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Registration failed", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
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

        <Text style={styles.label}>Full name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor={colors.textLight}
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@loft.com"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
          <Text style={styles.primaryBtnText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  logoWrap: { alignItems: "center", marginVertical: 30 },
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
  footerText: {
    textAlign: "center",
    color: colors.textLight,
    marginTop: 20,
    marginBottom: 40,
  },
  footerLink: { color: colors.primary, fontWeight: "700" },
});