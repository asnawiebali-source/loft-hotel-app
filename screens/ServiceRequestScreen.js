import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";

const SERVICES = [
  { key: "Room Service", icon: "restaurant-outline" },
  { key: "Housekeeping", icon: "sparkles-outline" },
  { key: "Laundry", icon: "shirt-outline" },
  { key: "Extra Towels", icon: "water-outline" },
  { key: "Food & Drinks", icon: "fast-food-outline" },
  { key: "Transport", icon: "car-outline" },
];

export default function ServiceRequestScreen() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, status, rooms(room_number)")
      .in("status", ["confirmed", "checked-in"]);
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!selectedBooking || !selectedService)
      return Alert.alert("Missing info", "Pick a booking and a service.");

    const { error } = await supabase.from("service_requests").insert({
      booking_id: selectedBooking,
      request_type: selectedService,
      notes,
    });

    if (error) Alert.alert("Error", error.message);
    else {
      Alert.alert("Success ✅", "Request sent to front desk!");
      setSelectedService(null);
      setNotes("");
    }
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
      contentContainerStyle={{ padding: spacing.lg, paddingTop: 60 }}
    >
      <Text style={styles.header}>Room Service</Text>

      <Text style={styles.label}>Select Booking</Text>
      {bookings.length === 0 ? (
        <Text style={styles.emptyText}>No active bookings.</Text>
      ) : (
        bookings.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[
              styles.bookingOption,
              selectedBooking === b.id && styles.bookingOptionActive,
            ]}
            onPress={() => setSelectedBooking(b.id)}
          >
            <Ionicons
              name="bed-outline"
              size={20}
              color={
                selectedBooking === b.id ? "#FFF" : colors.primary
              }
            />
            <Text
              style={[
                styles.bookingOptionText,
                selectedBooking === b.id && { color: "#FFF" },
              ]}
            >
              Room {b.rooms?.room_number} ({b.status})
            </Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.label}>Choose Service</Text>
      <View style={styles.grid}>
        {SERVICES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[
              styles.serviceTile,
              selectedService === s.key && styles.serviceTileActive,
            ]}
            onPress={() => setSelectedService(s.key)}
          >
            <Ionicons
              name={s.icon}
              size={26}
              color={selectedService === s.key ? "#FFF" : colors.primary}
            />
            <Text
              style={[
                styles.serviceText,
                selectedService === s.key && { color: "#FFF" },
              ]}
            >
              {s.key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Any special request..."
        placeholderTextColor={colors.textLight}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity style={styles.submitBtn} onPress={submit}>
        <Text style={styles.submitBtnText}>Submit Request</Text>
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
  header: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 20, marginBottom: 8 },
  emptyText: { color: colors.textLight },
  bookingOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: radius.md,
    marginBottom: 8,
    ...shadow,
  },
  bookingOptionActive: { backgroundColor: colors.primary },
  bookingOptionText: { fontWeight: "600", color: colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceTile: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#FFF",
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    ...shadow,
  },
  serviceTileActive: { backgroundColor: colors.primary },
  serviceText: { fontSize: 11, fontWeight: "600", color: colors.text, textAlign: "center" },
  input: {
    backgroundColor: "#FFF",
    borderRadius: radius.md,
    padding: 14,
    minHeight: 80,
    textAlignVertical: "top",
    ...shadow,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.pill,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
    ...shadow,
  },
  submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});