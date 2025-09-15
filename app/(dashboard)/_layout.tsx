import React from "react"
import { Tabs } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

const tabs = [
  { label: "Home", name: "home", icon: "home-filled" },
  { label: "Losts", name: "lost", icon: "search" },       // 🔍 Lost items
  { label: "Founds", name: "found", icon: "inventory" },  // 📦 Found items
  { label: "Profile", name: "profile", icon: "person" }
] as const

const DashboardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6", // Tailwind blue-500
        tabBarInactiveTintColor: "#6B7280", // Tailwind gray-500
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB", // Tailwind gray-200
          height: 100, // h-20
          paddingTop: 8, // pt-2
          paddingBottom: 20, // pb-5
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
        lazy: true, // Load tabs lazily for performance
      }}
    >
      {tabs.map(({ name, icon, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={icon as any} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  )
}

export default DashboardLayout
