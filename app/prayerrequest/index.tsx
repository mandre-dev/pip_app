import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Animated,
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../src/config/firebase";

interface PrayerRequest {
  id: string;
  authorEmail: string; // E-mail único do criador (ex: "andre@gmail.com")
  name: string; // Nome de exibição
  date: string;
  category: string;
  description: string;
  isPublic: boolean;
  receiveVisit?: boolean;
  receiveCall?: boolean;
  isFinished?: boolean;
  finishComment?: string;
  likedBy?: string[];
}

const STORAGE_KEY = "@prayer_requests_list_v5";
const CURRENT_USER_EMAIL_KEY = "@current_user_email"; // E-mail da conta atualmente logada no app

const getPrayerRequestsDoc = (uid?: string | null) =>
  uid ? doc(db, "users", uid, "appState", "prayerRequests") : null;

const normalizeEmail = (value?: string | null) =>
  value?.trim().toLowerCase() || "";

export default function PrayerRequestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"todos" | "meus">("todos");

  // Conta que está logada atualmente no app (Ex: altere para "mandre@gmail.com" ou "andre@gmail.com" para testar)
  const [currentLoggedEmail, setCurrentLoggedEmail] = useState(() =>
    normalizeEmail(auth.currentUser?.email),
  );
  const [currentLoggedName, setCurrentLoggedName] = useState(
    () => auth.currentUser?.displayName?.trim() || "Membro PIPCF",
  );

  // Estados dos Modais e Listas
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);

  const hasActiveFilters =
    appliedCategories.length > 0 || appliedStatuses.length > 0;

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState("");
  const [displayInApp, setDisplayInApp] = useState<boolean | null>(null);
  const [receiveCall, setReceiveCall] = useState<boolean | null>(null);
  const [receiveVisit, setReceiveVisit] = useState<boolean | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editDisplayInApp, setEditDisplayInApp] = useState<boolean>(true);
  const [editReceiveCall, setEditReceiveCall] = useState<boolean>(false);
  const [editReceiveVisit, setEditReceiveVisit] = useState<boolean>(false);

  const [isFinishModalVisible, setIsFinishModalVisible] = useState(false);
  const [finishingItemId, setFinishingItemId] = useState<string | null>(null);
  const [finishComment, setFinishComment] = useState("");

  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertModalTitle, setAlertModalTitle] = useState("");
  const [alertModalMessage, setAlertModalMessage] = useState("");

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [toastOpacity] = useState(new Animated.Value(0));

  const [prayerList, setPrayerList] = useState<PrayerRequest[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      await loadData(user);
    });

    return () => unsubscribe();
  }, []);

  const loadData = async (currentUser = auth.currentUser) => {
    try {
      if (currentUser) {
        const userEmail = normalizeEmail(currentUser.email);
        const userNameFromAuth = currentUser.displayName?.trim();

        setCurrentLoggedEmail(userEmail);

        let resolvedName = userNameFromAuth || "Membro PIPCF";

        if (!userNameFromAuth) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const firestoreName = userDoc.data()?.name?.trim();
            if (firestoreName) resolvedName = firestoreName;
          }
        }

        setCurrentLoggedName(resolvedName);
        await AsyncStorage.setItem(CURRENT_USER_EMAIL_KEY, userEmail);

        const prayerDoc = getPrayerRequestsDoc(currentUser.uid);
        if (prayerDoc) {
          const prayerSnapshot = await getDoc(prayerDoc);
          if (prayerSnapshot.exists()) {
            const legacyList = prayerSnapshot.data()?.items;
            if (Array.isArray(legacyList)) {
              setPrayerList(legacyList);
            } else {
              setPrayerList([]);
            }
          } else {
            const storedPrayers = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedPrayers) {
              const parsed: PrayerRequest[] = JSON.parse(storedPrayers);
              const list = Array.isArray(parsed) ? parsed : [];
              setPrayerList(list);
              await setDoc(
                prayerDoc,
                {
                  items: list,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true },
              );
            } else {
              setPrayerList([]);
            }
          }
        }
      } else {
        const storedUserEmail = await AsyncStorage.getItem(
          CURRENT_USER_EMAIL_KEY,
        );
        if (storedUserEmail) {
          setCurrentLoggedEmail(normalizeEmail(storedUserEmail));
        } else {
          setCurrentLoggedEmail("");
        }

        const storedPrayers = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPrayers) {
          const parsed: PrayerRequest[] = JSON.parse(storedPrayers);
          setPrayerList(Array.isArray(parsed) ? parsed : []);
        } else {
          setPrayerList([]);
        }
      }
    } catch (error) {
      console.log("Erro ao carregar dados", error);
    }
  };

  const savePrayers = async (newList: PrayerRequest[]) => {
    try {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const prayerDoc = getPrayerRequestsDoc(uid);
        if (prayerDoc) {
          await setDoc(
            prayerDoc,
            {
              items: newList,
              updatedAt: new Date().toISOString(),
            },
            { merge: true },
          );
        }
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (error) {
      console.log("Erro ao salvar", error);
    }
  };

  const showCustomAlert = (title: string, message: string) => {
    setAlertModalTitle(title);
    setAlertModalMessage(message);
    setIsAlertModalVisible(true);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    );
  };

  const applyFilters = () => {
    setAppliedCategories([...selectedCategories]);
    setAppliedStatuses([...selectedStatuses]);
    setIsFilterModalVisible(false);
  };

  const openFilterModal = () => {
    setSelectedCategories([...appliedCategories]);
    setSelectedStatuses([...appliedStatuses]);
    setIsFilterModalVisible(true);
  };

  // Filtragem dos pedidos conforme a aba ativa
  const filteredPrayers = prayerList.filter((item) => {
    const matchesCategory =
      appliedCategories.length === 0 ||
      appliedCategories.some(
        (cat) => cat.toLowerCase() === item.category.toLowerCase(),
      );

    const isOwner =
      normalizeEmail(item.authorEmail) === normalizeEmail(currentLoggedEmail);

    if (activeTab === "todos") {
      if (!item.isPublic || item.isFinished) return false;
      return matchesCategory;
    }

    if (!isOwner) return false;
    if (!matchesCategory) return false;

    if (appliedStatuses.length === 0) {
      return !item.isFinished;
    }

    return appliedStatuses.some((status) => {
      if (status === "publicos") return item.isPublic && !item.isFinished;
      if (status === "privados") return !item.isPublic && !item.isFinished;
      if (status === "finalizados") return item.isFinished;
      return false;
    });
  });

  const handleCreatePrayer = () => {
    if (
      !newCategory ||
      !newDescription.trim() ||
      displayInApp === null ||
      receiveCall === null ||
      receiveVisit === null
    ) {
      showCustomAlert(
        "Campos obrigatórios",
        "Por favor, preencha todos os campos do pedido de oração.",
      );
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newRequest: PrayerRequest = {
      id: String(Date.now()),
      authorEmail: normalizeEmail(currentLoggedEmail),
      name:
        currentLoggedName.trim() ||
        currentLoggedEmail.split("@")[0] ||
        "Usuário",
      date: formattedDate,
      category: newCategory,
      description: newDescription,
      isPublic: displayInApp,
      receiveVisit: receiveVisit,
      receiveCall: receiveCall,
      isFinished: false,
    };

    const updatedList = [newRequest, ...prayerList];
    setPrayerList(updatedList);
    savePrayers(updatedList);

    setNewDescription("");
    setNewCategory(null);
    setDisplayInApp(null);
    setReceiveCall(null);
    setReceiveVisit(null);
    setIsCreateModalVisible(false);

    setSuccessModalTitle("Pedido Criado!");
    setSuccessModalMessage("Seu pedido de oração foi criado com sucesso.");
    setIsSuccessModalVisible(true);
  };

  const handleOpenEditModal = (item: PrayerRequest) => {
    setEditingItemId(item.id);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setEditDisplayInApp(item.isPublic);
    setEditReceiveCall(item.receiveCall ?? false);
    setEditReceiveVisit(item.receiveVisit ?? false);
    setIsEditModalVisible(true);
  };

  const handleUpdatePrayer = () => {
    if (!editCategory || !editDescription.trim()) {
      showCustomAlert("Campo obrigatório", "Preencha todos os campos.");
      return;
    }

    if (editingItemId) {
      const updatedList = prayerList.map((item) => {
        if (item.id === editingItemId) {
          return {
            ...item,
            category: editCategory,
            description: editDescription.trim(),
            isPublic: editDisplayInApp,
            receiveCall: editReceiveCall,
            receiveVisit: editReceiveVisit,
          };
        }
        return item;
      });
      setPrayerList(updatedList);
      savePrayers(updatedList);
    }

    setIsEditModalVisible(false);
    setEditingItemId(null);
    setSuccessModalTitle("Atualizado!");
    setSuccessModalMessage("As alterações foram salvas.");
    setIsSuccessModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (deletingItemId) {
      const updatedList = prayerList.filter(
        (item) => item.id !== deletingItemId,
      );
      setPrayerList(updatedList);
      savePrayers(updatedList);
      showToast("Pedido excluído com sucesso");
    }
    setIsDeleteModalVisible(false);
    setDeletingItemId(null);
  };

  const handleConfirmFinish = () => {
    if (!finishComment.trim()) {
      showCustomAlert("Campo obrigatório", "Preencha o motivo da finalização.");
      return;
    }

    if (finishingItemId) {
      const updatedList = prayerList.map((item) => {
        if (item.id === finishingItemId) {
          return {
            ...item,
            isFinished: true,
            finishComment: finishComment.trim(),
          };
        }
        return item;
      });
      setPrayerList(updatedList);
      savePrayers(updatedList);
    }
    setIsFinishModalVisible(false);
    setFinishingItemId(null);
    setFinishComment("");
    setSuccessModalTitle("Finalizado!");
    setSuccessModalMessage("O pedido foi finalizado com sucesso.");
    setIsSuccessModalVisible(true);
  };

  const toggleLike = async (itemId: string) => {
    const updatedList = prayerList.map((item) => {
      if (item.id !== itemId) return item;

      const likes = item.likedBy || [];
      const currentUserEmail = normalizeEmail(currentLoggedEmail);
      const alreadyLiked = likes.some(
        (email) => normalizeEmail(email) === currentUserEmail,
      );

      const nextLikes = alreadyLiked
        ? likes.filter((email) => normalizeEmail(email) !== currentUserEmail)
        : [...likes, currentUserEmail].filter(Boolean);

      return { ...item, likedBy: nextLikes };
    });

    setPrayerList(updatedList);
    await savePrayers(updatedList);
  };

  const renderPrayerItem = ({ item }: { item: PrayerRequest }) => {
    const isOwner =
      normalizeEmail(item.authorEmail) === normalizeEmail(currentLoggedEmail);
    const currentUserEmail = normalizeEmail(currentLoggedEmail);
    const likedBy = item.likedBy || [];
    const isLiked = likedBy.some(
      (email) => normalizeEmail(email) === currentUserEmail,
    );

    return (
      // CORREÇÃO AQUI: Troque o "&&" por ternário "? styles.cardItemFinished : {}"
      <View
        style={[
          styles.cardItem,
          item.isFinished ? styles.cardItemFinished : {},
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.authorContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>
                {item.name} {isOwner ? "(você)" : ""}
              </Text>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
          <View
            style={[
              styles.publicBadge,
              !item.isPublic ? styles.privateBadge : {},
            ]}
          >
            <Text
              style={[
                styles.publicBadgeText,
                !item.isPublic ? styles.privateBadgeText : {},
              ]}
            >
              {item.isPublic ? "Público" : "Privado"}
            </Text>
          </View>
        </View>
        {/* Restante do código continua igual... */}

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {item.category.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.cardDescription}>{item.description}</Text>

        {item.isFinished && item.finishComment ? (
          <View style={styles.finishedCommentBox}>
            <Text style={styles.finishedCommentTitle}>
              Motivo da finalização:
            </Text>
            <Text style={styles.finishedCommentText}>{item.finishComment}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.likeButton}
            activeOpacity={0.7}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={18}
              color="#E53E3E"
            />
            <Text style={styles.likeCount}>{likedBy.length}</Text>
          </TouchableOpacity>

          {/* Os botões de gerenciamento só aparecem se o usuário atual for o dono do post */}
          {isOwner && (
            <View style={styles.cardActionsRow}>
              {!item.isFinished && (
                <TouchableOpacity
                  style={styles.actionIconButtonDisabled}
                  activeOpacity={0.7}
                  onPress={() => {
                    setFinishingItemId(item.id);
                    setFinishComment("");
                    setIsFinishModalVisible(true);
                  }}
                >
                  <Ionicons name="checkmark" size={16} color="#1E796A" />
                  <Text style={styles.actionFinishText}>Finalizar</Text>
                </TouchableOpacity>
              )}

              {item.isFinished && (
                <View style={styles.finishedBadgeLabel}>
                  <Ionicons name="checkmark-circle" size={14} color="#25A688" />
                  <Text style={styles.finishedBadgeText}>Finalizado</Text>
                </View>
              )}

              {!item.isFinished && (
                <TouchableOpacity
                  style={styles.actionIconButtonEdit}
                  activeOpacity={0.7}
                  onPress={() => handleOpenEditModal(item)}
                >
                  <Ionicons name="pencil-outline" size={16} color="#1E796A" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionTrashButton}
                activeOpacity={0.7}
                onPress={() => {
                  setDeletingItemId(item.id);
                  setIsDeleteModalVisible(true);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#E53E3E" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#02493D" />

      {/* Header Limpo (Sem barra de contas) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/");
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PEDIDOS DE ORAÇÃO</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Abas Superiores */}
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

      <TouchableOpacity
        style={[
          styles.filterButton,
          hasActiveFilters && styles.filterButtonActive,
        ]}
        activeOpacity={0.8}
        onPress={openFilterModal}
      >
        <Ionicons
          name="options-outline"
          size={18}
          color={hasActiveFilters ? "#1E796A" : "#FFF"}
        />
        <Text
          style={[
            styles.filterButtonText,
            hasActiveFilters && styles.filterButtonTextActive,
          ]}
        >
          {hasActiveFilters ? "FILTROS ATIVADOS" : "FILTROS"}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
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

      <Animated.View
        style={[styles.toastContainer, { opacity: toastOpacity }]}
        pointerEvents="none"
      >
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>
            Fazer um pedido de oração
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.filterModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Filtrar pedidos</Text>

            <ScrollView showsVerticalScrollIndicator={true}>
              <Text style={styles.sectionLabel}>Categoria</Text>
              <View style={styles.filterChipsWrap}>
                {[
                  "Casamento",
                  "Espiritual",
                  "Estudos",
                  "Família",
                  "Finanças",
                  "Saúde",
                  "Geral",
                ].map((category) => {
                  const active = selectedCategories.includes(category);
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.filterChip,
                        active && styles.filterChipActive,
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          active && styles.filterChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {activeTab === "meus" && (
                <>
                  <Text style={styles.sectionLabel}>Status do pedido</Text>
                  <View style={styles.filterChipsWrap}>
                    {[
                      { label: "Públicos", value: "publicos" },
                      { label: "Privados", value: "privados" },
                      { label: "Finalizados", value: "finalizados" },
                    ].map((status) => {
                      const active = selectedStatuses.includes(status.value);
                      return (
                        <TouchableOpacity
                          key={status.value}
                          style={[
                            styles.filterChip,
                            active && styles.filterChipActive,
                          ]}
                          onPress={() => toggleStatus(status.value)}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              active && styles.filterChipTextActive,
                            ]}
                          >
                            {status.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.confirmButtonModal}
                onPress={applyFilters}
              >
                <Text style={styles.confirmButtonModalText}>
                  Aplicar filtros
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCreateModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.createModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Pedido de Oração</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catScrollRow}
              >
                {[
                  "Casamento",
                  "Espiritual",
                  "Estudos",
                  "Família",
                  "Finanças",
                  "Saúde",
                  "Geral",
                ].map((cat) => {
                  const isSelected = newCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catBoxItem,
                        isSelected && styles.catBoxItemActive,
                      ]}
                      onPress={() => setNewCategory(isSelected ? null : cat)}
                    >
                      <Text
                        style={[
                          styles.catBoxText,
                          isSelected && styles.catBoxTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TextInput
                style={styles.textAreaInput}
                placeholder="Descrição"
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={4}
                value={newDescription}
                onChangeText={setNewDescription}
                textAlignVertical="top"
              />

              <View style={styles.questionBlock}>
                <Text style={styles.questionTitle}>
                  Gostaria de receber uma visita?
                </Text>
                <View style={styles.radioGroupRow}>
                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setReceiveVisit(true)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        receiveVisit === true && styles.radioCircleSelected,
                      ]}
                    >
                      {receiveVisit === true && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Sim</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setReceiveVisit(false)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        receiveVisit === false && styles.radioCircleSelected,
                      ]}
                    >
                      {receiveVisit === false && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Não</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionTitle}>
                  Gostaria de receber uma ligação de um membro?
                </Text>
                <View style={styles.radioGroupRow}>
                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setReceiveCall(true)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        receiveCall === true && styles.radioCircleSelected,
                      ]}
                    >
                      {receiveCall === true && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioOptionLabel}>Sim</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setReceiveCall(false)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        receiveCall === false && styles.radioCircleSelected,
                      ]}
                    >
                      {receiveCall === false && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Não</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionTitle}>
                  Este pedido será Público ou Privado?
                </Text>
                <Text style={styles.questionSubtitle}>
                  Caso o pedido seja{" "}
                  <Text style={{ fontWeight: "bold" }}>Público</Text> ele será
                  exibido no mural. Se for{" "}
                  <Text style={{ fontWeight: "bold" }}>Privado</Text> ficará
                  visível apenas para você e a gestão.
                </Text>
                <View style={styles.radioGroupRow}>
                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setDisplayInApp(true)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        displayInApp === true && styles.radioCircleSelected,
                      ]}
                    >
                      {displayInApp === true && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Público</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setDisplayInApp(false)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        displayInApp === false && styles.radioCircleSelected,
                      ]}
                    >
                      {displayInApp === false && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Privado</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmButtonModal}
                onPress={handleCreatePrayer}
              >
                <Text style={styles.confirmButtonModalText}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButtonModal}
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text style={styles.backButtonModalText}>Voltar</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isAlertModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAlertModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successCardContainer}>
            <Text style={styles.alertCardTitle}>{alertModalTitle}</Text>
            <Text style={styles.successCardMessage}>{alertModalMessage}</Text>
            <TouchableOpacity
              style={styles.successOkButton}
              activeOpacity={0.8}
              onPress={() => setIsAlertModalVisible(false)}
            >
              <Text style={styles.successOkButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successCardContainer}>
            <Text style={styles.alertCardTitle}>Excluir pedido</Text>
            <Text style={styles.successCardMessage}>
              Você realmente deseja excluir este pedido de oração?
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                activeOpacity={0.8}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                activeOpacity={0.8}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalDeleteButtonText}>EXCLUIR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSuccessModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successCardContainer}>
            <View style={styles.successCheckCircle}>
              <Ionicons name="checkmark" size={36} color="#FFF" />
            </View>
            <Text style={styles.successCardTitle}>{successModalTitle}</Text>
            <Text style={styles.successCardMessage}>{successModalMessage}</Text>
            <TouchableOpacity
              style={styles.successOkButton}
              activeOpacity={0.8}
              onPress={() => setIsSuccessModalVisible(false)}
            >
              <Text style={styles.successOkButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsEditModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.createModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Editar Pedido de Oração</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.catScrollRow}
              >
                {[
                  "Casamento",
                  "Espiritual",
                  "Estudos",
                  "Família",
                  "Finanças",
                  "Saúde",
                  "Geral",
                ].map((cat) => {
                  const isSelected = editCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catBoxItem,
                        isSelected && styles.catBoxItemActive,
                      ]}
                      onPress={() => setEditCategory(isSelected ? null : cat)}
                    >
                      <Text
                        style={[
                          styles.catBoxText,
                          isSelected && styles.catBoxTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TextInput
                style={styles.textAreaInput}
                placeholder="Descrição"
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={4}
                value={editDescription}
                onChangeText={setEditDescription}
                textAlignVertical="top"
              />

              <View style={styles.questionBlock}>
                <Text style={styles.questionTitle}>
                  Gostaria de receber uma visita?
                </Text>
                <View style={styles.radioGroupRow}>
                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setEditReceiveVisit(true)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editReceiveVisit === true && styles.radioCircleSelected,
                      ]}
                    >
                      {editReceiveVisit === true && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Sim</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setEditReceiveVisit(false)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editReceiveVisit === false &&
                          styles.radioCircleSelected,
                      ]}
                    >
                      {editReceiveVisit === false && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Não</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionTitle}>
                  Gostaria de receber uma ligação de um membro?
                </Text>
                <View style={styles.radioGroupRow}>
                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setEditReceiveCall(true)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editReceiveCall === true && styles.radioCircleSelected,
                      ]}
                    >
                      {editReceiveCall === true && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Sim</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setEditReceiveCall(false)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editReceiveCall === false && styles.radioCircleSelected,
                      ]}
                    >
                      {editReceiveCall === false && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Não</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionTitle}>
                  Este pedido será Público ou Privado?
                </Text>
                <Text style={styles.questionSubtitle}>
                  Caso o pedido seja{" "}
                  <Text style={{ fontWeight: "bold" }}>Público</Text> ele será
                  exibido no mural. Se for{" "}
                  <Text style={{ fontWeight: "bold" }}>Privado</Text> ficará
                  visível apenas para você e a gestão.
                </Text>
                <View style={styles.radioGroupRow}>
                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setEditDisplayInApp(true)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editDisplayInApp === true && styles.radioCircleSelected,
                      ]}
                    >
                      {editDisplayInApp === true && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Público</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOptionItem}
                    activeOpacity={0.7}
                    onPress={() => setEditDisplayInApp(false)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        editDisplayInApp === false &&
                          styles.radioCircleSelected,
                      ]}
                    >
                      {editDisplayInApp === false && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioOptionLabel}>Privado</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmButtonModal}
                onPress={handleUpdatePrayer}
              >
                <Text style={styles.confirmButtonModalText}>
                  Salvar Alterações
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButtonModal}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.backButtonModalText}>Voltar</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isFinishModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFinishModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsFinishModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.createModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Finalizar pedido de oração</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.finishDescriptionText}>
                Se Deus já respondeu ao seu pedido ou a necessidade de orar se
                encerrou, nos informe por gentileza no campo abaixo porque
                deseja finalizar o pedido de oração.
              </Text>

              <TextInput
                style={styles.textAreaInput}
                placeholder="Comentário (Obrigatório)"
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={4}
                value={finishComment}
                onChangeText={setFinishComment}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.confirmButtonModal}
                onPress={handleConfirmFinish}
              >
                <Text style={styles.confirmButtonModalText}>Finalizar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButtonModal}
                onPress={() => setIsFinishModalVisible(false)}
              >
                <Text style={styles.backButtonModalText}>Voltar</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#02493D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 4,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  tabButtonActive: { backgroundColor: "#25A688" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  tabTextActive: { color: "#FFF" },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25A688",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#1E796A",
  },
  filterButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  filterButtonTextActive: {
    color: "#1E796A",
  },
  content: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingBottom: 20, flexGrow: 1 },
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
  cardItemFinished: {
    backgroundColor: "#F0F4F4",
    borderWidth: 1,
    borderColor: "#CBD5E0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  authorContainer: { flexDirection: "row", alignItems: "center" },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F2F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: "#1E796A" },
  authorName: { fontSize: 14, fontWeight: "700", color: "#02493D" },
  dateText: { fontSize: 12, color: "#718096" },
  publicBadge: {
    backgroundColor: "#C6F6D5",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  publicBadgeText: { fontSize: 11, fontWeight: "700", color: "#22543D" },
  privateBadge: { backgroundColor: "#EDF2F7" },
  privateBadgeText: { color: "#4A5568" },
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
  finishedCommentBox: {
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  finishedCommentTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4A5568",
    marginBottom: 2,
  },
  finishedCommentText: { fontSize: 12, color: "#2D3748" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  likeButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeCount: { fontSize: 13, color: "#E53E3E", fontWeight: "600" },
  cardActionsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  actionIconButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F4EA",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionIconButtonDisabled: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    opacity: 0.9,
  },
  actionFinishText: { fontSize: 12, fontWeight: "700", color: "#1E796A" },
  actionFinishTextDisabled: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  actionIconButtonEdit: {
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTrashButton: { padding: 4 },
  finishedBadgeLabel: { flexDirection: "row", alignItems: "center", gap: 4 },
  finishedBadgeText: { fontSize: 12, fontWeight: "700", color: "#25A688" },
  toastContainer: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "rgba(33, 33, 33, 0.9)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  toastText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#02493D",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  primaryButton: {
    backgroundColor: "#25A688",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successCardContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  successCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#25A688",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#02493D",
    marginBottom: 12,
    textAlign: "center",
  },
  alertCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  successCardMessage: {
    fontSize: 14,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  successOkButton: {
    backgroundColor: "#25A688",
    borderRadius: 12,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  successOkButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: "#FF5252",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalDeleteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  filterModalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: "82%",
  },
  filterChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: "#25A688",
    borderColor: "#02493D",
  },
  filterChipText: {
    color: "#4A5568",
    fontSize: 12,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#FFF",
  },
  createModalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: "85%",
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
  },
  catScrollRow: {
    marginBottom: 16,
  },
  catBoxItem: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    backgroundColor: "#F7FAFC",
  },
  catBoxItemActive: {
    backgroundColor: "#25A688",
    borderColor: "#02493D",
  },
  catBoxText: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "600",
  },
  catBoxTextActive: {
    color: "#FFF",
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    padding: 12,
    height: 100,
    fontSize: 14,
    color: "#2D3748",
    backgroundColor: "#F7FAFC",
    marginBottom: 16,
  },
  questionBlock: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  questionSubtitle: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 8,
    lineHeight: 16,
  },
  radioGroupRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 4,
  },
  radioOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
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
  radioOptionLabel: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
  },
  confirmButtonModal: {
    backgroundColor: "#25A688",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  confirmButtonModalText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  backButtonModal: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#F3F4F6",
  },
  backButtonModalText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
  },
  finishDescriptionText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "center",
  },
});
