import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  Alert,
  TextInput,
  StyleSheet,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function HousekeepingScreen() {
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const load = async () => {
    const { data } = await supabase
      .from("housekeeping")
      .select("*, rooms(room_number)")
      .order("scheduled_date", { ascending: true });
    setTasks(data || []);

    const { data: r } = await supabase.from("rooms").select("id, room_number");
    setRooms(r || []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("hk-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "housekeeping" },
        load
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const addTask = async () => {
    if (!selectedRoom) return Alert.alert("Pick a room");
    await supabase.from("housekeeping").insert({
      room_id: selectedRoom,
      scheduled_date: date,
      status: "scheduled",
    });
    load();
  };

  const markDone = async (id) => {
    await supabase.from("housekeeping").update({ status: "done" }).eq("id", id);
    load();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Schedule Task</Text>

      {rooms.map((r) => (
        <Button
          key={r.id}
          title={`Room ${r.room_number}`}
          color={selectedRoom === r.id ? "green" : "gray"}
          onPress={() => setSelectedRoom(r.id)}
        />
      ))}
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <Button title="Add Task" onPress={addTask} />

      <Text style={styles.title}>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>
              Room {item.rooms?.room_number} — {item.scheduled_date}
            </Text>
            <Text>Status: {item.status}</Text>
            {item.status !== "done" && (
              <Button title="Mark Done" onPress={() => markDone(item.id)} />
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
});