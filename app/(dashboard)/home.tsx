import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { lostRef } from "@/services/lostService";
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { Lost } from "@/types/lost";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";

const HomeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [allItems, setAllItems] = useState<Lost[]>([]);
  const [recentLostItems, setRecentLostItems] = useState<Lost[]>([]);
  const [recentFoundItems, setRecentFoundItems] = useState<Lost[]>([]);
  const [userItems, setUserItems] = useState<Lost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);

    const allItemsQuery = query(lostRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      allItemsQuery,
      (snapshot) => {
        const items: Lost[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Lost, "id">),
        }));

        setAllItems(items);

        // split by status
        const lostItems = items.filter((i) => i.status === "lost");
        const foundItems = items.filter((i) => i.status === "found");

        setRecentLostItems(lostItems.slice(0, 6));
        setRecentFoundItems(foundItems.slice(0, 6));

        if (user) {
          const myItems = items.filter((i) => i.userId === user.uid);
          setUserItems(myItems.slice(0, 3));
        }

        setLoading(false);
      },
      (err) => {
        console.log("Error loading data:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (date: any) => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : date.toDate();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return dateObj.toLocaleDateString();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const renderItemCard = (item: Lost) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => router.push(`/(dashboard)/lost?view=${item.id}`)}
      className="bg-white rounded-2xl p-4 mr-4 w-64 shadow-sm"
    >
      {item.serverImageUrls && item.serverImageUrls.length > 0 && (
        <Image
          source={{ uri: item.serverImageUrls[0] }}
          className="w-full h-40 rounded-xl mb-3"
          resizeMode="cover"
        />
      )}
      <Text className="font-semibold text-gray-800 mb-1" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
        {item.description}
      </Text>
      {item.location && (
        <View className="flex-row items-center">
          <MaterialIcons name="location-on" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
      )}
      <Text className="text-gray-400 text-xs mt-2">
        {formatDate(item.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold text-gray-800">PickMeUp</Text>
            <Text className="text-gray-600">Lost & Found Community</Text>
          </View>
          {user && (
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center"
            >
              <MaterialIcons name="person" size={24} color="#3B82F6" />
            </TouchableOpacity>
          )}
        </View>

        {/* Welcome Message */}
        <View className="bg-blue-50 rounded-2xl p-6">
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            {user
              ? `Welcome back, ${user.email?.split("@")[0]}!`
              : "Welcome to PickMeUp"}
          </Text>
          <Text className="text-gray-600">
            {user
              ? "Help others find their lost items or report your own."
              : "Sign in to report lost or found items and help others."}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-6 mt-6">
        <Text className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {/* Browse Lost */}
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/lost")}
            className="bg-white rounded-2xl p-5 w-[48%] mb-4 shadow-sm items-center"
          >
            <View className="bg-blue-100 w-16 h-16 rounded-full items-center justify-center mb-3">
              <MaterialIcons name="search" size={32} color="#3B82F6" />
            </View>
            <Text className="text-gray-800 font-medium text-center">
              Browse Lost Items
            </Text>
          </TouchableOpacity>

          {/* Report Lost */}
          <TouchableOpacity
            onPress={() => router.push(user ? "/(dashboard)/lost/new" : "/login")}
            className="bg-white rounded-2xl p-5 w-[48%] mb-4 shadow-sm items-center"
          >
            <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-3">
              <MaterialIcons name="add" size={32} color="#10B981" />
            </View>
            <Text className="text-gray-800 font-medium text-center">
              Report Lost Item
            </Text>
          </TouchableOpacity>

          {/* Browse Found */}
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/found")}
            className="bg-white rounded-2xl p-5 w-[48%] mb-4 shadow-sm items-center"
          >
            <View className="bg-purple-100 w-16 h-16 rounded-full items-center justify-center mb-3">
              <MaterialIcons name="inventory" size={32} color="#7C3AED" />
            </View>
            <Text className="text-gray-800 font-medium text-center">
              Browse Found Items
            </Text>
          </TouchableOpacity>

          {/* Report Found */}
          <TouchableOpacity
            onPress={() => router.push(user ? "/(dashboard)/found/new" : "/login")}
            className="bg-white rounded-2xl p-5 w-[48%] mb-4 shadow-sm items-center"
          >
            <View className="bg-yellow-100 w-16 h-16 rounded-full items-center justify-center mb-3">
              <MaterialIcons name="add-location-alt" size={32} color="#F59E0B" />
            </View>
            <Text className="text-gray-800 font-medium text-center">
              Report Found Item
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recently Lost Items */}
      <View className="px-6 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-800">
            Recently Lost
          </Text>
          <TouchableOpacity onPress={() => router.push("/(dashboard)/lost")}>
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        {recentLostItems.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Feather name="package" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-3 text-center">
              No lost items reported yet
            </Text>
            <Text className="text-gray-400 text-center mt-1">
              Be the first to report a lost item
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            {recentLostItems.map(renderItemCard)}
          </ScrollView>
        )}
      </View>

      {/* Recently Found Items */}
      <View className="px-6 mt-6 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-800">
            Recently Found
          </Text>
          <TouchableOpacity onPress={() => router.push("/(dashboard)/found")}>
            <Text className="text-blue-600 font-medium">View All</Text>
          </TouchableOpacity>
        </View>

        {recentFoundItems.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-3 text-center">
              No found items reported yet
            </Text>
            <Text className="text-gray-400 text-center mt-1">
              Be the first to report a found item
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            {recentFoundItems.map(renderItemCard)}
          </ScrollView>
        )}
      </View>

      {/* User's Items */}
      {user && userItems.length > 0 && (
        <View className="px-6 mt-2 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">
              Your Items
            </Text>
            <TouchableOpacity onPress={() => router.push("/profile")}>
              <Text className="text-blue-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            {userItems.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                {item.serverImageUrls && item.serverImageUrls.length > 0 && (
                  <Image
                    source={{ uri: item.serverImageUrls[0] }}
                    className="w-16 h-16 rounded-xl mr-4"
                    resizeMode="cover"
                  />
                )}
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    {item.title}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <View
                      className={`px-2 py-1 rounded-full ${
                        item.status === "found" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          item.status === "found"
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {item.status?.toUpperCase() || "LOST"}
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-xs ml-2">
                      {formatDate(item.createdAt)}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Call to Action for non-logged in users */}
      {!user && (
        <View className="px-6 mt-4 mb-8">
          <View className="bg-blue-50 rounded-2xl p-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Join Our Community
            </Text>
            <Text className="text-gray-600 mb-4">
              Sign in to report lost or found items, help others, and get notified when
              your items are found.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="bg-blue-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold text-center">
                Sign In / Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default HomeScreen;
