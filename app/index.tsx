import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../src/constants/theme";
import { HubButton } from "../src/components/HubButton";
import { auth } from "../src/config/firebase";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Superior */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={26} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (auth.currentUser) {
                router.push("/profile");
              } else {
                router.push("/login");
              }
            }}
          >
            <Ionicons
              name="person-circle-outline"
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* Marca/Header Central com Logo */}
        <View style={styles.brandContainer}>
          <Image
            source={require("../assets/images/Logo-01-Branco.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Grid de Funcionalidades */}
        <View style={styles.grid}>
          <HubButton
            title="SOBRE NÓS"
            iconName="business-outline"
            onPress={() => router.push("/about")}
          />
          <HubButton
            title="MINISTÉRIOS"
            iconName="flame-outline"
            onPress={() => router.push("/ministries")}
          />
          <HubButton
            title="DEVOCIONAL"
            iconName="newspaper-outline"
            onPress={() => router.push("/devotional")}
          />

          <HubButton
            title="CÉLULAS"
            iconName="play-circle-outline"
            onPress={() => router.push("/cells")}
          />
          <HubButton
            title="CONTRIBUIR"
            iconName="heart-outline"
            onPress={() => router.push("/contribute" as any)}
          />
          <HubButton
            title="AO VIVO"
            iconName="videocam-outline"
            onPress={() => router.push("/live" as any)}
          />

          <HubButton
            title="EBD"
            iconName="journal-outline"
            onPress={() => router.push("/oracao")}
          />
          <HubButton
            title="PEDIDOS DE ORAÇÃO"
            iconName="book-outline"
            onPress={() => console.log("Plano de Oração")}
          />
          <HubButton
            title="EVENTOS"
            iconName="calendar-outline"
            onPress={() => console.log("Eventos")}
          />
        </View>

        {/* Indicador Inferior */}
        <View style={styles.footerIndicator}>
          <Ionicons
            name="chevron-down-outline"
            size={24}
            color={COLORS.primaryLight}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    justifyContent: "space-between",
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  brandContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  logo: {
    width: 320,
    height: 150,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  footerIndicator: {
    alignItems: "center",
    marginTop: 15,
  },
});
