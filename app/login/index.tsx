import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../../src/config/firebase';
import { COLORS } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (isRegistering) {
      if (!name.trim()) {
        Alert.alert('Atenção', 'Por favor, informe seu nome completo.');
        return;
      }
      if (!email || !password || !confirmPassword) {
        Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Atenção', 'As senhas não coincidem.');
        return;
      }
    } else {
      if (!email || !password) {
        Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name.trim()
          });
        }

        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.replace('/');
    } catch (error: any) {
      let message = 'Ocorreu um erro ao tentar acessar.';
      if (error.code === 'auth/invalid-email') message = 'E-mail inválido.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'E-mail ou senha incorretos.';
      }
      if (error.code === 'auth/email-already-in-use') message = 'Este e-mail já está cadastrado.';
      if (error.code === 'auth/weak-password') message = 'A senha deve ter pelo menos 6 caracteres.';
      
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Marca / Header */}
          <View style={styles.brandContainer}>
            <Image 
              source={require('../../assets/images/Logo-01-Branco.png')} 
              style={styles.logo} 
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {isRegistering ? 'Crie sua Conta' : 'Acesse sua Conta'}
            </Text>
            <Text style={styles.subtitle}>
              Primeira Igreja Presbiteriana de Cabo Frio
            </Text>
          </View>

          <View style={styles.form}>
            {/* Nome Completo - Cadastro */}
            {isRegistering && (
              <>
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#666666"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </>
            )}

            {/* E-mail */}
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Senha */}
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Sua senha"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={22} 
                  color="#666666" 
                />
              </TouchableOpacity>
            </View>

            {/* Confirmar Senha - Cadastro */}
            {isRegistering && (
              <>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Repita sua senha"
                    placeholderTextColor="#666666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={22} 
                      color="#666666" 
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleAuth} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.primaryMedium} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isRegistering ? 'CADASTRAR' : 'ENTRAR'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchModeButton} 
              onPress={() => {
                setIsRegistering(!isRegistering);
                setName('');
                setConfirmPassword('');
              }}
            >
              <Text style={styles.switchModeText}>
                {isRegistering 
                  ? 'Já tem uma conta? Faça Login' 
                  : 'Ainda não tem conta? Cadastre-se'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02493D',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  logo: {
    width: 280,
    height: 120,
    marginBottom: 10,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    color: COLORS.primaryLight,
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  label: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    color: COLORS.primaryDark,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    color: COLORS.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primaryVibrant,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 25,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  switchModeButton: {
    marginTop: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  switchModeText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});