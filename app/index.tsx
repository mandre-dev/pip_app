import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { HubButton } from '../src/components/HubButton';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Superior */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => console.log('Configurações')}>
            <Ionicons name="settings-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login')}>
            <Ionicons name="person-circle-outline" size={30} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Marca/Header Central */}
        <View style={styles.brandContainer}>
          <Ionicons name="location-outline" size={20} color={COLORS.primaryLight} />
          <Text style={styles.brandTitle}>PRIMEIRA IGREJA</Text>
          <Text style={styles.brandSubtitle}>PRESBITERIANA</Text>
          <Text style={styles.brandCity}>DE CABO FRIO</Text>
        </View>

        {/* Grid de Funcionalidades */}
        <View style={styles.grid}>
          <HubButton 
            title="IGREJA" 
            iconName="business-outline" 
            onPress={() => router.push('/igreja')} 
          />
          <HubButton 
            title="MINISTÉRIOS" 
            iconName="flame-outline" 
            onPress={() => router.push('/ministerios')} 
          />
          <HubButton 
            title="NOTÍCIAS" 
            iconName="newspaper-outline" 
            onPress={() => console.log('Notícias')} 
          />

          <HubButton 
            title="MENSAGENS" 
            iconName="play-circle-outline" 
            onPress={() => console.log('Mensagens')} 
          />
          <HubButton 
            title="DOAÇÃO" 
            iconName="heart-outline" 
            onPress={() => router.push('/doacao')} 
          />
          <HubButton 
            title="AO VIVO" 
            iconName="videocam-outline" 
            onPress={() => console.log('Ao Vivo')} 
          />

          <HubButton 
            title="MURAL DE ORAÇÕES" 
            iconName="journal-outline" 
            onPress={() => router.push('/oracao')} 
          />
          <HubButton 
            title="PLANO DE ORAÇÃO" 
            iconName="book-outline" 
            onPress={() => console.log('Plano de Oração')} 
          />
          <HubButton 
            title="EVENTOS" 
            iconName="calendar-outline" 
            onPress={() => console.log('Eventos')} 
          />
        </View>

        {/* Indicador Inferior */}
        <View style={styles.footerIndicator}>
          <Ionicons name="chevron-down-outline" size={24} color={COLORS.primaryLight} />
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
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  brandTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 4,
  },
  brandSubtitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandCity: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  footerIndicator: {
    alignItems: 'center',
    marginTop: 15,
  },
});