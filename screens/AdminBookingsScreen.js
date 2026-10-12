import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | pending | confirmed | checked-in

  const load = async () => {
    // 1. Fetch bookings with room join only
    const { data: bookingsData, error } = await supabase
      .from("bookings")
      .select("*, rooms(room_number, type)")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("BOOKINGS ERROR:", error);
      setLoading(false);
      return;
    }

    // 2. Fetch profiles for all unique user_ids
    const userIds = [...new Set((bookingsData || []).map((b) => b.user_id))];
    let profilesMap = {};

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      profilesMap = (profilesData || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
    }

    // 3. Merge
    const merged = (bookingsData || []).map((b) => ({
      ...b,
      guest: profilesMap[b.user_id] || null,
    }));

    setBookings(merged);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        load
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
    if (error) Alert.alert("Error", error.message);
    else load();
  };

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "checked-in", label: "Checked In" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Bookings</Text>
        <Text style={styles.count}>{bookings.length} total</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterPill,
              filter === f.key && { backgroundColor: colors.primary },
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && { color: "#FFF" },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredBookings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={50} color={colors.textLight} />
          <Text style={styles.emptyText}>No {filter !== "all" ? filter : ""} bookings</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
          renderItem={({ item }) => {
            const statusColor =
              item.status === "confirmed"
                ? colors.success
                : item.status === "checked-in"
                ? "#1E88E5"
                : item.status === "cancelled"
                ? colors.danger
                : colors.warning;

            const statusBg =
              item.status === "confirmed"
                ? "#E8F5E9"
                : item.status === "checked-in"
                ? "#E3F2FD"
                : item.status === "cancelled"
                ? "#FFEBEE"
                : "#FFF3E0";

            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.guest?.full_name || "G").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {item.guest?.full_name || "Unknown Guest"}
                    </Text>
                    <Text style={styles.sub}>
                      {item.guest?.email || "—"}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Room</Text>
                    <Text style={styles.infoValue}>
                      {item.rooms?.room_number || "—"}
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Check-in</Text>
                    <Text style={styles.infoValue}>{item.check_in}</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Check-out</Text>
                    <Text style={styles.infoValue}>{item.check_out}</Text>
                  </View>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₱{item.total_amount}</Text>
                </View>

                {item.status === "pending" && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: colors.success }]}
                      onPress={() => updateStatus(item.id, "confirmed")}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                      <Text style={styles.btnText}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: colors.danger }]}
                      onPress={() => updateStatus(item.id, "cancelled")}
                    >
                      <Ionicons name="close" size={16} color="#FFF" />
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === "confirmed" && (
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#1E88E5", marginTop: 10 }]}
                    onPress={() => updateStatus(item.id, "checked-in")}
                  >
                    <Ionicons name="log-in-outline" size={16} color="#FFF" />
                    <Text style={styles.btnText}>Check In</Text>
                  </TouchableOpacity>
                )}

                {item.status === "checked-in" && (
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.textLight, marginTop: 10 }]}
                    onPress={() => updateStatus(item.id, "checked-out")}
                  >
                    <Ionicons name="log-out-outline" size={16} color="#FFF" />
                    <Text style={styles.btnText}>Check Out</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
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
  emptyText: { color: colors.textLight, marginTop: 12, fontSize: 15 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    paddingBottom: spacing.sm,
  },
  header: { fontSize: 24, fontWeight: "700", color: colors.text },
  count: { color: colors.textLight },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFF",
    borderRadius: radius.pill,
    ...shadow,
  },
  filterText: { fontWeight: "600", color: colors.text, fontSize: 12 },
  card: {
    backgroundColor: "#FFF",
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: 12,
    ...shadow,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: colors.primaryDark, fontWeight: "700", fontSize: 16 },
  name: { fontWeight: "700", color: colors.text },
  sub: { color: colors.textLight, fontSize: 12 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  infoRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  infoBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: radius.md,
  },
  infoLabel: { fontSize: 10, color: colors.textLight },
  infoValue: { fontWeight: "700", color: colors.text, marginTop: 2, fontSize: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },
  totalLabel: { color: colors.textLight },
  totalValue: { fontWeight: "700", color: colors.primary, fontSize: 16 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  btn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
  },
  btnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
});