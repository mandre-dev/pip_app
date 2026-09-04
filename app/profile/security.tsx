import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../src/config/firebase";
import { COLORS } from "../../src/constants/theme";

export default function SecurityScreen() {
  const router = useRouter();

  // Estados dos campos de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados para alternar visibilidade da senha (ocultar/mostrar)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de controle de carregamento, erros e modal
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Trata a navegação de volta
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  // Processo de reautenticação e atualização da senha no Firebase
  const handleUpdatePassword = async () => {
    setErrorMessage(null);

    // 1. Validação de preenchimento dos campos
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    // 2. Validação se a nova senha e a confirmação coincidem
    if (newPassword !== confirmPassword) {
      setErrorMessage("A nova senha e a confirmação não coincidem.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setErrorMessage("Usuário não autenticado.");
      return;
    }

    setLoading(true);

    try {
      // 3. PRIMEIRO: Reautentica no Firebase para validar se a senha atual está correta
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // 4. DEPOIS: Se a senha atual estiver correta, valida as regras da nova senha
      if (newPassword.length < 6) {
        setErrorMessage("A nova senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      if (currentPassword === newPassword) {
        setErrorMessage("A nova senha deve ser diferente da senha atual.");
        setLoading(false);
        return;
      }

      // 5. Atualiza a senha no Firebase Auth
      await updatePassword(user, newPassword);

      // Limpa os campos e exibe o modal de sucesso
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setErrorMessage("A senha atual digitada está incorreta.");
      } else if (error.code === "auth/requires-recent-login") {
        setErrorMessage(
          "Por segurança, faça login novamente antes de alterar sua senha.",
        );
      } else {
        setErrorMessage("Não foi possível alterar a senha. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    handleGoBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "web" && (
        <style type="text/css">{`
          input:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
      )}

      {/* Header Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleGoBack}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SEGURANÇA</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainContent}>
            {/* Título e Descrição */}
            <Text style={styles.title}>Altere a sua senha</Text>
            <Text style={styles.description}>
              Digite a sua senha atual para criar uma nova senha segura, de
              preferência, que você não esteja usando em outras plataformas.
            </Text>

            {/* Campo: Senha Atual */}
            <View
              style={[
                styles.inputContainer,
                focusedInput === "current" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color="#888"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                onFocus={() => setFocusedInput("current")}
                onBlur={() => setFocusedInput(null)}
                placeholder="Digite a sua senha atual"
                placeholderTextColor="#888"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Campo: Nova Senha */}
            <View
              style={[
                styles.inputContainer,
                focusedInput === "new" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color="#888"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                onFocus={() => setFocusedInput("new")}
                onBlur={() => setFocusedInput(null)}
                placeholder="Crie a sua nova senha"
                placeholderTextColor="#888"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Campo: Confirmar Nova Senha */}
            <View
              style={[
                styles.inputContainer,
                focusedInput === "confirm" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color="#888"
                style={styles.leftIcon}
              />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                onFocus={() => setFocusedInput("confirm")}
                onBlur={() => setFocusedInput(null)}
                placeholder="Confirme a sua nova senha"
                placeholderTextColor="#888"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Mensagem de Erro Visual */}
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </View>

          {/* Botão Continuar */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.actionButtonText}>Continuar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Customizado de Sucesso */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons
              name="checkmark-circle"
              size={54}
              color={COLORS.primaryVibrant}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.modalTitle}>Senha Alterada!</Text>
            <Text style={styles.modalMessage}>
              Sua senha foi atualizada com sucesso. Utilize a nova senha no seu
              próximo acesso.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              activeOpacity={0.8}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
  },
  mainContent: {
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: COLORS.primaryVibrant,
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: COLORS.primaryDark,
    fontSize: 14,
  },
  errorText: {
    color: "#FF5252",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 10,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: COLORS.primaryVibrant,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  // Modal Customizado
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
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primaryVibrant,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
