import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";

export default function ContribuirScreen() {
  const router = useRouter();
  const [isPixModalVisible, setIsPixModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    title: string;
    description: any;
  } | null>(null);

  const handleOpenPixModal = () => {
    setIsPixModalVisible(true);
  };

  const handleClosePixModal = () => {
    setIsPixModalVisible(false);
  };

  const handleOpenProjectModal = (project: {
    title: string;
    description: any;
  }) => {
    setSelectedProject(project);
    setIsProjectModalVisible(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalVisible(false);
    setSelectedProject(null);
  };

  const quiloDoAmorDescription = (
    <View>
      <Text style={styles.projectModalDescription}>
        <Text style={{ fontWeight: "bold" }}>Todo 1º e 2º domingo do mês</Text>
        {
          ", temos um encontro marcado com a solidariedade!\n\nA campanha Quilo do Amor, realizada pelo Ministério de Ação Social em parceria com a Diaconia, tem sido instrumento para ajudar famílias e abençoar pessoas que precisam.\n\nE essa missão precisa de você! 🙌\n\nAo trazer "
        }
        <Text style={{ fontWeight: "bold" }}>
          1 kg de alimento não perecível para nossa igreja
        </Text>
        {
          ", você contribui para que essa corrente de amor continue alcançando quem mais precisa.\n\n📅 Todo 1º e 2º domingo do mês\n🥫 Traga sua doação e participe!\n❤️ Porque doar é acolher.\n\n"
        }
        <Text style={{ fontStyle: "italic" }}>
          “Aquele que se compadece do pobre empresta ao Senhor.” — Provérbios
          19:17
        </Text>
      </Text>

      {/* Bloco de Chave PIX do Quilo do Amor */}
      <View style={styles.pixInfoContainerModal}>
        <Text style={styles.pixLabel}>Chave PIX (CNPJ ou E-mail):</Text>
        <View style={styles.pixKeyBox}>
          <Text style={styles.pixKeyValue}>00.000.000/0001-00</Text>
          <TouchableOpacity style={styles.copyButton} activeOpacity={0.8}>
            <Ionicons name="copy-outline" size={18} color={COLORS.white} />
            <Text style={styles.copyButtonText}>Copiar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const larSamaritanoDescription = (
    <View>
      <Text style={styles.projectModalDescription}>
        <Text style={{ fontWeight: "bold" }}>O Lar Samaritano</Text>
        {
          " é um espaço de acolhimento e cuidado para pessoas em situação de vulnerabilidade social. Com o apoio da comunidade, oferecemos um ambiente seguro e acolhedor para quem precisa de assistência e solidariedade.\n\nSua contribuição faz a diferença na vida dessas pessoas! 🙌\n\n"
        }
        <Text style={{ fontStyle: "italic" }}>
          “Quem tem piedade do pobre empresta ao Senhor.” — Provérbios 19:17
        </Text>
      </Text>

      {/* Bloco de Chave PIX do Lar Samaritano */}
      <View style={styles.pixInfoContainerModal}>
        <Text style={styles.pixLabel}>Pix Lar Samaritano:</Text>
        <View style={styles.pixKeyBox}>
          <Text style={styles.pixKeyValue}>11.111.111/0001-11</Text>
          <TouchableOpacity style={styles.copyButton} activeOpacity={0.8}>
            <Ionicons name="copy-outline" size={18} color={COLORS.white} />
            <Text style={styles.copyButtonText}>Copiar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CONTRIBUIR</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção Highlights */}
        <Text style={styles.sectionTitle}>Destaques</Text>

        <View style={styles.highlightsRow}>
          {/* Card Dízimos */}
          <TouchableOpacity
            style={styles.highlightCard}
            activeOpacity={0.8}
            onPress={handleOpenPixModal}
          >
            <View style={styles.highlightOverlay}>
              <Text style={styles.highlightCardTitle}>Dízimos</Text>
              <Text style={styles.highlightVerse}>
                "Cada um contribui segundo propôs no seu coração; não com
                tristeza ou por necessidade; porque Deus ama a quem dá com
                alegria."
              </Text>
              <Text style={styles.highlightVerseRef}>(2 Coríntios 9:7)</Text>
            </View>
          </TouchableOpacity>

          {/* Card Ofertas */}
          <TouchableOpacity
            style={styles.highlightCard}
            activeOpacity={0.8}
            onPress={handleOpenPixModal}
          >
            <View style={styles.highlightOverlay}>
              <Text style={styles.highlightCardTitle}>Ofertas</Text>
              <Text style={styles.highlightVerse}>
                "Cada um contribui segundo propôs no seu coração; não com
                tristeza ou por necessidade; porque Deus ama a quem dá com
                alegria."
              </Text>
              <Text style={styles.highlightVerseRef}>(2 Coríntios 9:7)</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Seção Projects and actions */}
        <Text style={styles.sectionTitle}>Projetos e Ações</Text>

        {/* Grid com dois carnês lado a lado */}
        <View style={styles.projectsRow}>
          {/* Primeiro Carnê */}
          <View style={styles.projectCard}>
            <View style={styles.projectImageContainer}>
              <Image
                source={require("../../assets/images/kilodoamor.png")}
                style={styles.projectImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle} numberOfLines={2}>
                Quilo do Amor
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() =>
                  handleOpenProjectModal({
                    title: "Quilo do Amor",
                    description: quiloDoAmorDescription,
                  })
                }
              >
                <Text style={styles.actionButtonText}>SAIBA MAIS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Segundo Carnê (ao lado) */}
          <View style={styles.projectCard}>
            <View style={styles.projectImageContainer}>
              <Image
                source={require("../../assets/images/larsamaritano.png")}
                style={styles.projectImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle} numberOfLines={2}>
                Lar Samaritano
              </Text>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() =>
                  handleOpenProjectModal({
                    title: "Lar Samaritano",
                    description: larSamaritanoDescription,
                  })
                }
              >
                <Text style={styles.actionButtonText}>SAIBA MAIS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal / Bottom Sheet de Contribuição via PIX (Dízimos e Ofertas) */}
      <Modal
        visible={isPixModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClosePixModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClosePixModal}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>Contribuição via PIX</Text>

            <View style={styles.pixInfoContainer}>
              <Text style={styles.pixLabel}>Chave PIX (CNPJ ou E-mail):</Text>
              <View style={styles.pixKeyBox}>
                <Text style={styles.pixKeyValue}>00.000.000/0001-00</Text>
                <TouchableOpacity style={styles.copyButton} activeOpacity={0.8}>
                  <Ionicons
                    name="copy-outline"
                    size={18}
                    color={COLORS.white}
                  />
                  <Text style={styles.copyButtonText}>Copiar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.pixInstructions}>
                Utilize a chave acima no aplicativo do seu banco para realizar o
                seu dízimo ou oferta. Deus abençoe a sua vida!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleClosePixModal}
            >
              <Text style={styles.applyButtonText}>Fechar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Modal / Bottom Sheet de Detalhes dos Projetos (Saiba Mais) */}
      <Modal
        visible={isProjectModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseProjectModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseProjectModal}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />
            <Text style={styles.modalTitle}>{selectedProject?.title}</Text>

            <ScrollView
              style={styles.projectModalScroll}
              showsVerticalScrollIndicator={false}
            >
              {selectedProject?.description}
            </ScrollView>

            <TouchableOpacity
              style={[styles.applyButton, { marginTop: 16 }]}
              onPress={handleCloseProjectModal}
            >
              <Text style={styles.applyButtonText}>Fechar</Text>
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 14,
    marginTop: 10,
  },
  highlightsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    height: 220,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.primaryVibrant,
  },
  highlightOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 73, 61, 0.85)",
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  highlightCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 1,
  },
  highlightVerse: {
    fontSize: 10,
    color: COLORS.primaryLight,
    textAlign: "center",
    lineHeight: 14,
    marginBottom: 8,
  },
  highlightVerseRef: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  projectsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  projectCard: {
    flex: 1,
    backgroundColor: COLORS.primaryMedium,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.primaryVibrant,
  },
  projectImageContainer: {
    height: 150,
    backgroundColor: "#012E27",
    overflow: "hidden",
  },
  projectImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  projectImage: {
    width: "100%",
    height: "100%",
  },
  projectInfo: {
    padding: 12,
    alignItems: "center",
  },
  projectTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 12,
    textAlign: "center",
    height: 34,
  },
  actionButton: {
    backgroundColor: COLORS.primaryVibrant,
    borderRadius: 10,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  /* Estilos do Modal / Bottom Sheet Pix */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    paddingTop: 10,
    maxHeight: "80%",
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
    marginBottom: 20,
  },
  pixInfoContainer: {
    marginBottom: 24,
  },
  pixInfoContainerModal: {
    marginTop: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  pixLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
  },
  pixKeyBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  pixKeyValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2D3748",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25A688",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  pixInstructions: {
    fontSize: 13,
    color: "#718096",
    lineHeight: 18,
    textAlign: "center",
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
  projectModalScroll: {
    maxHeight: 300,
    marginBottom: 10,
  },
  projectModalDescription: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 22,
    textAlign: "left",
  },
});
