import React, { useState, useCallback, useRef } from "react";
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
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import Cropper from "react-easy-crop";
import { auth, db } from "../../src/config/firebase";
import { COLORS } from "../../src/constants/theme";

// Função auxiliar Web para gerar o Crop da Imagem
const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject("Erro no contexto canvas");
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
      );

      resolve(canvas.toDataURL("image/jpeg"));
    };
    image.onerror = (error) => reject(error);
  });
};

export default function PersonalDataScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados dos dados do formulário
  const [gender, setGender] = useState<"M" | "F" | null>(null);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para Modais
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showViewPhotoModal, setShowViewPhotoModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Estados do Cortador WEB
  const [tempWebImage, setTempWebImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showWebCropper, setShowWebCropper] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          await user.reload();
          if (user.displayName) setName(user.displayName);
          if (user.photoURL) setPhotoUrl(user.photoURL);

          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.gender) setGender(data.gender);
            if (data.cpf) setCpf(data.cpf);
            if (data.birthDate) setBirthDate(data.birthDate);
            if (data.phone) setPhone(data.phone);
            if (data.photoUrl) setPhotoUrl(data.photoUrl);
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      };

      loadUserData();
    }, []),
  );

  // Formatações dos campos
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

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  };

  // Visualizar foto de perfil
  const handleViewPhoto = () => {
    if (!photoUrl) {
      setShowImagePickerModal(false);
      Alert.alert("Aviso", "O seu perfil não possui foto para visualizar.");
      return;
    }
    setShowImagePickerModal(false);
    setShowViewPhotoModal(true);
  };

  // Handlers da Câmera e Galeria
  const handleTakePhoto = async () => {
    setShowImagePickerModal(false);

    if (Platform.OS === "web") {
      alert("Para testar no navegador, utilize a opção 'Escolher da galeria'.");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Acesso à câmera negado.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    setShowImagePickerModal(false);

    if (Platform.OS === "web") {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Acesso à galeria negado.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  // Callback ao selecionar imagem no Computador (WEB)
  const handleWebFileChange = (event: any) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempWebImage(imageUrl);
      setShowWebCropper(true);
    }
    event.target.value = "";
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmWebCrop = async () => {
    try {
      if (tempWebImage && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(
          tempWebImage,
          croppedAreaPixels,
        );
        setPhotoUrl(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setShowWebCropper(false);
      setTempWebImage(null);
    }
  };

  const handleRemovePhoto = () => {
    if (!photoUrl) {
      setShowImagePickerModal(false);
      Alert.alert("Aviso", "O seu perfil não possui foto para remover.");
      return;
    }

    setShowImagePickerModal(false);
    setPhotoUrl(null);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: name.trim(),
        photoURL: photoUrl || "",
      });

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
          photoUrl,
          updatedAt: new Date(),
        },
        { merge: true },
      );

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
        <>
          <style type="text/css">{`
            input:focus {
              outline: none !important;
              box-shadow: none !important;
            }
          `}</style>
          <input
            type="file"
            ref={fileInputRef as any}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleWebFileChange}
          />
        </>
      )}

      {/* Header */}
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
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={54} color="#B0B0B0" />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.cameraBadge}
                  activeOpacity={0.8}
                  onPress={() => setShowImagePickerModal(true)}
                >
                  <Ionicons name="camera" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sexo */}
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

            {/* Inputs */}
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

      {/* Modal Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImagePickerModal}
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => setShowImagePickerModal(false)}
        >
          <View style={styles.bottomSheetOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetContainer}>
                <View style={styles.bottomSheetHandle} />

                {/* Opção 1: Ver foto de perfil */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  activeOpacity={photoUrl ? 0.7 : 0.4}
                  onPress={handleViewPhoto}
                >
                  <Ionicons
                    name="eye-outline"
                    size={26}
                    color={photoUrl ? "#000" : "#AAA"}
                  />
                  <Text
                    style={[
                      styles.sheetOptionText,
                      !photoUrl && styles.disabledText,
                    ]}
                  >
                    Ver foto de perfil
                  </Text>
                </TouchableOpacity>

                <View style={styles.sheetDivider} />

                {/* Opção 2: Tirar foto */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  activeOpacity={0.7}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera-outline" size={26} color="#000" />
                  <Text style={styles.sheetOptionText}>Tirar foto</Text>
                </TouchableOpacity>

                <View style={styles.sheetDivider} />

                {/* Opção 3: Escolher da galeria */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  activeOpacity={0.7}
                  onPress={handleChooseFromGallery}
                >
                  <Ionicons name="image-outline" size={26} color="#000" />
                  <Text style={styles.sheetOptionText}>
                    Escolher da galeria
                  </Text>
                </TouchableOpacity>

                <View style={styles.sheetDivider} />

                {/* Opção 4: Remover foto */}
                <TouchableOpacity
                  style={styles.sheetOption}
                  activeOpacity={photoUrl ? 0.7 : 0.4}
                  onPress={handleRemovePhoto}
                >
                  <Ionicons
                    name="trash-outline"
                    size={26}
                    color={photoUrl ? "#D9383A" : "#AAA"}
                  />
                  <Text
                    style={[
                      styles.sheetOptionText,
                      photoUrl ? styles.destructiveText : styles.disabledText,
                    ]}
                  >
                    Remover foto
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal para Visualizar a Foto em Tela Cheia */}
      <Modal
        visible={showViewPhotoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowViewPhotoModal(false)}
      >
        <View style={styles.fullScreenOverlay}>
          <TouchableOpacity
            style={styles.closeViewPhotoButton}
            onPress={() => setShowViewPhotoModal(false)}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          {photoUrl && (
            <Image
              source={{ uri: photoUrl }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Modal de Corte na WEB */}
      {Platform.OS === "web" && (
        <Modal
          visible={showWebCropper}
          animationType="fade"
          transparent={false}
        >
          <View style={styles.cropperHeader}>
            <TouchableOpacity onPress={() => setShowWebCropper(false)}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.cropperTitle}>Ajustar Foto</Text>
            <TouchableOpacity onPress={handleConfirmWebCrop}>
              <Text style={styles.cropperConfirmText}>CORTAR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cropperContainer}>
            {tempWebImage && (
              <Cropper
                image={tempWebImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                showGrid={true}
              />
            )}
          </View>
        </Modal>
      )}

      {/* Pop-up Sucesso */}
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
  avatarWrapper: {
    position: "relative",
    width: 90,
    height: 90,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primaryVibrant,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
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
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 16,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
  destructiveText: {
    color: "#D9383A",
    fontWeight: "600",
  },
  disabledText: {
    color: "#AAA",
  },
  sheetDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeViewPhotoButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImage: {
    width: "90%",
    height: "70%",
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
  cropperHeader: {
    height: 60,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  cropperTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cropperConfirmText: {
    color: COLORS.primaryVibrant,
    fontSize: 16,
    fontWeight: "bold",
  },
  cropperContainer: {
    flex: 1,
    backgroundColor: "#111",
    position: "relative",
  },
});
