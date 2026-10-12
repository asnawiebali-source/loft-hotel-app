import React, { useContext } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { colors } from "../theme";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import RoomDetailsScreen from "../screens/RoomDetailsScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import ServiceRequestScreen from "../screens/ServiceRequestScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AdminDashboard from "../screens/AdminDashboard";
import AdminBookingsScreen from "../screens/AdminBookingsScreen";
import AdminRoomsScreen from "../screens/AdminRoomsScreen";
import QRScannerScreen from "../screens/QRScannerScreen";
import HousekeepingScreen from "../screens/HousekeepingScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: "home-outline",
  MyBookings: "calendar-outline",
  Service: "apps-outline",
  Profile: "person-outline",
  Dashboard: "stats-chart-outline",
  Bookings: "list-outline",
  Rooms: "bed-outline",
  Requests: "notifications-outline",
  ScanQR: "qr-code-outline",
  Housekeeping: "sparkles-outline",
};

function GuestTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { paddingBottom: 6, height: 60 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyBookings" component={MyBookingsScreen} />
      <Tab.Screen name="Service" component={ServiceRequestScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { paddingBottom: 6, height: 60 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Bookings" component={AdminBookingsScreen} />
      <Tab.Screen name="Rooms" component={AdminRoomsScreen} />
      <Tab.Screen name="ScanQR" component={QRScannerScreen} />
      <Tab.Screen name="Housekeeping" component={HousekeepingScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, profile, loading } = useContext(AuthContext);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {profile?.role === "admin" ? (
            <Stack.Screen name="Admin" component={AdminTabs} />
          ) : (
            <>
              <Stack.Screen name="Guest" component={GuestTabs} />
              <Stack.Screen
                name="RoomDetails"
                component={RoomDetailsScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}