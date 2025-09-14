import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export default function HomeScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "items"));
      const list: any[] = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setItems(list);
    };
    fetchItems();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter ? item.category.toLowerCase() === filter.toLowerCase() : true)
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Filter by category"
        value={filter}
        onChangeText={setFilter}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 15 }}>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.location}</Text>
          </View>
        )}
      />
    </View>
  );
}
