import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { foundRef, deleteFound } from "@/services/foundService";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Found } from "@/types/found";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "@/context/AuthContext";
import { onSnapshot } from "firebase/firestore";

const FoundScreen = () => {
  const [foundItems, setFoundItems] = useState<Found[]>([]);
  const [selectedFound, setSelectedFound] = useState<Found | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    const unsubscribe = onSnapshot(
      foundRef,
      (snapshot) => {
        const allFound: Found[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Found, "id">),
        }));
        setFoundItems(allFound);
        setLoading(false);
        hideLoader();
      },
      (err) => {
        console.log("Error listening to found items:", err);
        setLoading(false);
        hideLoader();
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter only items with status "found" + Search + Filter + Sort
  const filteredItems = useMemo(() => {
    let items = foundItems.filter(item => item.status === "found");

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filterCategory) {
      items = items.filter((item) => item.category === filterCategory);
    }

    // Sort
    items.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return items;
  }, [foundItems, searchQuery, filterCategory, sortOrder]);

  const handleViewDetails = (found: Found) => {
    setSelectedFound(found);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            showLoader();
            await deleteFound(id);
            Alert.alert("Success", "Item deleted successfully");
          } catch (err) {
            Alert.alert("Error", "Failed to delete item");
          } finally {
            hideLoader();
          }
        },
      },
    ]);
  };

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-4xl font-bold text-gray-800">Found Items</Text>
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/found/new")}
            className="bg-green-600 p-3 rounded-xl shadow-sm"
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 shadow-sm">
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search found items..."
            className="flex-1 ml-2 text-gray-800"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter + Sort */}
      <View className="bg-white px-6 py-3 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
          {["Electronics", "Documents", "Jewelry", "Clothing", "Others"].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}
              className={`px-4 py-2 mr-2 rounded-full ${
                filterCategory === cat 
                  ? "bg-green-600" 
                  : "bg-gray-100"
              }`}
            >
              <Text className={`font-medium ${
                filterCategory === cat ? "text-white" : "text-gray-700"
              }`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            onPress={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className="bg-gray-100 px-4 py-2 mr-2 rounded-full"
          >
            <Text className="text-gray-700 font-medium">
              Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
            </Text>
          </TouchableOpacity>

          {(filterCategory || searchQuery) && (
            <TouchableOpacity
              onPress={() => {
                setFilterCategory(null);
                setSearchQuery("");
              }}
              className="bg-red-100 px-4 py-2 rounded-full"
            >
              <Text className="text-red-700 font-medium">Clear All</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Active filter indicator */}
      {filterCategory && (
        <View className="bg-green-50 px-6 py-2">
          <Text className="text-green-700 text-sm">
            Filtering by: <Text className="font-semibold">{filterCategory}</Text>
          </Text>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-3 text-gray-500">Loading found items...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Feather name="search" size={48} color="#9CA3AF" />
          <Text className="text-lg text-gray-500 mt-4 text-center">
            {searchQuery || filterCategory ? "No matching found items" : "No found items reported yet"}
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            {searchQuery || filterCategory ? "Try adjusting your search or filters" : "Be the first to report a found item"}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 py-4">
          {filteredItems.map((found) => (
            <View
              key={found.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200"
            >
              {/* Images */}
              {found.serverImageUrls && found.serverImageUrls.length > 0 && (
                <ScrollView 
                  horizontal 
                  className="mb-3"
                  showsHorizontalScrollIndicator={false}
                >
                  {found.serverImageUrls.map((url, index) => (
                    <Image
                      key={index}
                      source={{ uri: url }}
                      className="w-20 h-20 rounded-lg mr-2"
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              )}

              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-gray-800 flex-1">
                  {found.title}
                </Text>
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-medium">FOUND</Text>
                </View>
              </View>

              <Text className="text-gray-600 mb-3">{found.description}</Text>

              <View className="space-y-1 mb-3">
                {found.location && (
                  <View className="flex-row items-center">
                    <MaterialIcons name="location-on" size={16} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-1">{found.location}</Text>
                  </View>
                )}
                
                {found.category && (
                  <View className="flex-row items-center">
                    <MaterialIcons name="category" size={16} color="#6B7280" />
                    <Text className="text-gray-500 text-sm ml-1">{found.category}</Text>
                  </View>
                )}
              </View>

              <Text className="text-gray-400 text-xs mb-3">
                Reported {formatDate(found.createdAt)}
              </Text>

              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => handleViewDetails(found)}
                  className="bg-green-600 px-4 py-2 rounded-xl flex-row items-center"
                >
                  <MaterialIcons name="visibility" size={16} color="white" />
                  <Text className="text-white font-medium text-sm ml-1">View Details</Text>
                </TouchableOpacity>

                {user?.uid === found.userId && (
                  <View className="flex-row space-x-2">
                    <TouchableOpacity
                      onPress={() => router.push(`/(dashboard)/found/${found.id}`)}
                      className="bg-gray-200 p-2 rounded-xl"
                    >
                      <MaterialIcons name="edit" size={16} color="#4B5563" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => found.id && handleDelete(found.id)}
                      className="bg-red-100 p-2 rounded-xl"
                    >
                      <MaterialIcons name="delete" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="w-full bg-white rounded-2xl p-6 max-h-[80%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedFound && (
                <>
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-bold text-gray-800">
                      {selectedFound.title}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Status Badge */}
                  <View className="bg-green-100 px-3 py-1 rounded-full self-start mb-4">
                    <Text className="text-green-700 text-sm font-medium">FOUND ITEM</Text>
                  </View>

                  {/* Images */}
                  {selectedFound.serverImageUrls && selectedFound.serverImageUrls.length > 0 && (
                    <ScrollView horizontal className="mb-4" showsHorizontalScrollIndicator={false}>
                      {selectedFound.serverImageUrls.map((url, index) => (
                        <Image
                          key={index}
                          source={{ uri: url }}
                          className="w-64 h-64 mr-3 rounded-xl"
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}

                  <Text className="text-gray-700 text-base mb-4 leading-6">
                    {selectedFound.description}
                  </Text>

                  <View className="space-y-3 mb-4">
                    {selectedFound.location && (
                      <View className="flex-row items-start">
                        <MaterialIcons name="location-on" size={20} color="#10B981" className="mt-1" />
                        <Text className="text-gray-700 ml-3 flex-1">{selectedFound.location}</Text>
                      </View>
                    )}

                    {selectedFound.category && (
                      <View className="flex-row items-start">
                        <MaterialIcons name="category" size={20} color="#10B981" className="mt-1" />
                        <Text className="text-gray-700 ml-3 flex-1">{selectedFound.category}</Text>
                      </View>
                    )}

                    {selectedFound.address && (
                      <View className="flex-row items-start">
                        <MaterialIcons name="home" size={20} color="#10B981" className="mt-1" />
                        <Text className="text-gray-700 ml-3 flex-1">{selectedFound.address}</Text>
                      </View>
                    )}

                    {selectedFound.phone && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${selectedFound.phone}`)}
                        className="flex-row items-start"
                      >
                        <MaterialIcons name="call" size={20} color="#10B981" className="mt-1" />
                        <Text className="text-green-600 ml-3 flex-1 underline">{selectedFound.phone}</Text>
                      </TouchableOpacity>
                    )}

                    {selectedFound.email && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`mailto:${selectedFound.email}`)}
                        className="flex-row items-start"
                      >
                        <MaterialIcons name="email" size={20} color="#10B981" className="mt-1" />
                        <Text className="text-green-600 ml-3 flex-1 underline">{selectedFound.email}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="border-t border-gray-200 pt-3">
                    <Text className="text-gray-500 text-sm">
                      Reported: {formatDate(selectedFound.createdAt)}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Updated: {formatDate(selectedFound.updatedAt)}
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-red-600 px-6 py-3 rounded-xl mt-6"
              >
                <Text className="text-white font-semibold text-center">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FoundScreen;