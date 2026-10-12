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

export default function AdminRequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | pending | in-progress | completed

  const load = async () => {
    // 1. Fetch service requests with booking + room info
    const { data: requestsData, error } = await supabase
      .from("service_requests")
      .select(
        "*, bookings(id, user_id, status, rooms(room_number, type))"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.log("REQUESTS ERROR:", error);
      setLoading(false);
      return;
    }

    // 2. Fetch guest profiles for all relevant bookings
    const userIds = [
      ...new Set(
        (requestsData || [])
          .map((r) => r.bookings?.user_id)
          .filter(Boolean)
      ),
    ];

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

    // 3. Merge guest info into each request
    const merged = (requestsData || []).map((r) => ({
      ...r,
      guest: profilesMap[r.bookings?.user_id] || null,
    }));

    setRequests(merged);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        load
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", id);
    if (error) Alert.alert("Error", error.message);
    else load();
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Service Requests</Text>
        <Text style={styles.count}>{requests.length} total</Text>
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

      {filteredRequests.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="notifications-outline"
            size={60}
            color={colors.textLight}
          />
          <Text style={styles.emptyText}>
            No {filter !== "all" ? filter : ""} requests
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
          renderItem={({ item }) => {
            const statusColor =
              item.status === "completed"
                ? colors.success
                : item.status === "in-progress"
                ? colors.warning
                : colors.danger;

            const statusBg =
              item.status === "completed"
                ? "#E8F5E9"
                : item.status === "in-progress"
                ? "#FFF3E0"
                : "#FFEBEE";

            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name="sparkles-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.type}>{item.request_type}</Text>
                    <Text style={styles.sub}>
                      Room {item.bookings?.rooms?.room_number || "—"} ·{" "}
                      {item.guest?.full_name || "Guest"}
                    </Text>
                  </View>
                  <View
                    style={[styles.statusPill, { backgroundColor: statusBg }]}
                  >
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {item.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notes}>{item.notes}</Text>
                  </View>
                ) : null}

                <Text style={styles.date}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>

                {/* Actions */}
                {item.status === "pending" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.warning }]}
                    onPress={() => updateStatus(item.id, "in-progress")}
                  >
                    <Ionicons name="play" size={14} color="#FFF" />
                    <Text style={styles.actionText}>Start</Text>
                  </TouchableOpacity>
                )}

                {item.status === "in-progress" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    onPress={() => updateStatus(item.id, "completed")}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                    <Text style={styles.actionText}>Mark Done</Text>
                  </TouchableOpacity>
                )}

                {item.status === "completed" && (
                  <View style={styles.completedBox}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  type: { fontWeight: "700", color: colors.text, fontSize: 15 },
  sub: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 10, fontWeight: "700" },
  notesBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: radius.md,
    marginTop: 10,
  },
  notesLabel: { fontSize: 10, color: colors.textLight, marginBottom: 2 },
  notes: { color: colors.text, fontStyle: "italic", fontSize: 13 },
  date: { color: colors.textLight, fontSize: 11, marginTop: 10 },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.pill,
    marginTop: 10,
  },
  actionText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  completedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
  },
  completedText: { color: colors.success, fontWeight: "600", fontSize: 13 },
});