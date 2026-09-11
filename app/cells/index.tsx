import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Cell {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  initials?: string;
  category: string;
  modality: string;
  dayOfWeek: string;
  time: string;
  location: string;
  leaderName: string;
  leaderInitials: string;
  phone: string;
  email: string;
}

const CELLS_DATA: Cell[] = [
  {
    id: "1",
    name: "Célula dos Adolecentes",
    description:
      "Célual da UPA (União Presbiteriana de Adolescentes) para adolecentes entre 12 a 17 anos",
    category: "Música",
    modality: "Presencial",
    dayOfWeek: "Quarta-feira",
    time: "19:30",
    location: "Informado semanalmente no grupo de WhatsApp",
    leaderName: "Everson Tavares",
    leaderInitials: "CE",
    phone: "5522999999999",
    email: "celulacentro@igreja.com",
  },
  {
    id: "2",
    name: "Célula dos Jovens",
    description: `Célula da UMP (União da Mocidade Presbiteriana) para jovens entre 18 a 35 anos.`,
    category: "Jovens",
    modality: "Presencial",
    dayOfWeek: "Primeira Segunda-feira do mês",
    time: "19:30",
    location: "Informado semanalmente no grupo de WhatsApp",
    leaderName: "Larissa Dolenc",
    leaderInitials: "LA",
    phone: "5522988888888",
    email: "celulaconectados@igreja.com",
  },
  {
    id: "3",
    name: "Célula dos Homens",
    description:
      "Célula da UPH (União dos Homens Presbiterianos) para homens entre 36 a 60 anos.",
    category: "Homens",
    modality: "Presencial",
    dayOfWeek: "Quarta-feira",
    time: "19:00",
    location: "Informado semanalmente no grupo de WhatsApp",
    leaderName: "Mariana Souza",
    leaderInitials: "MS",
    phone: "5522977777777",
    email: "celulainfantil@igreja.com",
  },
  {
    id: "4",
    name: "Célula das Mulheres (Lá em Casa)",
    description:
      "Célula da SAF (Socieade Feminia) para mulheres entre 36 a 60 anos.",
    category: "Mulheres",
    modality: "Presencial",
    dayOfWeek: "Quarta-feira",
    time: "19:30",
    location: "Informado semanalmente no grupo de WhatsApp",
    leaderName: "Mariana Souza",
    leaderInitials: "MS",
    phone: "5522977777777",
    email: "celulainfantil@igreja.com",
  },
];

const CATEGORIES_LIST = [
  "Adolecentes",
  "Jovens",
  "Homens",
  "Mulheres",
  "Idosos",
];

export default function CellsScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Estados do Modal de Filtro
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [tempSelectedCategory, setTempSelectedCategory] = useState<
    string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtra em tempo real por busca e por categoria
  const filteredCells = CELLS_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleSelectCategory = (cat: string) => {
    if (tempSelectedCategory === cat) {
      setTempSelectedCategory(null);
    } else {
      setTempSelectedCategory(cat);
    }
  };

  const handleApplyCategoryFilter = () => {
    setSelectedCategory(tempSelectedCategory);
    setIsCategoryModalVisible(false);
  };

  const handleOpenCellDetails = (item: Cell) => {
    router.push({
      pathname: "/cells/cellsdetails",
      params: {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        dayOfWeek: item.dayOfWeek,
        time: item.time,
        location: item.location,
        leaderName: item.leaderName,
        leaderInitials: item.leaderInitials,
        phone: item.phone,
        email: item.email,
      },
    });
  };

  const renderCellItem = ({ item }: { item: Cell }) => (
    <TouchableOpacity
      style={styles.cardItem}
      activeOpacity={0.8}
      onPress={() => handleOpenCellDetails(item)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.initials || "CEL"}</Text>
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {item.category.toUpperCase()}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#1E796A" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CÉLULAS</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        {/* Caixa de Pesquisa */}
        <View
          style={[
            styles.searchContainer,
            isFocused && styles.searchContainerFocused,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={isFocused ? "#1E796A" : "#1E796A"}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              Platform.OS === "web" && ({ outlineStyle: "none" } as any),
            ]}
            placeholder="Busca"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>

        {/* Filtros em Chips */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !!selectedCategory && styles.filterChipActive,
            ]}
            onPress={() => {
              setTempSelectedCategory(selectedCategory);
              setIsCategoryModalVisible(true);
            }}
          >
            <Text style={styles.filterText}>
              {selectedCategory ? selectedCategory : "Categoria"}
            </Text>
            <Ionicons name="chevron-down-outline" size={14} color="#1E796A" />
          </TouchableOpacity>
        </View>

        {/* Lista de Cards */}
        <FlatList
          data={filteredCells}
          keyExtractor={(item) => item.id}
          renderItem={renderCellItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma célula encontrada.</Text>
          }
        />
      </View>

      {/* Modal de Categoria (Bottom Sheet) */}
      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Categoria</Text>

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIES_LIST.map((cat) => {
                const isSelected = tempSelectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={styles.optionCard}
                    activeOpacity={0.7}
                    onPress={() => handleSelectCategory(cat)}
                  >
                    <Text style={styles.optionText}>{cat}</Text>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyCategoryFilter}
            >
              <Text style={styles.applyButtonText}>Ver resultados</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02493D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "transparent",
    marginBottom: 12,
  },
  searchContainerFocused: {
    borderColor: "#34D399",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#02493D",
    borderWidth: 0,
    paddingVertical: 0,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: "#E8F2F0",
  },
  filterText: {
    fontSize: 13,
    color: "#02493D",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 20,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F2F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E796A",
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#02493D",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EBEBEB",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 2,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#333",
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: "center",
    color: "#FFF",
    marginTop: 30,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "80%",
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 20,
  },
  optionsList: {
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2D3748",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E0",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#25A688",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#25A688",
  },
  applyButton: {
    backgroundColor: "#25A688",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
