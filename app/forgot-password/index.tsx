import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../src/config/firebase";
import { COLORS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado para controlar o foco do campo de e-mail
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  // Estado para controlar o Pop-up Modal Customizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
    onConfirm?: () => void;
  }>({
    title: "",
    message: "",
    type: "success",
  });

  const showPopup = (
    title: string,
    message: string,
    type: "success" | "error",
    onConfirm?: () => void,
  ) => {
    setModalConfig({ title, message, type, onConfirm });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    if (modalConfig.onConfirm) {
      modalConfig.onConfirm();
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Informe seu e-mail");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      showPopup(
        "E-mail Enviado!",
        "Enviamos um link de redefinição de senha para o seu e-mail. Verifique sua caixa de entrada e spam.",
        "success",
        () => router.back(),
      );
    } catch (error: any) {
      let message = "Ocorreu um erro ao tentar enviar o e-mail.";
      if (error.code === "auth/invalid-email") message = "E-mail inválido.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "E-mail não cadastrado.";
      }

      showPopup("Erro", message, "error");
    } finally {
      setLoading(false);
    }
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CONTA</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Sem problemas, podemos te ajudar!</Text>
          <Text style={styles.subtitle}>
            Se você não lembra da sua senha, digite seu e-mail abaixo para
            receber um link de redefinição.
          </Text>

          {/* Campo E-mail com estado de foco */}
          <View
            style={[
              styles.inputContainer,
              isEmailFocused ? styles.inputFocused : null,
              errorMessage ? styles.inputError : null,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color="#666666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu e-mail"
              placeholderTextColor="#888888"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage("");
              }}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Botões */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* POPUP / MODAL CUSTOMIZADO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalIconContainer,
                modalConfig.type === "success"
                  ? styles.iconSuccess
                  : styles.iconError,
              ]}
            >
              <Ionicons
                name={
                  modalConfig.type === "success"
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={48}
                color={modalConfig.type === "success" ? "#1E796A" : "#E53935"}
              />
            </View>

            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                modalConfig.type === "success"
                  ? styles.modalButtonSuccess
                  : styles.modalButtonError,
              ]}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalButtonText}>Entendi</Text>
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    height: 50,
  },
  inputFocused: {
    borderColor: "#000000",
  },
  inputError: {
    borderColor: "#E53935",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#02493D",
    backgroundColor: "transparent",
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    marginTop: "auto",
    paddingTop: 30,
    gap: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primaryVibrant,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: COLORS.primaryVibrant,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.primaryVibrant,
    fontSize: 15,
    fontWeight: "bold",
  },
  /* ESTILOS DO POPUP (MODAL) */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
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
  modalIconContainer: {
    marginBottom: 16,
  },
  iconSuccess: {},
  iconError: {},
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonSuccess: {
    backgroundColor: "#1E796A",
  },
  modalButtonError: {
    backgroundColor: "#E53935",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
