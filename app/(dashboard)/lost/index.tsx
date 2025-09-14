import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image, // 👈 import Image
} from "react-native"
import { useEffect, useState } from "react"
import { deleteLost, lostRef } from "@/services/lostService"
import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Lost } from "@/types/lost"
import { useLoader } from "@/context/LoaderContext"
import { onSnapshot } from "firebase/firestore"

const LostScreen = () => {
  const [lostItems, setLostItems] = useState<Lost[]>([])
  const router = useRouter()
  const { showLoader, hideLoader } = useLoader()

  useEffect(() => {
    showLoader()

    const unsubscribe = onSnapshot(
      lostRef,
      (snapshot) => {
        const allLost: Lost[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Lost, "id">),
        }))
        setLostItems(allLost)
        hideLoader()
      },
      (err) => {
        console.log("Error listening to lost items:", err)
        hideLoader()
      }
    )

    return () => unsubscribe()
  }, [])

  const handleDelete = async (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            showLoader()
            await deleteLost(id)
          } catch (err) {
            console.log("Error deleting lost item", err)
          } finally {
            hideLoader()
          }
        },
      },
    ])
  }

  return (
    <View className="flex-1 w-full">
      <Text className="text-4xl font-bold p-4 top-10">Lost Items</Text>

      {/* Floating Add Button */}
      <View className="absolute bottom-5 right-5 z-10">
        <Pressable
          className="bg-blue-500 rounded-full p-5 shadow-lg"
          onPress={() => router.push("/(dashboard)/lost/new")}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView className="mt-10 mb-20">
        {lostItems.map((lost) => (
          <View
            key={lost.id}
            className="bg-gray-200 p-4 mb-3 rounded-lg mx-4 border border-gray-400"
          >
            {/* 👇 Show image if available */}
            {lost.imageUrl && (
              <Image
                source={{ uri: lost.imageUrl }}
                className="w-full h-40 rounded-md mb-3"
                resizeMode="cover"
              />
            )}

            <Text className="text-lg font-semibold">{lost.title}</Text>
            <Text className="text-sm text-gray-700 mb-2">
              {lost.description}
            </Text>

            {lost.location && (
              <Text className="text-sm text-gray-500 mb-2">
                📍 {lost.location}
              </Text>
            )}
            {lost.category && (
              <Text className="text-sm text-gray-500 mb-2">
                🏷️ {lost.category}
              </Text>
            )}

            <View className="flex-row mt-2">
              <TouchableOpacity
                className="bg-yellow-300 px-3 py-1 rounded"
                onPress={() => router.push(`/(dashboard)/lost/${lost.id}`)}
              >
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500 px-3 py-1 rounded ml-3"
                onPress={() => lost.id && handleDelete(lost.id)}
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default LostScreen
