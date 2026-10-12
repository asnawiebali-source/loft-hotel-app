import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "../lib/supabase";

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <Text>Loading...</Text>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Button title="Grant Camera Permission" onPress={requestPermission} />
      </View>
    );
  }

  const handleScan = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, status, room_id, rooms(room_number)")
      .eq("qr_code", data)
      .single();

    if (error || !booking) {
      Alert.alert("❌ Invalid QR");
    } else if (booking.status !== "confirmed") {
      Alert.alert("❌ Not confirmed", `Status: ${booking.status}`);
    } else {
      await supabase
        .from("bookings")
        .update({ status: "checked-in", checked_in_at: new Date() })
        .eq("id", booking.id);

      await supabase
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", booking.room_id);

      Alert.alert("✅ Checked in", `Room ${booking.rooms?.room_number}`);
    }

    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      onBarcodeScanned={scanned ? undefined : handleScan}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});