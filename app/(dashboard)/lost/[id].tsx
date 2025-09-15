import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { createLost, getLostById, updateLost } from "@/services/lostService";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "@/context/AuthContext";
import { uploadImagesToCloudinary } from "@/utils/uploadToCloudinary";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
            setEmail(lost.email ?? user?.email ?? "");
            setImages(lost.serverImageUrls ?? []);
          }
        } finally {
          hideLoader();
        }
      } else {
        setEmail(user?.email ?? "");
      }
    };
    load();
  }, [id]);

  // Validate individual field
  const validateField = (name: string, value: string) => {
    let error = "";
    
    switch (name) {
      case "title":
        if (!value.trim()) error = "Title is required";
        break;
      case "description":
        if (!value.trim()) error = "Description is required";
        break;
      case "location":
        if (!value) error = "Please select a location";
        break;
      case "category":
        if (!value) error = "Please select a category";
        break;
      case "phone":
        if (!value.trim()) error = "Phone is required";
        else if (!/^\d{10}$/.test(value)) error = "Phone must be 10 digits";
        break;
      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const fields = [
      { name: "title", value: title },
      { name: "description", value: description },
      { name: "location", value: location },
      { name: "category", value: category },
      { name: "phone", value: phone },
      { name: "email", value: email }
    ];

    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field.name, field.value)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Pick image from gallery
  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit reached", "You can only upload up to 5 images");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
    });
    
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  // Capture image from camera
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
    
    if (!result.canceled && result.assets) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
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
        Alert.alert("Success", "Lost item added successfully!");
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
        Alert.alert("Success", "Lost item updated successfully!");
      }

      router.back();
    } catch (err) {
      console.error(`Error ${isNew ? "saving" : "updating"} lost item`, err);
      Alert.alert("Error", `Failed to ${isNew ? "save" : "update"} item`);
    } finally {
      setIsSubmitting(false);
      hideLoader();
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-5">
      <Text className="text-3xl font-bold text-blue-800 mb-6 text-center">
        {isNew ? "Report Lost Item" : "Edit Lost Item"}
      </Text>

      {/* Title */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Title *</Text>
        <TextInput
          placeholder="Enter item title"
          className={`border p-4 rounded-lg bg-white ${errors.title ? "border-red-500" : "border-gray-300"}`}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            validateField("title", text);
          }}
          onBlur={() => validateField("title", title)}
        />
        {errors.title && <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>}
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Description *</Text>
        <TextInput
          placeholder="Describe the item in detail"
          multiline
          numberOfLines={4}
          className={`border p-4 rounded-lg bg-white min-h-24 ${errors.description ? "border-red-500" : "border-gray-300"}`}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            validateField("description", text);
          }}
          onBlur={() => validateField("description", description)}
        />
        {errors.description && <Text className="text-red-500 text-xs mt-1">{errors.description}</Text>}
      </View>

      {/* Location Dropdown */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Location (District) *</Text>
        <View className={`border rounded-lg bg-white overflow-hidden ${errors.location ? "border-red-500" : "border-gray-300"}`}>
          <Picker
            selectedValue={location}
            onValueChange={(value) => {
              setLocation(value);
              validateField("location", value);
            }}
          >
            <Picker.Item label="Select District" value="" />
            {SRI_LANKA_DISTRICTS.map((district) => (
              <Picker.Item key={district} label={district} value={district} />
            ))}
          </Picker>
        </View>
        {errors.location && <Text className="text-red-500 text-xs mt-1">{errors.location}</Text>}
      </View>

      {/* Category Dropdown */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Category *</Text>
        <View className={`border rounded-lg bg-white overflow-hidden ${errors.category ? "border-red-500" : "border-gray-300"}`}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => {
              setCategory(value);
              validateField("category", value);
            }}
          >
            <Picker.Item label="Select Category" value="" />
            {CATEGORIES.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>
        {errors.category && <Text className="text-red-500 text-xs mt-1">{errors.category}</Text>}
      </View>

      {/* Contact Information */}
      <View className="mb-4">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Contact Information</Text>
        
        {/* Phone */}
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Phone *</Text>
          <TextInput
            placeholder="07X XXX XXXX"
            keyboardType="phone-pad"
            className={`border p-4 rounded-lg bg-white ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              validateField("phone", text);
            }}
            onBlur={() => validateField("phone", phone)}
            maxLength={10}
          />
          {errors.phone && <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>}
        </View>

        {/* Email */}
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email *</Text>
          <TextInput
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className={`border p-4 rounded-lg bg-white ${errors.email ? "border-red-500" : "border-gray-300"}`}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateField("email", text);
            }}
            onBlur={() => validateField("email", email)}
          />
          {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
        </View>
      </View>

      {/* Images Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Images</Text>
        <Text className="text-sm text-gray-600 mb-3">Add up to 5 photos ({images.length}/5)</Text>
        
        {/* Image Preview */}
        {images.length > 0 && (
          <ScrollView horizontal className="mb-4" showsHorizontalScrollIndicator={false}>
            {images.map((img, index) => (
              <View key={index} className="relative mr-3">
                <Image
                  source={{ uri: img }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Image Buttons */}
        <View className="flex-row justify-between space-x-3">
          <TouchableOpacity
            className="flex-1 bg-blue-100 border border-blue-300 rounded-lg p-4 items-center"
            onPress={pickImage}
            disabled={images.length >= 5}
          >
            <MaterialIcons name="photo-library" size={24} color="#3b82f6" />
            <Text className="text-blue-600 mt-2 text-center">Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-green-100 border border-green-300 rounded-lg p-4 items-center"
            onPress={captureImage}
            disabled={images.length >= 5}
          >
            <MaterialIcons name="camera-alt" size={24} color="#10b981" />
            <Text className="text-green-600 mt-2 text-center">Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-blue-600 rounded-lg p-4 mb-8 flex-row justify-center items-center ${isSubmitting ? "opacity-70" : ""}`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <ActivityIndicator color="white" className="mr-2" />
            <Text className="text-white text-lg font-semibold">
              {isNew ? "Adding..." : "Updating..."}
            </Text>
          </>
        ) : (
          <Text className="text-white text-lg font-semibold">
            {isNew ? "Add Lost Item" : "Update Lost Item"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LostFormScreen;