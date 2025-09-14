import { View, Text, TextInput, TouchableOpacity, Alert, Image } from "react-native"
import React, { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { createLost, getLostById, updateLost } from "@/services/lostService"
import { useLoader } from "@/context/LoaderContext"
import { useAuth } from "@/context/AuthContext"
import { uploadImageAsync } from "@/utils/uploadImage" // your upload function

const LostFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const isNew = !id || id === "new"

  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [image, setImage] = useState<string | null>(null) // local URI

  const router = useRouter()
  const { hideLoader, showLoader } = useLoader()
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      if (!isNew && id) {
        try {
          showLoader()
          const lost = await getLostById(id)
          if (lost) {
            setTitle(lost.title)
            setDescription(lost.description)
            setLocation(lost.location ?? "")
            setImage(lost.imageUrl ?? null)
          }
        } finally {
          hideLoader()
        }
      }
    }
    load()
  }, [id])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Title is required")
      return
    }

    try {
      showLoader()

      let imageUrl: string | undefined = undefined
      if (image && image.startsWith("file://")) {
        // Only upload if it's a new local image
        const filename = `${user?.uid}/${Date.now()}.jpg`
        imageUrl = await uploadImageAsync(image, filename)
      } else {
        imageUrl = image ?? undefined
      }

      if (isNew) {
        await createLost({
          title,
          description,
          location,
          imageUrl,
          userId: user?.uid ?? "",
          status: "lost",
        })
      } else {
        await updateLost(id!, { title, description, location, imageUrl })
      }

      router.back()
    } catch (err) {
      console.error(`Error ${isNew ? "saving" : "updating"} lost item`, err)
      Alert.alert("Error", `Failed to ${isNew ? "save" : "update"} item`)
    } finally {
      hideLoader()
    }
  }

  return (
    <View className="flex-1 w-full p-5">
      <Text className="text-2xl font-bold mb-3">
        {isNew ? "Add Lost Item" : "Edit Lost Item"}
      </Text>

      <TextInput
        placeholder="Title"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Description"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        placeholder="Location"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={location}
        onChangeText={setLocation}
      />

      {image && (
        <Image
          source={{ uri: image }}
          className="w-full h-40 rounded-md my-2"
          resizeMode="cover"
        />
      )}
      <TouchableOpacity
        className="bg-gray-500 rounded-md px-6 py-3 my-2"
        onPress={pickImage}
      >
        <Text className="text-white text-lg">Choose Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-blue-400 rounded-md px-6 py-3 my-2"
        onPress={handleSubmit}
      >
        <Text className="text-xl text-white text-center">
          {isNew ? "Add Lost Item" : "Update Lost Item"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default LostFormScreen
