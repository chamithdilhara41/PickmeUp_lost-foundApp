import { View, Text } from "react-native"
import React from "react"
import { Stack } from "expo-router"

const LostLayout = () => {
  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Do you have anything found?" }} />
    </Stack>
  )
}

export default LostLayout
