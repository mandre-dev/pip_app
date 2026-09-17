import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HubButton } from "../src/components/HubButton";
import { auth } from "../src/config/firebase";
import { COLORS } from "../src/constants/theme";

const SLIDE_DURATION = 5000;
const SETTLE_FALLBACK = 700;

const slides = [
  {
    key: "1",
    title: "EMOÇÃO",
    subtitle: "A cada passo, uma nova razão para celebrar.",
    backgroundColor: "#d81616",
    image: require("../assets/images/kilodoamor.png"),
  },
  {
    key: "2",
    title: "PAZ",
    subtitle: "Descubra momentos de serenidade e esperança.",
    backgroundColor: "#0f4f49",
    image: require("../assets/images/larsamaritano.png"),
  },
  {
    key: "3",
    title: "COMUNIDADE",
    subtitle: "Junte-se aos encontros, cultos e experiências.",
    backgroundColor: "#1d4a4a",
    image: require("../assets/images/Logo-02-Verde.png"),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const carouselWidth = width - 40;
  const scrollRef = useRef<ScrollView>(null);
  const slideProgressValues = useRef(
    slides.map(() => new Animated.Value(0)),
  ).current;
  const settleFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  // Indica que o slide já parou na tela e pode começar a contagem.
  const [isSettled, setIsSettled] = useState(true);

  // Define o estado real das barras: tudo antes do índice cheio, o resto vazio.
  const resetBars = (index: number) => {
    slideProgressValues.forEach((progressValue, i) => {
      progressValue.stopAnimation();
      progressValue.setValue(i < index ? 1 : 0);
    });
  };

  useEffect(() => {
    if (!isSettled) {
      return;
    }

    resetBars(activeIndex);

    const animation = Animated.timing(slideProgressValues[activeIndex], {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (!finished) {
        return;
      }

      const nextIndex = (activeIndex + 1) % slides.length;

      // Zera as barras ANTES de rolar, para o slide seguinte nunca
      // aparecer preenchido durante a transição do loop.
      resetBars(nextIndex);
      setIsSettled(false);
      setActiveIndex(nextIndex);

      scrollRef.current?.scrollTo({
        x: nextIndex * carouselWidth,
        y: 0,
        animated: true,
      });

      // Fallback caso onMomentumScrollEnd não dispare.
      settleFallbackRef.current = setTimeout(
        () => setIsSettled(true),
        SETTLE_FALLBACK,
      );
    });

    return () => {
      animation.stop();
    };
  }, [activeIndex, isSettled, carouselWidth, slideProgressValues]);

  useEffect(() => {
    return () => {
      if (settleFallbackRef.current) {
        clearTimeout(settleFallbackRef.current);
      }
    };
  }, []);

  const handleScrollBegin = () => {
    setIsSettled(false);
    slideProgressValues.forEach((progressValue) =>
      progressValue.stopAnimation(),
    );
  };

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / carouselWidth);
    const normalizedIndex = currentIndex % slides.length;

    if (settleFallbackRef.current) {
      clearTimeout(settleFallbackRef.current);
      settleFallbackRef.current = null;
    }

    setActiveIndex(normalizedIndex);
    setIsSettled(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Superior */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Image
              source={require("../assets/images/Logo-01-Branco.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headerActions}>
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
        </View>

        <View style={styles.carouselWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={carouselWidth}
            decelerationRate="fast"
            onScrollBeginDrag={handleScrollBegin}
            onMomentumScrollEnd={handleScrollEnd}
            contentContainerStyle={styles.carouselContainer}
          >
            {slides.map((slide) => (
              <View
                key={slide.key}
                style={[
                  styles.slide,
                  {
                    width: carouselWidth,
                    backgroundColor: slide.backgroundColor,
                  },
                ]}
              >
                <View style={styles.slideTextBlock}>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                </View>

                <Image
                  source={slide.image}
                  style={styles.slideImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {slides.map((slide, index) => {
              const fillWidth = slideProgressValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0, 26],
                extrapolate: "clamp",
              });

              return (
                <View key={slide.key} style={styles.dotTrack}>
                  <Animated.View
                    style={[styles.dotFill, { width: fillWidth }]}
                  />
                </View>
              );
            })}
          </View>
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
            onPress={() => router.push("/ebd" as any)}
          />
          <HubButton
            title="PEDIDOS DE ORAÇÃO"
            iconName="book-outline"
            onPress={() => router.push("/prayerrequest")}
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
    alignItems: "flex-start",
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: -4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 18,
  },
  brandContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    marginVertical: 0,
    flex: 1,
    marginLeft: -8,
    marginTop: -10,
  },
  logo: {
    width: 200,
    height: 124,
    marginTop: -8,
  },
  carouselWrapper: {
    marginTop: 8,
    marginBottom: 18,
  },
  carouselContainer: {
    alignItems: "center",
  },
  slide: {
    height: 200,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  slideTextBlock: {
    flex: 1,
    justifyContent: "center",
  },
  slideTitle: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 28,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  slideSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 8,
    maxWidth: 180,
  },
  slideImage: {
    width: 110,
    height: 110,
    opacity: 0.92,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  dotTrack: {
    width: 26,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  dotFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.white,
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
