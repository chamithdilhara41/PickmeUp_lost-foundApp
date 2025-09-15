import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { lostRef, deleteLost, updateLost } from "@/services/lostService";
import { onSnapshot, query, where } from "firebase/firestore";
import { Lost } from "@/types/lost";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";

const ProfileScreen = () => {
  const { user, logout, changePassword } = useAuth();
  const router = useRouter();

  const [lostItems, setLostItems] = useState<Lost[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Redirect if user is logged out
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

  // Load user's lost items
  useEffect(() => {
    if (!user) return;

    const q = query(lostRef, where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Lost[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Lost, "id">),
      }));
      setLostItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Logout
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (err) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  // Delete lost item
  const handleDelete = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setDeletingId(id);
            await deleteLost(id);
            Alert.alert("Success", "Item deleted successfully");
          } catch (err) {
            Alert.alert("Error", "Failed to delete item");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  // Mark as found
  const handleMarkFound = async (lost: Lost) => {
    try {
      setUpdatingId(lost.id);
      await updateLost(lost.id, { ...lost, status: "found" });
      Alert.alert("Success", "Item marked as found!");
    } catch (err) {
      Alert.alert("Error", "Failed to update item");
    } finally {
      setUpdatingId(null);
    }
  };

  // Edit lost item
  const handleEdit = (id: string) => {
    router.push(`/(dashboard)/lost/${id}`);
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(currentPassword, newPassword);
      Alert.alert("Success", "Password changed successfully");
      setPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-gray-800">Profile</Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center bg-red-50 px-4 py-2 rounded-xl"
          >
            <MaterialIcons name="logout" size={20} color="#DC2626" />
            <Text className="text-red-600 font-semibold ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-blue-50 rounded-2xl p-6">
          <View className="flex-row items-center">
            <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center mr-4">
              <MaterialIcons name="person" size={32} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-800">Welcome back!</Text>
              <Text className="text-gray-600">{user.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Change Password Section */}
      <View className="bg-white mt-4 px-6 py-4">
        <Text className="text-xl font-semibold text-gray-800 mb-4">Account Security</Text>
        <TouchableOpacity
          onPress={() => setPasswordModalVisible(true)}
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
        >
          <View className="flex-row items-center">
            <MaterialIcons name="lock" size={24} color="#4B5563" />
            <Text className="ml-4 text-gray-800">Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* My Lost Items */}
      <View className="bg-white mt-4 px-6 py-4 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-800">My Lost Items</Text>
          <Text className="text-gray-500">{lostItems.length} items</Text>
        </View>

        {loading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-500 mt-2">Loading your items...</Text>
          </View>
        ) : lostItems.length === 0 ? (
          <View className="py-8 items-center">
            <Feather name="package" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2 text-center">
              You haven't reported any lost items yet
            </Text>
          </View>
        ) : (
          lostItems.map((lost) => (
            <View
              key={lost.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-gray-800 flex-1">{lost.title}</Text>
                <View className={`px-3 py-1 rounded-full ${
                  lost.status === "found" ? "bg-green-100" : "bg-yellow-100"
                }`}>
                  <Text className={`text-xs font-medium ${
                    lost.status === "found" ? "text-green-800" : "text-yellow-800"
                  }`}>
                    {lost.status?.toUpperCase() || "LOST"}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-600 mb-3">{lost.description}</Text>

              {lost.location && (
                <View className="flex-row items-center mb-1">
                  <MaterialIcons name="location-on" size={16} color="#6B7280" />
                  <Text className="text-gray-500 text-sm ml-1">{lost.location}</Text>
                </View>
              )}

              {lost.category && (
                <View className="flex-row items-center mb-1">
                  <MaterialIcons name="category" size={16} color="#6B7280" />
                  <Text className="text-gray-500 text-sm ml-1">{lost.category}</Text>
                </View>
              )}

              <Text className="text-gray-400 text-xs mt-2">
                Reported on {formatDate(lost.createdAt)}
              </Text>

              <View className="flex-row justify-between mt-4">
                {lost.status !== "found" && (
                  <TouchableOpacity
                    onPress={() => handleMarkFound(lost)}
                    disabled={updatingId === lost.id}
                    className="flex-row items-center bg-green-100 px-4 py-2 rounded-xl"
                  >
                    {updatingId === lost.id ? (
                      <ActivityIndicator size="small" color="#059669" />
                    ) : (
                      <MaterialIcons name="check-circle" size={18} color="#059669" />
                    )}
                    <Text className="text-green-800 font-medium ml-2">Mark Found</Text>
                  </TouchableOpacity>
                )}

                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() => handleEdit(lost.id)}
                    className="bg-blue-100 p-2 rounded-xl"
                  >
                    <MaterialIcons name="edit" size={18} color="#3B82F6" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(lost.id)}
                    disabled={deletingId === lost.id}
                    className="bg-red-100 p-2 rounded-xl"
                  >
                    {deletingId === lost.id ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <MaterialIcons name="delete" size={18} color="#DC2626" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Current Password</Text>
              <TextInput
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">New Password</Text>
              <TextInput
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Confirm New Password</Text>
              <TextInput
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={changingPassword}
              className="bg-blue-600 p-4 rounded-xl"
            >
              {changingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold">Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileScreen;