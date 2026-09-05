import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Linking,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/src/config/firebase";
import { COLORS } from "@/src/constants/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleOpenPrivacyPolicy = () => {
    Linking.openURL("https://sua-politica-de-privacidade-url.com");
  };

  const handleOpenTermsOfUse = () => {
    Linking.openURL("https://seus-termos-de-uso-url.com");
  };

  const handleOpenDevLink = (url: string) => {
    Linking.openURL(url);
  };

  // Exclusão de Conta com Reautenticação e Redirecionamento Direto
  const handleDeleteAccount = async () => {
    setErrorMessage("");

    try {
      const user = auth.currentUser;

      // Obtém o e-mail do usuário ativo
      const userEmail = user?.email || user?.providerData?.[0]?.email;

      if (!user || !userEmail) {
        setErrorMessage("Sessão inválida. Faça login novamente.");
        return;
      }

      if (!password.trim()) {
        setErrorMessage("Informe a sua senha atual para continuar.");
        return;
      }

      setLoading(true);

      // 1. Tenta reautenticar com as credenciais digitadas
      const credential = EmailAuthProvider.credential(userEmail, password);
      await reauthenticateWithCredential(user, credential);

      // 2. Remove o documento do usuário no Firestore (se existir)
      try {
        await deleteDoc(doc(db, "users", user.uid));
      } catch (fsError) {
        console.warn("Aviso ao deletar dados do Firestore:", fsError);
      }

      // 3. Exclui a conta no Firebase Auth
      await deleteUser(user);

      // 4. Encerra a sessão local
      await signOut(auth);

      // 5. Redireciona imediatamente e limpa a pilha de telas
      if (router.canDismiss()) {
        router.dismissAll();
      }

      // Fecha o modal e redireciona para a tela de login inicial
      setShowDeleteModal(false);
      setPassword("");
      setShowPassword(false);

      // Redireciona para a rota do login (ajuste a rota caso sua tela inicial seja "/")
      router.replace("/login");
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error.code, error.message);

      // O erro do modal é mantido visível sem fechar a janela pop-up
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setErrorMessage("A senha digitada está incorreta. Tente novamente.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessage("Muitas tentativas incorretas. Tente mais tarde.");
      } else if (error.code === "auth/requires-recent-login") {
        setErrorMessage("Sessão expirada. Faça login novamente.");
      } else {
        setErrorMessage(
          `Erro ao excluir: ${error.message || "Tente novamente."}`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setPassword("");
    setShowPassword(false);
    setIsFocused(false);
    setErrorMessage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleGoBack}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONFIGURAÇÕES</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Card: Política de Privacidade */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={handleOpenPrivacyPolicy}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#1E796A"
                />
              </View>
              <Text style={styles.cardTitle}>Política de Privacidade</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.primaryMedium}
            />
          </TouchableOpacity>

          {/* Card: Termos de Uso */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={handleOpenTermsOfUse}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#1E796A"
                />
              </View>
              <Text style={styles.cardTitle}>Termos de Uso</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.primaryMedium}
            />
          </TouchableOpacity>

          {/* Card: Sobre o Desenvolvedor */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() => setShowDevModal(true)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="code-slash-outline" size={22} color="#1E796A" />
              </View>
              <Text style={styles.cardTitle}>Sobre o Desenvolvedor</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.primaryMedium}
            />
          </TouchableOpacity>
        </View>

        {/* Footer: Versão e Botão Excluir */}
        <View style={styles.footerContainer}>
          <Text style={styles.versionText}>Versão: 1.0.0</Text>

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.8}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.deleteButtonText}>Excluir minha conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal: Sobre o Desenvolvedor */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDevModal}
        onRequestClose={() => setShowDevModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.devIconContainer}>
              <Ionicons name="code-working" size={42} color="#1E796A" />
            </View>
            <Text style={styles.modalTitle}>Desenvolvido por</Text>
            <Text style={styles.devName}>Seu Nome / Sua Empresa</Text>
            <Text style={styles.modalMessage}>
              Aplicativo projetado e mantido com foco em performance,
              modernidade e segurança.
            </Text>

            <TouchableOpacity
              style={styles.devLinkButton}
              activeOpacity={0.8}
              onPress={() =>
                handleOpenDevLink("https://github.com/seu-usuario")
              }
            >
              <Ionicons name="logo-github" size={20} color="#FFF" />
              <Text style={styles.devLinkText}>Visitar GitHub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeDevButton}
              activeOpacity={0.8}
              onPress={() => setShowDevModal(false)}
            >
              <Text style={styles.closeDevButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={handleCloseDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="warning-outline" size={50} color="#D9383A" />
            </View>
            <Text style={styles.modalTitle}>Excluir Conta?</Text>
            <Text style={styles.modalMessage}>
              Esta ação é permanente e após isso você perderá seus dados e será
              desconectado. Digite sua senha atual se deseja confirmar a
              exclusão.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  !!errorMessage && styles.inputContainerError,
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    { outlineStyle: "none" } as any,
                  ]}
                  placeholder="Sua senha"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              {/* Mensagem de erro em texto */}
              {!!errorMessage && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color="#D9383A"
                  />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                activeOpacity={0.8}
                onPress={handleCloseDeleteModal}
                disabled={loading}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteButton}
                activeOpacity={0.8}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Excluir</Text>
                )}
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
    backgroundColor: COLORS.primaryDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#1E796A",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  mainContent: {
    gap: 14,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(30, 121, 106, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primaryMedium,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 40,
    gap: 16,
  },
  versionText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "#FF4D4D",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 8,
  },
  modalIconContainer: {
    marginBottom: 10,
  },
  fieldGroup: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#DDD",
    paddingHorizontal: 14,
    height: 48,
  },
  inputContainerFocused: {
    borderColor: "#1E796A",
  },
  inputContainerError: {
    borderColor: "#D9383A",
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    height: "100%",
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    color: "#D9383A",
    fontSize: 12,
    fontWeight: "500",
  },
  devIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(30, 121, 106, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  devName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E796A",
    marginBottom: 6,
  },
  devLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#24292e",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 10,
  },
  devLinkText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  closeDevButton: {
    paddingVertical: 10,
  },
  closeDevButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelModalButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#D9383A",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDeleteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
