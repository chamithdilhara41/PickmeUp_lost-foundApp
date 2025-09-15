import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { createLost, getLostById, updateLost } from "@/services/lostService";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "@/context/AuthContext";
import { uploadImagesToCloudinary } from "@/utils/uploadToCloudinary";
import { Picker } from "@react-native-picker/picker";

// ✅ Sri Lanka districts
const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
];

// ✅ Categories
const CATEGORIES = ["Electronics", "Documents", "Clothes", "Pets", "Bags", "Other"];

const LostFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();
  const { hideLoader, showLoader } = useLoader();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!isNew && id) {
        try {
          showLoader();
          const lost = await getLostById(id);
          if (lost) {
            setTitle(lost.title);
            setDescription(lost.description);
            setLocation(lost.location ?? "");
            setCategory(lost.category ?? "");
            setPhone(lost.phone ?? "");
            setEmail(lost.email ?? user?.email ?? ""); // ✅ auto-fill email
            setImages(lost.serverImageUrls ?? []);
          }
        } finally {
          hideLoader();
        }
      } else {
        // ✅ auto-fill email for new item
        setEmail(user?.email ?? "");
      }
    };
    load();
  }, [id]);

  // pick image from gallery
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit reached", "You can only upload up to 5 images");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // capture image from camera
  const captureImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit reached", "You can only upload up to 5 images");
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // validate form
  const validateForm = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (!location) return "Please select a location";
    if (!category) return "Please select a category";
    if (!phone.trim()) return "Phone is required";
    if (!/^\d{10}$/.test(phone)) return "Phone must be 10 digits";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation", error);
      return;
    }

    try {
      showLoader();
      const localImages = images.filter((img) => img.startsWith("file://"));
      let uploadedUrls: string[] = [];

      if (localImages.length > 0) {
        uploadedUrls = await uploadImagesToCloudinary(localImages);
      }

      const serverImageUrls = [
        ...images.filter((img) => !img.startsWith("file://")),
        ...uploadedUrls,
      ];

      if (isNew) {
        await createLost({
          title,
          description,
          location,
          category,
          phone,
          email,
          serverImageUrls,
          userId: user?.uid ?? "",
          status: "lost",
        });
      } else {
        await updateLost(id!, {
          title,
          description,
          location,
          category,
          phone,
          email,
          serverImageUrls,
        });
      }

      router.back();
    } catch (err) {
      console.error(`Error ${isNew ? "saving" : "updating"} lost item`, err);
      Alert.alert("Error", `Failed to ${isNew ? "save" : "update"} item`);
    } finally {
      hideLoader();
    }
  };

  return (
    <ScrollView className="flex-1 w-full p-5">
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

      {/* Location Dropdown */}
      <Text className="mt-2 mb-1 font-semibold">Location (District)</Text>
      <View className="border border-gray-400 rounded-md mb-2">
        <Picker selectedValue={location} onValueChange={setLocation}>
          <Picker.Item label="Select District" value="" />
          {SRI_LANKA_DISTRICTS.map((district) => (
            <Picker.Item key={district} label={district} value={district} />
          ))}
        </Picker>
      </View>

      {/* Category Dropdown */}
      <Text className="mt-2 mb-1 font-semibold">Category</Text>
      <View className="border border-gray-400 rounded-md mb-2">
        <Picker selectedValue={category} onValueChange={setCategory}>
          <Picker.Item label="Select Category" value="" />
          {CATEGORIES.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      {/* Phone */}
      <TextInput
        placeholder="Phone (10 digits)"
        keyboardType="phone-pad"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Email */}
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        className="border border-gray-400 p-2 my-2 rounded-md"
        value={email}
        onChangeText={setEmail}
      />

      {/* Images */}
      <ScrollView horizontal className="my-2">
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            className="w-24 h-24 rounded-md mr-2"
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View className="flex-row justify-between">
        <TouchableOpacity
          className="flex-1 bg-gray-500 rounded-md px-4 py-3 my-2 mr-2"
          onPress={pickImage}
        >
          <Text className="text-white text-center">Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-green-600 rounded-md px-4 py-3 my-2 ml-2"
          onPress={captureImage}
        >
          <Text className="text-white text-center">Capture Photo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-blue-500 rounded-md px-6 py-3 my-3"
        onPress={handleSubmit}
      >
        <Text className="text-xl text-white text-center">
          {isNew ? "Add Lost Item" : "Update Lost Item"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LostFormScreen;
