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
import QRCode from "react-native-qrcode-svg";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, rooms(room_number, type, image_url)")
      .order("created_at", { ascending: false });
    if (error) console.log("BOOKINGS ERROR:", error);
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const cancelBooking = async (id) => {
    Alert.alert("Cancel Booking", "Are you sure?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          const { error } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", id);
          if (error) Alert.alert("Error", error.message);
          else load();
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (bookings.length === 0)
    return (
      <View style={styles.center}>
        <Ionicons name="calendar-outline" size={60} color={colors.textLight} />
        <Text style={styles.emptyText}>No bookings yet</Text>
        <Text style={styles.emptySub}>Go to Home and book a room!</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.roomNo}>Room {item.rooms?.room_number}</Text>
                <Text style={styles.roomType}>{item.rooms?.type}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      item.status === "confirmed"
                        ? "#E8F5E9"
                        : item.status === "cancelled"
                        ? "#FFEBEE"
                        : "#FFF3E0",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color:
                      item.status === "confirmed"
                        ? colors.success
                        : item.status === "cancelled"
                        ? colors.danger
                        : colors.warning,
                  }}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.datesRow}>
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>{item.check_in}</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={colors.textLight} />
              <View style={styles.dateBox}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>{item.check_out}</Text>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{item.total_amount}</Text>
            </View>

            {item.status === "confirmed" && (
              <View style={styles.qrWrap}>
                <QRCode value={item.qr_code} size={130} />
                <Text style={styles.qrNote}>Show at check-in</Text>
              </View>
            )}

            {item.status !== "cancelled" && item.status !== "checked-out" && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => cancelBooking(item.id)}
              >
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
    padding: 20,
  },
  emptyText: { fontSize: 18, fontWeight: "700", marginTop: 12, color: colors.text },
  emptySub: { color: colors.textLight, marginTop: 4 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: "#FFF",
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: 12,
    ...shadow,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomNo: { fontWeight: "700", fontSize: 16, color: colors.text },
  roomType: { color: colors.textLight, fontSize: 13, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: radius.md,
  },
  dateBox: { flex: 1, alignItems: "center" },
  dateLabel: { fontSize: 11, color: colors.textLight },
  dateValue: { fontWeight: "700", color: colors.text, marginTop: 2 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  totalLabel: { color: colors.textLight },
  totalValue: { fontWeight: "700", color: colors.primary, fontSize: 16 },
  qrWrap: { alignItems: "center", marginTop: 14 },
  qrNote: { fontSize: 12, color: colors.textLight, marginTop: 6 },
  cancelBtn: {
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: radius.pill,
    alignItems: "center",
    marginTop: 12,
  },
  cancelBtnText: { color: colors.danger, fontWeight: "700" },
});