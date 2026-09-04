import React, { useState } from "react";
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
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/config/firebase";
import { COLORS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados de Foco
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

  // Verifica se há tela anterior para exibir ou ocultar o botão de voltar
  const canGoBack = router.canGoBack();

  const handleAuth = async () => {
    if (isRegistering) {
      if (!name.trim()) {
        Alert.alert("Atenção", "Por favor, informe seu nome completo.");
        return;
      }
      if (!email || !password || !confirmPassword) {
        Alert.alert("Atenção", "Por favor, preencha todos os campos.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Atenção", "As senhas não coincidem.");
        return;
      }
    } else {
      if (!email || !password) {
        Alert.alert("Atenção", "Por favor, preencha o e-mail e a senha.");
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // 1. Cria a conta no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        if (userCredential.user) {
          // 2. Atualiza o perfil no Auth com o nome
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          });

          // 3. Salva o documento inicial na coleção 'users' do Firestore com nome e e-mail
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name.trim(),
            email: email.trim(),
            createdAt: new Date(),
          });

          // 4. Força o recarregamento do usuário local
          await userCredential.user.reload();
        }

        Alert.alert("Sucesso", "Conta criada com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      router.replace("/");
    } catch (error: any) {
      let message = "Ocorreu um erro ao tentar acessar.";
      if (error.code === "auth/invalid-email") message = "E-mail inválido.";
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        message = "E-mail ou senha incorretos.";
      }
      if (error.code === "auth/email-already-in-use")
        message = "Este e-mail já está cadastrado.";
      if (error.code === "auth/weak-password")
        message = "A senha deve ter pelo menos 6 caracteres.";

      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "web" && (
        <style type="text/css">{`
          input:focus {
            outline: none !important;
            box-shadow: none !important;
          }
        `}</style>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Botão de voltar renderizado apenas se houver histórico válido */}
          {canGoBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {/* Marca / Header */}
          <View style={styles.brandContainer}>
            <Image
              source={require("../../assets/images/Logo-01-Branco.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              {isRegistering ? "Crie sua Conta" : "Acesse sua Conta"}
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
                  style={[
                    styles.input,
                    isNameFocused ? styles.inputFocused : null,
                  ]}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#666666"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  autoCapitalize="words"
                />
              </>
            )}

            {/* E-mail */}
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[
                styles.input,
                isEmailFocused ? styles.inputFocused : null,
              ]}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Senha */}
            <Text style={styles.label}>Senha</Text>
            <View
              style={[
                styles.passwordContainer,
                isPasswordFocused ? styles.inputFocused : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Sua senha"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
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

            {/* Botão Esqueci minha Senha */}
            {!isRegistering && (
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => router.push("/forgot-password" as any)}
              >
                <Text style={styles.forgotPasswordText}>
                  Esqueci minha senha
                </Text>
              </TouchableOpacity>
            )}

            {/* Confirmar Senha - Cadastro */}
            {isRegistering && (
              <>
                <Text style={styles.label}>Confirmar Senha</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    isConfirmPasswordFocused ? styles.inputFocused : null,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Repita sua senha"
                    placeholderTextColor="#666666"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-outline" : "eye-off-outline"
                      }
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
                  {isRegistering ? "CADASTRAR" : "ENTRAR"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => {
                setIsRegistering(!isRegistering);
                setName("");
                setConfirmPassword("");
              }}
            >
              <Text style={styles.switchModeText}>
                {isRegistering
                  ? "Já tem uma conta? Faça Login"
                  : "Ainda não tem conta? Cadastre-se"}
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
    backgroundColor: "#02493D",
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  brandContainer: {
    alignItems: "center",
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
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    color: COLORS.primaryLight,
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    width: "100%",
  },
  label: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#fff",
    color: COLORS.primaryDark,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  passwordInput: {
    flex: 1,
    color: COLORS.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  inputFocused: {
    borderColor: "#000000",
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  forgotPasswordButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  submitButton: {
    backgroundColor: COLORS.primaryVibrant,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 25,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  switchModeButton: {
    marginTop: 18,
    alignItems: "center",
    marginBottom: 20,
  },
  switchModeText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    textDecorationLine: "underline",
  },
});
