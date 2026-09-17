import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Ministry {
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

const MINISTRIES_DATA: Ministry[] = [
  {
    id: "1",
    name: "Ministério de Louvor",
    description: "Ensaio e alinhamento do grupo de louvor e adoração.",
    category: "Música",
    modality: "Presencial",
    dayOfWeek: "Quinta-feira & Domingo",
    time: "19:00 (Ensaio - Quinta-feira) | (EBD e Culto das 18:00 e 19:30 - Domingo)",
    location: "Primeira Presbiteriana de Cabo Frio",
    leaderName: "Carlos Eduardo",
    leaderInitials: "CE",
    phone: "5522999999999",
    email: "louvor@igreja.com",
  },
  {
    id: "2",
    name: "Ministério de Comunicação",
    description: `Este ministério é dividido em departamentos que são responsáveis pela comunicação visual da nossa igreja.\n\nNossos departamentos incluem os times de:\n\n • **Projeção:** Responsável pela exibição das letras e mídias durante o culto.\n• **Transmissão:** Responsável pela transmissão da ive do yotube duante o culto.\n• **Fotografia:** Responsável pelos registros fotográficos do culto e programações. \n• **Mídia:** Responsável pela criação de artes e vídeos para divulgação nas redes sociais da igreja.`,
    category: "Jovens",
    modality: "Presencial",
    dayOfWeek: "Primera Segunda-feira do mês",
    time: "19:30",
    location: "Primeira Presbiteriana de Cabo Frio",
    leaderName: "Larissa Dolenc",
    leaderInitials: "LA",
    phone: "5522988888888",
    email: "jovens@igreja.com",
  },
  {
    id: "3",
    name: "Ministério Infantil",
    description: "Cuidado e ensino bíblico voltado para crianças.",
    category: "Infantil",
    modality: "Presencial",
    dayOfWeek: "Domingo",
    time: "09:00 às 11:00",
    location: "Sala Kids 01",
    leaderName: "Mariana Souza",
    leaderInitials: "MS",
    phone: "5522977777777",
    email: "kids@igreja.com",
  },
];

const CATEGORIES_LIST = [
  "3 Idade",
  "Adultos",
  "Crianças",
  "Homens",
  "Jovens",
  "Jovens - Homens",
  "Música",
  "Infantil",
];

export default function MinistriesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Estados do Modal de Filtro (Agora utilizando Arrays para múltipla escolha)
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<
    string[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filtra em tempo real por busca e por múltiplas categorias
  const filteredMinistries = MINISTRIES_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some(
        (cat) => cat.toLowerCase() === item.category.toLowerCase(),
      );

    return matchesSearch && matchesCategory;
  });

  const handleSelectCategory = (cat: string) => {
    if (tempSelectedCategories.includes(cat)) {
      // Remove se já estiver selecionado
      setTempSelectedCategories(
        tempSelectedCategories.filter((c) => c !== cat),
      );
    } else {
      // Adiciona se não estiver selecionado
      setTempSelectedCategories([...tempSelectedCategories, cat]);
    }
  };

  const handleApplyCategoryFilter = () => {
    setSelectedCategories(tempSelectedCategories);
    setIsCategoryModalVisible(false);
  };

  const handleOpenMinistryDetails = (item: Ministry) => {
    router.push({
      pathname: "/ministries/ministerydetails",
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

  const renderMinistryItem = ({ item }: { item: Ministry }) => (
    <TouchableOpacity
      style={styles.cardItem}
      activeOpacity={0.8}
      onPress={() => handleOpenMinistryDetails(item)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{item.initials || "MIN"}</Text>
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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
        <Text style={styles.headerTitle}>MINISTÉRIOS</Text>
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
              selectedCategories.length > 0 && styles.filterChipActive,
            ]}
            onPress={() => {
              setTempSelectedCategories(selectedCategories);
              setIsCategoryModalVisible(true);
            }}
          >
            <Text style={styles.filterText}>
              {selectedCategories.length > 0
                ? `Categoria (${selectedCategories.length})`
                : "Categoria"}
            </Text>
            <Ionicons name="chevron-down-outline" size={14} color="#1E796A" />
          </TouchableOpacity>
        </View>

        {/* Lista de Cards */}
        <FlatList
          data={filteredMinistries}
          keyExtractor={(item) => item.id}
          renderItem={renderMinistryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum ministério encontrado.</Text>
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
            <Text style={styles.modalTitle}>Categorias</Text>

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIES_LIST.map((cat) => {
                const isSelected = tempSelectedCategories.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={styles.optionCard}
                    activeOpacity={0.7}
                    onPress={() => handleSelectCategory(cat)}
                  >
                    <Text style={styles.optionText}>{cat}</Text>
                    {/* Substituindo o rádio por um quadrado de seleção (checkbox) */}
                    <View
                      style={[
                        styles.checkboxBox,
                        isSelected && styles.checkboxBoxSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      )}
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
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E0",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxSelected: {
    borderColor: "#25A688",
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
