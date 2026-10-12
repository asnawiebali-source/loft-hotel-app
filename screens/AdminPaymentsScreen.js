import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";

export default function AdminPaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select(
        "*, bookings(id, check_in, check_out, status, total_amount, rooms(room_number), profiles:user_id(full_name, email))"
      )
      .order("created_at", { ascending: false });

    if (error) console.log("PAYMENTS ERROR:", error);
    setPayments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-payments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        load
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (payments.length === 0)
    return (
      <View style={styles.center}>
        <Ionicons name="cash-outline" size={60} color={colors.textLight} />
        <Text style={styles.emptyText}>No payments yet</Text>
      </View>
    );

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Payments</Text>
        <View style={styles.revenuePill}>
          <Text style={styles.revenueText}>
            ₱{totalRevenue.toLocaleString()}
          </Text>
        </View>
      </View>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
        renderItem={({ item }) => {
          const paid =
            item.status === "paid"
              ? { bg: "#E8F5E9", fg: colors.success }
              : item.status === "refunded"
              ? { bg: "#FFF3E0", fg: colors.warning }
              : { bg: "#FFEBEE", fg: colors.danger };

          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Ionicons name="cash-outline" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {item.bookings?.profiles?.full_name || "Guest"}
                  </Text>
                  <Text style={styles.sub}>
                    {item.bookings?.profiles?.email || "—"}
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: paid.bg }]}>
                  <Text style={[styles.statusText, { color: paid.fg }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Amount</Text>
                  <Text style={styles.infoValue}>₱{item.amount}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Method</Text>
                  <Text style={styles.infoValue}>
                    {item.method?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Room</Text>
                  <Text style={styles.infoValue}>
                    {item.bookings?.rooms?.room_number || "—"}
                  </Text>
                </View>
              </View>

              <Text style={styles.ref}>
                Ref: {item.reference || "N/A"}
              </Text>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          );
        }}
      />
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
  emptyText: { color: colors.textLight, marginTop: 12, fontSize: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  header: { fontSize: 24, fontWeight: "700", color: colors.text },
  revenuePill: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  revenueText: { color: colors.success, fontWeight: "700" },
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
  name: { fontWeight: "700", color: colors.text },
  sub: { color: colors.textLight, fontSize: 12 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  infoRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  infoBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: radius.md,
  },
  infoLabel: { fontSize: 10, color: colors.textLight },
  infoValue: { fontWeight: "700", color: colors.text, marginTop: 2 },
  ref: { color: colors.textLight, fontSize: 11, marginTop: 10 },
  date: { color: colors.textLight, fontSize: 11, marginTop: 2 },
});