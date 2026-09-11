import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/theme";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

export default function LiveScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [liveVideo, setLiveVideo] = useState<{
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    isLive: boolean;
  } | null>(null);
  const [playing, setPlaying] = useState(false);

  // CONFIGURAÇÕES DO YOUTUBE
  const YOUTUBE_API_KEY = "AIzaSyC0lnB7VpVRun5qtl-GUxvnGrTi8R29Qkk";
  const CHANNEL_ID = "UC7hGjYPsKxe3J_OSdMZHlkw"; // Ex: UCxxxxxx...

  useEffect(() => {
    fetchLatestOrLiveStream();
  }, []);

  const fetchLatestOrLiveStream = async () => {
    try {
      setLoading(true);
      // 1. Tenta buscar se há alguma transmissão AO VIVO agora
      let response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`,
      );
      let data = await response.json();

      let videoItem = data.items?.[0];
      let isLiveNow = true;

      // 2. Se não houver live agora, busca o vídeo mais recente (última transmissão)
      if (!videoItem) {
        response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`,
        );
        data = await response.json();
        videoItem = data.items?.[0];
        isLiveNow = false;
      }

      if (videoItem) {
        setLiveVideo({
          id: videoItem.id.videoId,
          title: videoItem.snippet.title,
          description: videoItem.snippet.description,
          publishedAt: videoItem.snippet.publishedAt,
          isLive: isLiveNow,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do YouTube:", error);
    } finally {
      setLoading(false);
    }
  };

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AO VIVO</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.primaryVibrant || "#25A688"}
            />
            <Text style={styles.loaderText}>Buscando transmissão...</Text>
          </View>
        ) : liveVideo ? (
          <>
            {/* Card do Player do YouTube */}
            <View style={styles.playerCard}>
              <YoutubePlayer
                height={220}
                width={width - 32}
                play={playing}
                videoId={liveVideo.id}
                onChangeState={onStateChange}
              />
              <TouchableOpacity
                style={styles.watchOnYoutubeButton}
                onPress={() =>
                  Linking.openURL(
                    `https://www.youtube.com/watch?v=${liveVideo.id}`,
                  )
                }
              >
                <Ionicons
                  name="logo-youtube"
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.watchOnYoutubeText}>Watch on YouTube</Text>
              </TouchableOpacity>
            </View>

            {/* Informações da Transmissão */}
            <View style={styles.infoContainer}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: liveVideo.isLive ? "#E53E3E" : "#FF5252",
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {liveVideo.isLive ? "AO VIVO AGORA" : "ÚLTIMA TRANSMISSÃO"}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {formatDate(liveVideo.publishedAt)}
                </Text>
              </View>

              <Text style={styles.videoTitle}>{liveVideo.title}</Text>

            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-off-outline" size={48} color="#A0AEC0" />
            <Text style={styles.emptyText}>
              Nenhuma transmissão encontrada no momento.
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingVertical: 12,
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
    paddingTop: 12,
    paddingBottom: 30,
  },
  loaderContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  loaderText: {
    color: "#A0AEC0",
    marginTop: 10,
    fontSize: 14,
  },
  playerCard: {
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.primaryVibrant || "#25A688",
    marginBottom: 16,
  },
  watchOnYoutubeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 10,
  },
  watchOnYoutubeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  infoContainer: {
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    lineHeight: 26,
    marginBottom: 6,
  },
  videoDescription: {
    fontSize: 14,
    color: "#A0AEC0",
    lineHeight: 20,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
  },
  emptyText: {
    color: "#A0AEC0",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
});
