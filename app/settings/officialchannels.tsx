import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "@/src/constants/theme";

export default function OfficialChannelsScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header (Top Bar) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleGoBack}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CANAIS OFICIAIS</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Conteúdo com os Cards das Redes Sociais */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Card: Instagram */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() =>
              handleOpenLink(
                "https://www.instagram.com/primeiracabofrio?stkn=ZDNlZDc0MzIxNw%3D%3D",
              )
            }
          >
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: "rgba(225, 48, 108, 0.1)" },
                ]}
              >
                <FontAwesome5 name="instagram" size={20} color="#E1306C" />
              </View>
              <Text style={styles.cardTitle}>Instagram</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.primaryMedium}
            />
          </TouchableOpacity>

          {/* Card: Facebook */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() =>
              handleOpenLink(
                "https://www.facebook.com/profile.php?id=61579347322572",
              )
            }
          >
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: "rgba(24, 119, 242, 0.1)" },
                ]}
              >
                <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
              </View>
              <Text style={styles.cardTitle}>Facebook</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.primaryMedium}
            />
          </TouchableOpacity>

          {/* Card: YouTube */}
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.8}
            onPress={() =>
              handleOpenLink("https://www.youtube.com/@primeiracabofrio")
            }
          >
            <View style={styles.cardLeft}>
              <View
                style={[
                  styles.iconWrapper,
                  { backgroundColor: "rgba(255, 0, 0, 0.1)" },
                ]}
              >
                <FontAwesome5 name="youtube" size={20} color="#FF0000" />
              </View>
              <Text style={styles.cardTitle}>YouTube</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.primaryMedium}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: "#02493D",
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
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primaryMedium,
  },
});
