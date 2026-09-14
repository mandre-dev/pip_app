import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";

interface Leader {
  name: string;
  initials: string;
  phone: string;
  email: string;
}

export default function EbdDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Tratativa para ler os múltiplos líderes passados via parâmetro
  let parsedLeaders: Leader[] = [];
  try {
    if (params.leaders) {
      parsedLeaders = JSON.parse(params.leaders as string);
    }
  } catch (e) {
    parsedLeaders = [];
  }

  // Fallback caso venha vazio ou no formato antigo de parâmetros únicos
  const leaders =
    parsedLeaders.length > 0
      ? parsedLeaders
      : [
          {
            name: (params.leaderName as string) || "Professor Responsável",
            initials: (params.leaderInitials as string) || "P",
            phone: (params.phone as string) || "",
            email: (params.email as string) || "",
          },
        ];

  const ebd = {
    name: (params.name as string) || "Classe EBD",
    category: (params.category as string) || "GERAL",
    description: (params.description as string) || "",
    dayOfWeek: (params.dayOfWeek as string) || "A definir",
    time: (params.time as string) || "Horário a combinar",
    location: (params.location as string) || "Local a definir",
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    if (phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleEmail = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#02493D" />

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
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EBD</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Título e Tag */}
        <Text style={styles.ebdTitle}>{ebd.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {ebd.category.toUpperCase()}
          </Text>
        </View>

        {/* Descrição em Markdown */}
        {ebd.description ? (
          <Markdown style={markdownStyles}>{ebd.description}</Markdown>
        ) : null}

        {/* Seção de Reuniões */}
        <Text style={styles.sectionTitle}>Encontros</Text>
        <View style={styles.card}>
          <Text style={styles.dayText}>{ebd.dayOfWeek}</Text>

          {/* Horário */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={20} color="#02493D" />
            </View>
            <Text style={styles.infoText}>{ebd.time}</Text>
          </View>

          <View style={styles.divider} />

          {/* Localização */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={20} color="#02493D" />
            </View>
            <Text style={styles.infoText}>{ebd.location}</Text>
          </View>
        </View>

        {/* Seção de Liderança */}
        <Text style={styles.sectionTitle}>Liderança</Text>
        <Text style={styles.noticeText}>
          Caso deseje participar entre em contato com a liderança
        </Text>

        {/* Mapeamento dos múltiplos líderes/professores */}
        {leaders.map((leader, index) => (
          <View key={index} style={styles.leaderCardCompact}>
            {/* Avatar / Iniciais */}
            <View style={styles.leaderAvatarSmall}>
              <Text style={styles.leaderAvatarTextSmall}>
                {leader.initials}
              </Text>
            </View>

            {/* Nome e Cargo */}
            <View style={styles.leaderInfoCompact}>
              <Text style={styles.leaderNameCompact} numberOfLines={1}>
                {leader.name}
              </Text>
              <Text style={styles.leaderRoleCompact}>
                Professor Responsável
              </Text>
            </View>

            {/* Ações de Contato em Linha */}
            <View style={styles.contactActionsCompact}>
              <TouchableOpacity
                style={styles.actionButtonSmall}
                onPress={() => handleCall(leader.phone)}
              >
                <Ionicons name="call-outline" size={16} color="#02493D" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButtonSmall}
                onPress={() => handleWhatsApp(leader.phone)}
              >
                <FontAwesome name="whatsapp" size={16} color="#02493D" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButtonSmall}
                onPress={() => handleEmail(leader.email)}
              >
                <Ionicons name="mail-outline" size={16} color="#02493D" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    color: "#E2E8F0",
    lineHeight: 22,
    marginBottom: 20,
  },
  strong: {
    fontWeight: "700",
    color: "#FFF",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#02493D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 48 : 16,
    paddingBottom: 12,
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  ebdTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F2F0",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#02493D",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 13,
    color: "#A7F3D0",
    marginBottom: 12,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 24,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#02493D",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F2F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "500",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#b8afaf",
    marginVertical: 14,
  },
  leaderCardCompact: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  leaderAvatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#02493D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  leaderAvatarTextSmall: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
  leaderInfoCompact: {
    flex: 1,
    marginRight: 8,
  },
  leaderNameCompact: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A202C",
  },
  leaderRoleCompact: {
    fontSize: 12,
    color: "#718096",
  },
  contactActionsCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionButtonSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E8F2F0",
    alignItems: "center",
    justifyContent: "center",
  },
});
