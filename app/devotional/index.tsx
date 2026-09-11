import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";

export default function DevotionalScreen() {
  const router = useRouter();

  // Substitua pelo link real do grupo de WhatsApp da igreja
  const whatsappGroupUrl = "https://chat.whatsapp.com/SEU_LINK_DO_GRUPO_AQUI";

  const handleJoinWhatsApp = () => {
    Linking.openURL(whatsappGroupUrl);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão de voltar */}
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
        <Text style={styles.headerTitle}>DEVOCIONAL</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Conteúdo Centralizado */}
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="book-outline"
              size={48}
              color={COLORS.primaryMedium}
            />
          </View>

          <Text style={styles.messageText}>
            Se você deseja receber devocionais para edificar sua vida, participe
            do nosso grupo de WhatsApp exclusivo.
          </Text>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleJoinWhatsApp}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
            <Text style={styles.whatsappButtonText}>Quero participar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark, // #02493D
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.primaryDark,
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(30, 121, 106, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    color: "#4A4A4A",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  whatsappButton: {
    flexDirection: "row",
    backgroundColor: "#25D366", // Cor oficial do WhatsApp para destacar o botão de ação
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsappButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
