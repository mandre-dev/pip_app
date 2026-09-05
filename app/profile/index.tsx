import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../src/config/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Escuta alterações na autenticação em tempo real
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace("/login" as any);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const performLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await signOut(auth);
      router.replace("/login" as any);
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar sair da conta.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#02493D" />
      </SafeAreaView>
    );
  }

  // Pega dinamicamente os dados do usuário autenticado
  const userName = user?.displayName || "Membro PIPCF";
  const userEmail = user?.email || "email@exemplo.com";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/")}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONTAS</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContent}>
          {/* Avatar e Informações do Usuário Atual */}
          <View style={styles.userInfoContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
          </View>

          {/* Lista de Opções */}
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.cardOption}
              activeOpacity={0.7}
              onPress={() => router.push("profile/personal-data" as any)}
            >
              <View style={styles.cardLeft}>
                <Ionicons name="person-outline" size={24} color="#1E796A" />
                <Text style={styles.cardText}>Dados cadastrais</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1E796A" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardOption} activeOpacity={0.7} onPress={() => router.push("profile/security" as any)}>
              <View style={styles.cardLeft}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color="#1E796A"
                />
                <Text style={styles.cardText}>Segurança</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1E796A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão de Sair fixado no final */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Customizado do App para Sair da Conta */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="log-out-outline"
              size={40}
              color="#1E796A"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Sair da conta</Text>
            <Text style={styles.modalMessage}>
              tem certeza que deseja sair da conta
            </Text>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Não</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={performLogout}
              >
                <Text style={styles.confirmButtonText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02493D",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#1E796A",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  mainContent: {
    width: "100%",
  },
  userInfoContainer: {
    alignItems: "center",
    marginVertical: 25,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    color: "#666",
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  userEmail: {
    fontSize: 14,
    color: "#fff",
    marginTop: 4,
  },
  optionsList: {
    gap: 12,
    marginBottom: 20,
  },
  cardOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E796A",
  },
  logoutButton: {
    backgroundColor: "#D9383A",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: "auto",
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Estilos do Modal Customizado
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E796A",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  confirmButton: {
    backgroundColor: "#1E796A",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
