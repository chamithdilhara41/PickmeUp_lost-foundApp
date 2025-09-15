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
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { lostRef, deleteLost } from "@/services/lostService";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Lost } from "@/types/lost";
import { useLoader } from "@/context/LoaderContext";
import { useAuth } from "@/context/AuthContext";
import { onSnapshot } from "firebase/firestore";

const LostScreen = () => {
  const [lostItems, setLostItems] = useState<Lost[]>([]);
  const [selectedLost, setSelectedLost] = useState<Lost | null>(null);
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
      lostRef,
      (snapshot) => {
        const allLost: Lost[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Lost, "id">),
        }));
        setLostItems(allLost);
        setLoading(false);
        hideLoader();
      },
      (err) => {
        console.log("Error listening to lost items:", err);
        setLoading(false);
        hideLoader();
      }
    );
    return () => unsubscribe();
  }, []);

  // Search + Filter + Sort
  const filteredItems = useMemo(() => {
    let items = [...lostItems];

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
  }, [lostItems, searchQuery, filterCategory, sortOrder]);

  const handleViewDetails = (lost: Lost) => {
    setSelectedLost(lost);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            showLoader();
            await deleteLost(id);
          } catch (err) {
            console.log("Error deleting lost item", err);
          } finally {
            hideLoader();
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Text className="text-4xl font-bold p-4 pt-10 text-blue-600">
        Lost Items
      </Text>

      {/* Add Button */}
      <View className="absolute bottom-5 right-5 z-10">
        <Pressable
          className="bg-blue-500 rounded-full p-5 shadow-lg"
          onPress={() => router.push("/(dashboard)/lost/new")}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 mx-4 mt-2 shadow-sm border border-gray-300">
        <MaterialIcons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search by title, description or district..."
          className="flex-1 ml-2 text-base"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")} className="p-1">
            <MaterialIcons name="close" size={18} color="gray" />
          </Pressable>
        )}
      </View>

      {/* Filter + Sort */}
      <View className="px-4 mt-3 mb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="py-1"
        >
          {["Electronics", "Clothes", "Pets", "Others"].map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setFilterCategory(filterCategory === cat ? null : cat)}
              className={`px-4 py-2 mr-2 rounded-full ${
                filterCategory === cat 
                  ? "bg-blue-600 border border-blue-700" 
                  : "bg-gray-100 border border-gray-300"
              }`}
              style={({ pressed }) => [
                { 
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.5,
                  elevation: 2,
                }
              ]}
            >
              <Text
                className={`font-medium ${
                  filterCategory === cat ? "text-white" : "text-gray-700"
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          ))}

          {/* Sort button */}
          <Pressable
            onPress={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
            className={`px-4 py-2 mr-2 rounded-full border ${
              sortOrder === "newest" 
                ? "bg-blue-100 border-blue-300" 
                : "bg-blue-200 border-blue-400"
            }`}
            style={({ pressed }) => [
              { 
                transform: [{ scale: pressed ? 0.95 : 1 }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
                elevation: 2,
              }
            ]}
          >
            <Text className="text-blue-700 font-medium">
              {sortOrder === "newest" ? "Newest" : "Oldest"}
            </Text>
          </Pressable>

          {/* Clear filters button */}
          {(filterCategory || searchQuery) && (
            <Pressable
              onPress={() => {
                setFilterCategory(null);
                setSearchQuery("");
              }}
              className="px-4 py-2 mr-2 rounded-full bg-gray-200 border border-gray-400"
              style={({ pressed }) => [
                { 
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 1.5,
                  elevation: 2,
                }
              ]}
            >
              <Text className="text-gray-700 font-medium">Clear All</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Active filter indicator */}
      {filterCategory && (
        <View className="px-4 mb-1">
          <Text className="text-sm text-blue-600">
            Filtering by: <Text className="font-bold">{filterCategory}</Text>
          </Text>
        </View>
      )}

      {/* Loader */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-500">Loading lost items...</Text>
        </View>
      ) : (
        <ScrollView className="mt-3 mb-20">
          {filteredItems.length === 0 ? (
            <View className="flex-1 justify-center items-center mt-10">
              <MaterialIcons name="search-off" size={50} color="#9ca3af" />
              <Text className="text-center text-gray-500 mt-4 text-lg">
                No lost items found
              </Text>
              {(filterCategory || searchQuery) && (
                <Text className="text-center text-gray-400 mt-2">
                  Try adjusting your search or filters
                </Text>
              )}
            </View>
          ) : (
            filteredItems.map((lost) => (
              <View
                key={lost.id}
                className="bg-blue-50 p-4 mb-3 rounded-xl mx-4 shadow-md border border-blue-100"
              >
                {/* Thumbnail images */}
                {lost.serverImageUrls && lost.serverImageUrls.length > 0 && (
                  <ScrollView 
                    horizontal 
                    className="mb-3"
                    showsHorizontalScrollIndicator={false}
                  >
                    {lost.serverImageUrls.map((url, index) => (
                      <Image
                        key={index}
                        source={{ uri: url }}
                        className="w-20 h-20 rounded-lg mr-2"
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}

                <Text className="text-lg font-bold text-blue-700">
                  {lost.title}
                </Text>
                <Text className="text-sm text-gray-700 mb-1" numberOfLines={2}>
                  {lost.description}
                </Text>

                {lost.location && (
                  <View className="flex-row items-center mt-1">
                    <MaterialIcons name="location-on" size={14} color="#6b7280" />
                    <Text className="text-sm text-gray-500 ml-1">
                      {lost.location}
                    </Text>
                  </View>
                )}
                {lost.category && (
                  <View className="flex-row items-center mt-1">
                    <MaterialIcons name="label" size={14} color="#6b7280" />
                    <Text className="text-sm text-gray-500 ml-1">
                      {lost.category}
                    </Text>
                  </View>
                )}

                <View className="flex-row flex-wrap mt-3">
                  <TouchableOpacity
                    className="bg-blue-600 px-3 py-2 rounded mr-2 mb-2"
                    onPress={() => handleViewDetails(lost)}
                  >
                    <Text className="text-white font-semibold text-sm">
                      View Details
                    </Text>
                  </TouchableOpacity>

                  {/* Edit & Delete for owner */}
                  {user?.uid === lost.userId && (
                    <>
                      <TouchableOpacity
                        className="bg-yellow-400 px-3 py-2 rounded mr-2 mb-2"
                        onPress={() => router.push(`/(dashboard)/lost/${lost.id}`)}
                      >
                        <Text className="text-black font-bold text-sm">
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-red-500 px-3 py-2 rounded mr-2 mb-2"
                        onPress={() => lost.id && handleDelete(lost.id)}
                      >
                        <Text className="text-white font-bold text-sm">
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
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
          <View className="w-full bg-white rounded-xl p-4 max-h-[80%] shadow-lg">
            <ScrollView>
              {selectedLost && (
                <>
                  <Text className="text-2xl font-bold text-blue-700 mb-3">
                    {selectedLost.title}
                  </Text>

                  {selectedLost.serverImageUrls && selectedLost.serverImageUrls.length > 0 && (
                    <ScrollView 
                      horizontal 
                      className="mb-3"
                      showsHorizontalScrollIndicator={false}
                    >
                      {selectedLost.serverImageUrls.map((url, index) => (
                        <Image
                          key={index}
                          source={{ uri: url }}
                          className="w-52 h-52 mr-2 rounded-lg"
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  )}

                  <Text className="text-base mb-2">
                    {selectedLost.description}
                  </Text>
                  {selectedLost.location && (
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="location-on" size={16} color="#6b7280" />
                      <Text className="text-gray-600 ml-1">
                        {selectedLost.location}
                      </Text>
                    </View>
                  )}
                  {selectedLost.category && (
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="label" size={16} color="#6b7280" />
                      <Text className="text-gray-600 ml-1">
                        {selectedLost.category}
                      </Text>
                    </View>
                  )}
                </>
              )}

              <TouchableOpacity
                className="bg-red-500 px-4 py-3 rounded mt-4 self-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-white font-bold">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LostScreen;