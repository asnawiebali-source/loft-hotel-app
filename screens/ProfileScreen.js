import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { colors, spacing, radius, shadow } from "../theme";

export default function ProfileScreen() {
  const { profile, user, signOut } = useContext(AuthContext);

  const MenuItem = ({ icon, label }) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: 60 }}
    >
      <Text style={styles.header}>Profile</Text>

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.full_name || "G").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || "Guest"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>
            {profile?.role?.toUpperCase() || "GUEST"}
          </Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="person-outline" label="Edit Profile" />
        <MenuItem icon="card-outline" label="Payment Methods" />
        <MenuItem icon="notifications-outline" label="Notifications" />
        <MenuItem icon="help-circle-outline" label="Help & Support" />
        <MenuItem icon="information-circle-outline" label="About" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 20 },
  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    ...shadow,
  },
  avatarText: { color: "#FFF", fontSize: 36, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  email: { color: colors.textLight, marginTop: 2 },
  rolePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 10,
  },
  rolePillText: { color: colors.primaryDark, fontWeight: "700", fontSize: 11 },
  menu: { backgroundColor: "#FFF", borderRadius: radius.lg, ...shadow },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuText: { color: colors.text, fontWeight: "500" },
  logoutBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 16,
    borderRadius: radius.pill,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
    marginBottom: 40,
  },
  logoutText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});