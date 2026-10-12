import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, shadow } from "../theme";

export default function AdminRoomsScreen() {
  const [rooms, setRooms] = useState([]);

  const load = async () => {
    const { data } = await supabase.from("rooms").select("*");
    setRooms(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    await supabase.from("rooms").update({ status }).eq("id", id);
    load();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Rooms</Text>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imgWrap}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.img} />
              ) : (
                <Ionicons name="bed" size={30} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.roomNo}>Room {item.room_number}</Text>
              <Text style={styles.sub}>
                {item.type} — ₱{item.price}
              </Text>
              <Text style={styles.sub}>Status: {item.status}</Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.tiny, { backgroundColor: "#E8F5E9" }]}
                  onPress={() => setStatus(item.id, "available")}
                >
                  <Text style={[styles.tinyText, { color: colors.success }]}>
                    Available
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tiny, { backgroundColor: "#FFF3E0" }]}
                  onPress={() => setStatus(item.id, "cleaning")}
                >
                  <Text style={[styles.tinyText, { color: colors.warning }]}>
                    Cleaning
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tiny, { backgroundColor: "#FFEBEE" }]}
                  onPress={() => setStatus(item.id, "maintenance")}
                >
                  <Text style={[styles.tinyText, { color: colors.danger }]}>
                    Fix
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: 12,
    gap: 12,
    ...shadow,
  },
  imgWrap: {
    width: 70,
    height: 70,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%" },
  roomNo: { fontWeight: "700", fontSize: 15, color: colors.text },
  sub: { color: colors.textLight, fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  tiny: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  tinyText: { fontSize: 11, fontWeight: "700" },
});