import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";

export default function AdminDashboard() {
  const navigation = useNavigation();
  const { profile, signOut } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 0,
    available: 0,
    occupied: 0,
    cleaning: 0,
    maintenance: 0,
    occupancyRate: 0,
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    checkedIn: 0,
    revenue: 0,
    pendingRequests: 0,
    scheduledTasks: 0,
  });

  const load = async () => {
    // Rooms
    const { data: rooms } = await supabase.from("rooms").select("status");

    // Bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("status, total_amount");

    // Payments
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, status");

    // Service requests
    const { data: requests } = await supabase
      .from("service_requests")
      .select("status");

    // Housekeeping
    const { data: hk } = await supabase
      .from("housekeeping")
      .select("status");

    const totalRooms = rooms?.length || 0;
    const available = rooms?.filter((r) => r.status === "available").length || 0;
    const occupied = rooms?.filter((r) => r.status === "occupied").length || 0;
    const cleaning = rooms?.filter((r) => r.status === "cleaning").length || 0;
    const maintenance = rooms?.filter((r) => r.status === "maintenance").length || 0;
    const occupancyRate = totalRooms
      ? Math.round((occupied / totalRooms) * 100)
      : 0;

    const totalBookings =
      bookings?.filter((b) => b.status !== "cancelled").length || 0;
    const pendingBookings =
      bookings?.filter((b) => b.status === "pending").length || 0;
    const confirmedBookings =
      bookings?.filter((b) => b.status === "confirmed").length || 0;
    const checkedIn =
      bookings?.filter((b) => b.status === "checked-in").length || 0;

    const revenue =
      payments
        ?.filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    const pendingRequests =
      requests?.filter((r) => r.status === "pending").length || 0;

    const scheduledTasks =
      hk?.filter((h) => h.status !== "done").length || 0;

    setStats({
      totalRooms,
      available,
      occupied,
      cleaning,
      maintenance,
      occupancyRate,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      checkedIn,
      revenue,
      pendingRequests,
      scheduledTasks,
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "housekeeping" }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.adminName}>
            {profile?.full_name || "Admin"}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Occupancy hero card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="trending-up" size={16} color="#FFF" />
            <Text style={styles.heroBadgeText}>
              {stats.occupied}/{stats.totalRooms} rooms
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(stats.occupancyRate, 100)}%` },
            ]}
          />
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.available}</Text>
            <Text style={styles.heroStatLabel}>Available</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.occupied}</Text>
            <Text style={styles.heroStatLabel}>Occupied</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.cleaning}</Text>
            <Text style={styles.heroStatLabel}>Cleaning</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.maintenance}</Text>
            <Text style={styles.heroStatLabel}>Fix</Text>
          </View>
        </View>
      </View>

      {/* KPI row */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons name="cash-outline" size={20} color={colors.success} />
          </View>
          <Text style={styles.kpiValue}>
            ₱{stats.revenue.toLocaleString()}
          </Text>
          <Text style={styles.kpiLabel}>Total Revenue</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="calendar-outline" size={20} color="#1E88E5" />
          </View>
          <Text style={styles.kpiValue}>{stats.totalBookings}</Text>
          <Text style={styles.kpiLabel}>Bookings</Text>
        </View>
      </View>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: "#FFF3E0" }]}>
            <Ionicons name="time-outline" size={20} color={colors.warning} />
          </View>
          <Text style={styles.kpiValue}>{stats.pendingBookings}</Text>
          <Text style={styles.kpiLabel}>Pending Bookings</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIcon, { backgroundColor: "#FCE4EC" }]}>
            <Ionicons name="notifications-outline" size={20} color="#E91E63" />
          </View>
          <Text style={styles.kpiValue}>{stats.pendingRequests}</Text>
          <Text style={styles.kpiLabel}>Pending Requests</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("Rooms")}
        >
          <Ionicons name="bed-outline" size={24} color={colors.primary} />
          <Text style={styles.quickLabel}>Manage Rooms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("Bookings")}
        >
          <Ionicons name="list-outline" size={24} color={colors.primary} />
          <Text style={styles.quickLabel}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("Payments")}
        >
          <Ionicons name="cash-outline" size={24} color={colors.primary} />
          <Text style={styles.quickLabel}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("Requests")}
        >
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.quickLabel}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("ScanQR")}
        >
          <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
          <Text style={styles.quickLabel}>Scan QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => navigation.navigate("Housekeeping")}
        >
          <Ionicons
            name="sparkles-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.quickLabel}>Housekeeping</Text>
        </TouchableOpacity>
      </View>

      {/* Status breakdown */}
      <Text style={styles.sectionTitle}>Bookings Breakdown</Text>
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLeft}>
            <View style={[styles.dot, { backgroundColor: colors.warning }]} />
            <Text style={styles.breakdownLabel}>Pending</Text>
          </View>
          <Text style={styles.breakdownValue}>{stats.pendingBookings}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLeft}>
            <View style={[styles.dot, { backgroundColor: "#1E88E5" }]} />
            <Text style={styles.breakdownLabel}>Confirmed</Text>
          </View>
          <Text style={styles.breakdownValue}>{stats.confirmedBookings}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLeft}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.breakdownLabel}>Checked In</Text>
          </View>
          <Text style={styles.breakdownValue}>{stats.checkedIn}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLeft}>
            <View style={[styles.dot, { backgroundColor: "#E91E63" }]} />
            <Text style={styles.breakdownLabel}>Housekeeping Tasks</Text>
          </View>
          <Text style={styles.breakdownValue}>{stats.scheduledTasks}</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtnBottom} onPress={confirmLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    paddingBottom: spacing.md,
  },
  greeting: { color: colors.textLight, fontSize: 14 },
  adminName: { fontSize: 22, fontWeight: "700", color: colors.text },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    ...shadow,
  },
  heroCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLabel: { color: "#FFF", opacity: 0.9, fontSize: 13 },
  heroValue: { color: "#FFF", fontSize: 40, fontWeight: "800", marginTop: 4 },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heroBadgeText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 5,
  },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  heroStat: { alignItems: "center", flex: 1 },
  heroStatValue: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  heroStatLabel: { color: "#FFF", opacity: 0.9, fontSize: 11, marginTop: 2 },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  kpiRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  kpiValue: { fontSize: 20, fontWeight: "700", color: colors.text },
  kpiLabel: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  quickCard: {
    width: "30.5%",
    aspectRatio: 1,
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    ...shadow,
  },
  quickLabel: { fontSize: 11, fontWeight: "600", color: colors.text },
  breakdownCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { color: colors.text, fontSize: 14 },
  breakdownValue: { fontWeight: "700", color: colors.text },
  logoutBtnBottom: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.danger,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: 16,
    borderRadius: radius.pill,
    justifyContent: "center",
    alignItems: "center",
    ...shadow,
  },
  logoutBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
});