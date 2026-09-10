import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Importações do Firebase Auth
import { getAuth, onAuthStateChanged } from "firebase/auth";

const { width } = Dimensions.get("window");

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=800&q=80",
];

export default function AboutUsScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [userName, setUserName] = useState<string>("");

  // Escuta as alterações no estado e nos dados do usuário logado no Firebase
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Pega o displayName cadastrado no Firebase Auth
        setUserName(user.displayName || "Visitante");
      } else {
        setUserName("Visitante");
      }
    });

    return () => unsubscribe();
  }, []);

  const addressText =
    "R. Vinte e Cinco, 190 - Parque Burle, Cabo Frio - RJ, 28913-330, Brasil";
  const phoneNumber = "+55 22 99256-4274";

  const handleScroll = (event: any) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width,
    );
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

  const openMap = () => {
    const query = encodeURIComponent(addressText);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url);
  };

  const openWhatsApp = () => {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
    Linking.openURL(`https://wa.me/${cleanNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Transparente */}
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
        <Text style={styles.headerTitle}>SOBRE NÓS</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Carrossel de Imagens */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {CAROUSEL_IMAGES.map((img, index) => (
              <View key={index} style={styles.slide}>
                <Image source={{ uri: img }} style={styles.carouselImage} />
                <View style={styles.imageOverlay} />
              </View>
            ))}
          </ScrollView>

          <View style={styles.pagination}>
            {CAROUSEL_IMAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeSlide === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Card de Conteúdo Principal */}
        <View style={styles.contentCard}>
          {/* Nome carregado em tempo real do Firebase */}
          <Text style={styles.sectionTitle}>
            {userName ? `Olá, ${userName}!` : "Olá!"}
          </Text>

          <Text style={styles.paragraph}>
            Seja muito bem-vindo à Primeira Igreja Presbiteriana de Cabo Frio!
          </Text>

          <Text style={styles.paragraph}>
            Somos uma igreja que ama a Deus e expressa esse amor servindo
            pessoas. Somos simples, Cristocêntricos. Somos Igreja. Não somos um
            prédio, mas nos reunimos em um.
          </Text>

          {expanded && (
            <Text style={styles.paragraph}>
              Nossa missão é proclamar o Evangelho de Jesus Cristo, promover o
              crescimento espiritual através do ensino bíblico e edificar uma
              comunidade acolhedora fundamentada no amor, na fé e na comunhão.
            </Text>
          )}

          <TouchableOpacity
            style={styles.seeMoreButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.seeMoreText}>
              {expanded ? "Ver menos" : "Ver mais"}
            </Text>
          </TouchableOpacity>

          {/* Seção de Informações de Contato */}
          <Text style={styles.infoSectionTitle}>Informações</Text>

          <View style={styles.infoBox}>
            <TouchableOpacity
              style={styles.infoRow}
              onPress={openWhatsApp}
              activeOpacity={0.7}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="call-outline" size={22} color="#1E796A" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{phoneNumber}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="location-outline" size={22} color="#1E796A" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>{addressText}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.mapButton} onPress={openMap}>
              <Text style={styles.mapButtonText}>Abrir no mapa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02493D",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "transparent",
    zIndex: 10,
    elevation: 10,
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
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#02493D",
  },
  carouselContainer: {
    height: 280,
    width: "100%",
    position: "relative",
  },
  slide: {
    width: width,
    height: 280,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  pagination: {
    position: "absolute",
    bottom: 35,
    flexDirection: "row",
    alignSelf: "center",
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#FFF",
    width: 20,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E796A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 1,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 15,
    color: "#4A4A4A",
    lineHeight: 22,
    marginBottom: 14,
  },
  seeMoreButton: {
    alignSelf: "flex-start",
    marginBottom: 28,
  },
  seeMoreText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E796A",
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E796A",
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E8F2F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  mapButton: {
    borderWidth: 1.5,
    borderColor: "#1E796A",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginTop: 4,
    marginLeft: 56,
  },
  mapButtonText: {
    color: "#1E796A",
    fontSize: 14,
    fontWeight: "700",
  },
});
