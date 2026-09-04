import React, { useState, useCallback } from "react";
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
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/config/firebase";
import { COLORS } from "../../src/constants/theme";

export default function PersonalDataScreen() {
  const router = useRouter();

  // Estados dos campos
  const [gender, setGender] = useState<"M" | "F" | null>(null);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para controlar o Pop-up Customizado
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Estado de Foco para efeito visual
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Carrega os dados do Firebase Auth e do Firestore
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          await user.reload();
          if (user.displayName) {
            setName(user.displayName);
          }

          // Busca dados complementares (CPF, Sexo, Nascimento, Celular) no Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.gender) setGender(data.gender);
            if (data.cpf) setCpf(data.cpf);
            if (data.birthDate) setBirthDate(data.birthDate);
            if (data.phone) setPhone(data.phone);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      };

      loadUserData();
    }, []),
  );

  // Inicial do avatar baseada no nome
  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : "?";

  // Máscara para Data de Nascimento
  const handleBirthDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 8);
    let formatted = cleaned;

    if (cleaned.length > 2 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length > 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    }

    setBirthDate(formatted);
  };

  // Máscara para CPF
  const handleCpfChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 11);
    let formatted = cleaned;

    if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    } else if (cleaned.length > 6 && cleaned.length <= 9) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    } else if (cleaned.length > 9) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }

    setCpf(formatted);
  };

  // Máscara para Celular
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 11);
    let formatted = cleaned;

    if (cleaned.length > 2 && cleaned.length <= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length > 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    setPhone(formatted);
  };

  // Trata a navegação de volta com segurança
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // Salva no Firebase Auth e no Firestore
  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    setLoading(true);
    try {
      // 1. Atualiza o nome no Auth do Firebase
      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() });
      }

      // 2. Salva todos os dados adicionais + E-mail no Firestore Database
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          name: name.trim(),
          email: user.email,
          gender,
          cpf,
          birthDate,
          phone,
          updatedAt: new Date(),
        },
        { merge: true },
      );

      // Exibe o Pop-up customizado de sucesso
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
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
        <Text style={styles.headerTitle}>DADOS CADASTRAIS</Text>
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
            {/* Avatar Central */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            </View>

            {/* Seleção de Sexo */}
            <Text style={styles.label}>Sexo</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={styles.genderOption}
                activeOpacity={0.7}
                onPress={() => setGender("M")}
              >
                <Ionicons
                  name={gender === "M" ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={gender === "M" ? COLORS.primaryVibrant : "#888888"}
                />
                <Text style={styles.genderText}>Masculino</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                activeOpacity={0.7}
                onPress={() => setGender("F")}
              >
                <Ionicons
                  name={gender === "F" ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={gender === "F" ? COLORS.primaryVibrant : "#888888"}
                />
                <Text style={styles.genderText}>Feminino</Text>
              </TouchableOpacity>
            </View>

            {/* Campo Nome */}
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "name" && styles.inputFocused,
              ]}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Digite seu nome"
              placeholderTextColor="#888"
            />

            {/* Campo CPF */}
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "cpf" && styles.inputFocused,
              ]}
              value={cpf}
              onChangeText={handleCpfChange}
              onFocus={() => setFocusedInput("cpf")}
              onBlur={() => setFocusedInput(null)}
              placeholder="000.000.000-00"
              placeholderTextColor="#888"
              keyboardType="numeric"
              maxLength={14}
            />

            {/* Campo Nascimento */}
            <Text style={styles.label}>Nascimento</Text>
            <View
              style={[
                styles.inputIconContainer,
                focusedInput === "birth" && styles.inputFocused,
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={
                  focusedInput === "birth" ? COLORS.primaryVibrant : "#666666"
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputWithIcon}
                value={birthDate}
                onChangeText={handleBirthDateChange}
                onFocus={() => setFocusedInput("birth")}
                onBlur={() => setFocusedInput(null)}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#888"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            {/* Campo Celular */}
            <Text style={styles.label}>Celular</Text>
            <View
              style={[
                styles.inputIconContainer,
                focusedInput === "phone" && styles.inputFocused,
              ]}
            >
              <Text style={styles.flagIcon}>🇧🇷</Text>
              <TextInput
                style={styles.inputWithIcon}
                value={phone}
                onChangeText={handlePhoneChange}
                onFocus={() => setFocusedInput("phone")}
                onBlur={() => setFocusedInput(null)}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.7}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pop-up Customizado de Confirmação */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={54}
                color={COLORS.primaryVibrant}
              />
            </View>
            <Text style={styles.modalTitle}>Cadastro Atualizado!</Text>
            <Text style={styles.modalMessage}>
              Suas informações cadastrais foram salvas com sucesso.
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  mainContent: {
    width: "100%",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    color: "#666",
    fontWeight: "500",
  },
  label: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 14,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 4,
    marginTop: 4,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  genderText: {
    color: COLORS.white,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#FFF",
    color: COLORS.primaryDark,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputIcon: {
    marginRight: 10,
  },
  flagIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    height: "100%",
    backgroundColor: "transparent",
    color: COLORS.primaryDark,
    fontSize: 14,
    borderWidth: 0,
  },
  inputFocused: {
    borderColor: COLORS.primaryVibrant,
  },
  saveButton: {
    backgroundColor: COLORS.primaryVibrant,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  // Estilização do Pop-up (Modal) Customizado
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalIconContainer: {
    marginBottom: 12,
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
