import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Platform,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface PrayerRequest {
  id: string;
  name: string;
  date: string;
  category: string;
  description: string;
  isPublic: boolean;
  isMyPost?: boolean;
}

const CATEGORIES_LIST = [
  "Casamento",
  "Espiritual",
  "Estudos",
  "Família",
  "Finanças",
  "Saúde",
  "Geral",
];

export default function PrayerRequestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"todos" | "meus">("todos");
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Estados do Modal de Filtro de Categoria
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [tempSelectedCategory, setTempSelectedCategory] = useState<
    string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Lista com um pedido inicial de exemplo para visualização
  const [prayerList, setPrayerList] = useState<PrayerRequest[]>([
    {
      id: "1",
      name: "Joaquim Ferreira Filho",
      date: "27/04/2026 15:22",
      category: "Geral",
      description:
        "Pelo Pr Pedro Paulo Davi, que está internado no hospital central em Vitória.",
      isPublic: true,
      isMyPost: true,
    },
  ]);

  const filteredPrayers = prayerList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesTab =
      activeTab === "todos" || (activeTab === "meus" && item.isMyPost);

    return matchesSearch && matchesCategory && matchesTab;
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

  const renderPrayerItem = ({ item }: { item: PrayerRequest }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <View style={styles.authorContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{item.name}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.publicBadge}>
          <Text style={styles.publicBadgeText}>
            {item.isPublic ? "Público" : "Privado"}
          </Text>
        </View>
      </View>

      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>
          {item.category.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.cardDescription}>{item.description}</Text>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.likeButton} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={18} color="#E53E3E" />
          <Text style={styles.likeCount}>0</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#02493D" />

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
        <Text style={styles.headerTitle}>PEDIDOS DE ORAÇÃO</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Abas Superiores (Todos / Meus Pedidos) */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "todos" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("todos")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "todos" && styles.tabTextActive,
            ]}
          >
            TODOS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "meus" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("meus")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "meus" && styles.tabTextActive,
            ]}
          >
            MEUS PEDIDOS
          </Text>
        </TouchableOpacity>
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
            color="#1E796A"
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

        {/* Filtro em Chip de Categoria (Estilo Células) */}
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

        {/* Lista de Pedidos */}
        <FlatList
          data={filteredPrayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPrayerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="heart-dislike-outline"
                size={48}
                color="#A7F3D0"
              />
              <Text style={styles.emptyText}>
                Nenhum pedido de oração encontrado.
              </Text>
            </View>
          }
        />
      </View>

      {/* Botão Fixo Inferior Reformulado */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => {
            // Ação para criar pedido futuramente
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>
            Fazer um pedido de oração
          </Text>
        </TouchableOpacity>
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
    paddingVertical: 12,
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: "#FF5252",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
  },
  tabTextActive: {
    color: "#FFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
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
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    textAlign: "center",
    color: "#A7F3D0",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  cardItem: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F2F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E796A",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C53030",
  },
  dateText: {
    fontSize: 12,
    color: "#718096",
  },
  publicBadge: {
    backgroundColor: "#C6F6D5",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  publicBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#22543D",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF2F7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4A5568",
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#2D3748",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCount: {
    fontSize: 13,
    color: "#E53E3E",
    fontWeight: "600",
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#02493D",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  primaryButton: {
    backgroundColor: "#FF5252",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
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
