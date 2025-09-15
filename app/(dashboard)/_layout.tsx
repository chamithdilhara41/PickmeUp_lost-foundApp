import { View, Text } from "react-native"
import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

const tabs = [
  { label: "Home", name: "home", icon: "home-filled" },
  { label: "Losts", name: "lost", icon: "check-circle" },
  { label: "Founds", name: "found", icon: "check-circle" },
  { label: "Profile", name: "profile", icon: "person" }
] as const

const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6", // Tailwind blue-500
        tabBarInactiveTintColor: "#6B7280", // Tailwind gray-500
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF", // Tailwind white
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB", // Tailwind gray-200
          height: 100, // h-20
          paddingTop: 8, // pt-2
          paddingBottom: 20, // pb-5
        }
      }}
    >
      {tabs.map(({ name, icon, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={icon} color={color} size={size} />
            ),
            tabBarLabelStyle: {
              fontSize: 12, // text-xs
              fontWeight: "500", // font-medium
              marginTop: 4, // mt-1
            }
          }}
        />
      ))}
    </Tabs>
  )
}

export default DashboardLayout