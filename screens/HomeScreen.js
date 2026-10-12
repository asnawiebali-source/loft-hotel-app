import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { profile } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadRooms() {
      const { data, error } = await supabase.from("rooms").select("*");
      if (error) console.log("ROOMS ERROR:", error);
      else setRooms(data || []);
      setLoading(false);
    }
    loadRooms();
  }, []);

  const filtered = rooms.filter((r) =>
    r.room_number.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day 👋</Text>
          <Text style={styles.name}>{profile?.full_name || "Guest"}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Welcome to Loft Hotel</Text>
        <Text style={styles.bannerSub}>Book your perfect stay experience</Text>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate("Rooms")}
        >
          <Ionicons name="bed-outline" size={22} color="#FFF" />
          <Text style={styles.statValueLight}>
            {rooms.filter((r) => r.status === "available").length}
          </Text>
          <Text style={styles.statLabelLight}>Available</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: "#FFF" }]}
          onPress={() => navigation.navigate("MyBookings")}
        >
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={styles.statValue}>My Bookings</Text>
          <Text style={styles.statLabel}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            placeholder="Search room..."
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Available Rooms</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: spacing.lg }}
      >
        {rooms.slice(0, 4).map((room) => (
          <TouchableOpacity
            key={room.id}
            style={styles.featureCard}
            onPress={() => navigation.navigate("RoomDetails", { room })}
          >
            <View style={styles.featureImgWrap}>
              {room.image_url ? (
                <Image
                  source={{ uri: room.image_url }}
                  style={styles.featureImg}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="bed" size={40} color={colors.primary} />
              )}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{room.status}</Text>
              </View>
            </View>
            <Text style={styles.featureTitle}>Room {room.room_number}</Text>
            <Text style={styles.featureSub}>{room.type}</Text>
            <Text style={styles.featurePrice}>₱{room.price} / night</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>All Rooms</Text>
      {filtered.map((room) => (
        <TouchableOpacity
          key={room.id}
          style={styles.listCard}
          onPress={() => navigation.navigate("RoomDetails", { room })}
        >
          <View style={styles.listImg}>
            {room.image_url ? (
              <Image
                source={{ uri: room.image_url }}
                style={styles.listImgPhoto}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="bed-outline" size={28} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>Room {room.room_number}</Text>
            <Text style={styles.listSub}>{room.type}</Text>
            <Text style={styles.listPrice}>₱{room.price} / night</Text>
          </View>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  room.status === "available"
                    ? colors.success
                    : colors.danger,
              },
            ]}
          />
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
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
    paddingTop: 60,
  },
  greeting: { color: colors.textLight, fontSize: 14 },
  name: { fontSize: 20, fontWeight: "700", color: colors.text },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    ...shadow,
  },
  banner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 24,
  },
  bannerTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  bannerSub: { color: "#FFF", opacity: 0.9, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: radius.lg,
    ...shadow,
  },
  statValue: { fontSize: 15, fontWeight: "700", color: colors.text, marginTop: 8 },
  statLabel: { color: colors.textLight, fontSize: 12 },
  statValueLight: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 8,
  },
  statLabelLight: { color: "#FFF", opacity: 0.9, fontSize: 12 },
  searchRow: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: radius.md,
    gap: 8,
    ...shadow,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  featureCard: {
    width: 200,
    backgroundColor: "#FFF",
    borderRadius: radius.lg,
    padding: 10,
    marginLeft: spacing.lg,
    ...shadow,
  },
  featureImgWrap: {
    height: 120,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  featureImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  featureTitle: { fontWeight: "700", color: colors.text, paddingHorizontal: 6 },
  featureSub: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: 2,
    paddingHorizontal: 6,
  },
  featurePrice: {
    color: colors.primary,
    fontWeight: "700",
    marginTop: 6,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    padding: 12,
    borderRadius: radius.lg,
    gap: 12,
    ...shadow,
  },
  listImg: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  listImgPhoto: { width: "100%", height: "100%" },
  listTitle: { fontWeight: "700", color: colors.text },
  listSub: { color: colors.textLight, fontSize: 12 },
  listPrice: { color: colors.primary, fontWeight: "700", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});