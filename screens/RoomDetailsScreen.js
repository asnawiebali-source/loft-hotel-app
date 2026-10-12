import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";


const PAYMONGO_FUNCTION_URL =
  "https://bgdpewvpbptwoxjetykf.supabase.co/functions/v1/paymongo-checkout";

export default function RoomDetailsScreen({ route, navigation }) {
  const { room } = route.params;
  const [loading, setLoading] = useState(false);

  
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);
  const [guests, setGuests] = useState(1);

  const nights = Math.max(
    1,
    Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  );
  const total = nights * room.price;

  const fmt = (d) =>
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const onChangeCheckIn = (event, selected) => {
    setShowCheckIn(Platform.OS === "ios");
    if (selected) {
      setCheckIn(selected);
      if (selected >= checkOut) {
        const newOut = new Date(selected);
        newOut.setDate(newOut.getDate() + 1);
        setCheckOut(newOut);
      }
    }
    if (Platform.OS === "android") setShowCheckIn(false);
  };

  const onChangeCheckOut = (event, selected) => {
    setShowCheckOut(Platform.OS === "ios");
    if (selected) {
      if (selected <= checkIn) {
        Alert.alert("Invalid date", "Check-out must be after check-in.");
      } else {
        setCheckOut(selected);
      }
    }
    if (Platform.OS === "android") setShowCheckOut(false);
  };

 
  const bookNow = async () => {
    setLoading(true);
    try {
      
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        throw new Error("You must be logged in to book.");
      }

      
      const { data: booking, error: bookErr } = await supabase
        .from("bookings")
        .insert({
          user_id: userData.user.id,
          room_id: room.id,
          check_in: checkIn.toISOString().split("T")[0],
          check_out: checkOut.toISOString().split("T")[0],
          guests,
          total_amount: total,
          status: "pending",
        })
        .select()
        .single();

      if (bookErr) throw bookErr;

      
      const {
        data: { session },
      } = await supabase.auth.getSession();

      
      const response = await fetch(PAYMONGO_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), 
          description: `Booking - Room ${room.room_number} (${nights} night${
            nights > 1 ? "s" : ""
          })`,
          bookingId: booking.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.checkout_url) {
        throw new Error("No checkout URL returned from PayMongo");
      }

      // 5. Open the PayMongo checkout page
      await WebBrowser.openBrowserAsync(data.checkout_url);

      // 6. Alert user
      Alert.alert(
        "Complete your payment",
        "If you already paid, your booking will be confirmed shortly. Check My Bookings.",
        [
          {
            text: "View My Bookings",
            onPress: () =>
              navigation.navigate("Guest", { screen: "MyBookings" }),
          },
        ]
      );
    } catch (err) {
      console.error("BOOKING ERROR:", err);
      Alert.alert("Booking failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          {room.image_url ? (
            <Image source={{ uri: room.image_url }} style={styles.hero} />
          ) : (
            <View style={[styles.hero, styles.heroFallback]}>
              <Ionicons name="bed" size={80} color={colors.primary} />
            </View>
          )}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Room {room.room_number}</Text>
              <Text style={styles.subtitle}>{room.type}</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>₱{room.price}</Text>
              <Text style={styles.priceSub}>/night</Text>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesRow}>
            <View style={styles.amenity}>
              <Ionicons name="wifi" size={18} color={colors.primary} />
              <Text style={styles.amenityText}>WiFi</Text>
            </View>
            <View style={styles.amenity}>
              <Ionicons name="snow" size={18} color={colors.primary} />
              <Text style={styles.amenityText}>AC</Text>
            </View>
            <View style={styles.amenity}>
              <Ionicons name="tv" size={18} color={colors.primary} />
              <Text style={styles.amenityText}>TV</Text>
            </View>
            <View style={styles.amenity}>
              <Ionicons name="water" size={18} color={colors.primary} />
              <Text style={styles.amenityText}>Shower</Text>
            </View>
          </View>

          {/* Dates */}
          <Text style={styles.sectionTitle}>Select Dates</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowCheckIn(true)}
            >
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{fmt(checkIn)}</Text>
            </TouchableOpacity>

            <Ionicons name="arrow-forward" size={18} color={colors.textLight} />

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowCheckOut(true)}
            >
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{fmt(checkOut)}</Text>
            </TouchableOpacity>
          </View>

          {showCheckIn && (
            <DateTimePicker
              value={checkIn}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={onChangeCheckIn}
            />
          )}
          {showCheckOut && (
            <DateTimePicker
              value={checkOut}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date(checkIn.getTime() + 86400000)}
              onChange={onChangeCheckOut}
            />
          )}

          {/* Guests */}
          <Text style={styles.sectionTitle}>Guests</Text>
          <View style={styles.guestsRow}>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests(Math.max(1, guests - 1))}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.guestsValue}>{guests}</Text>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests(Math.min(6, guests + 1))}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.desc}>
            {room.description ||
              "A comfortable room with modern amenities, ideal for a relaxing stay."}
          </Text>

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                ₱{room.price} × {nights} night{nights > 1 ? "s" : ""}
              </Text>
              <Text style={styles.summaryValue}>₱{total}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₱{total}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.bookBtn,
            (loading || room.status !== "available") && { opacity: 0.5 },
          ]}
          onPress={bookNow}
          disabled={loading || room.status !== "available"}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.bookBtnText}>
              {room.status === "available"
                ? `Pay ₱${total}`
                : "Not Available"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroWrap: { height: 280, position: "relative" },
  hero: { width: "100%", height: "100%" },
  heroFallback: {
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...shadow,
  },
  body: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  subtitle: { color: colors.textLight, marginTop: 4 },
  pricePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  priceText: { color: colors.primaryDark, fontWeight: "700", fontSize: 16 },
  priceSub: { color: colors.primaryDark, fontSize: 11 },
  amenitiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  amenity: { alignItems: "center", gap: 4 },
  amenityText: { fontSize: 12, color: colors.textLight },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: 10,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateBox: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: radius.md,
    ...shadow,
  },
  dateLabel: { fontSize: 11, color: colors.textLight },
  dateValue: { fontWeight: "700", color: colors.text, marginTop: 4 },
  guestsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    padding: 10,
    borderRadius: radius.pill,
    ...shadow,
  },
  guestBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  guestsValue: { fontSize: 18, fontWeight: "700", color: colors.text },
  desc: { color: colors.textLight, lineHeight: 22 },
  summary: {
    marginTop: spacing.lg,
    backgroundColor: "#FFF",
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadow,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryLabel: { color: colors.textLight },
  summaryValue: { color: colors.text, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  totalLabel: { fontWeight: "700", color: colors.text, fontSize: 15 },
  totalValue: { fontWeight: "700", color: colors.primary, fontSize: 18 },
  footer: { padding: spacing.lg, backgroundColor: colors.background },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.pill,
    alignItems: "center",
    ...shadow,
  },
  bookBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});