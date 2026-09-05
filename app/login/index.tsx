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

  // Mensagens de erro individuais
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Estados de Foco
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);

  const canGoBack = router.canGoBack();

  const validateFields = () => {
    let valid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (isRegistering && !name.trim()) {
      newErrors.name = "Nome é obrigatório.";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "E-mail é obrigatório.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória.";
      valid = false;
    }

    if (isRegistering) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Confirmação de senha é obrigatória.";
        valid = false;
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem.";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAuth = async () => {
    setErrors({ name: "", email: "", password: "", confirmPassword: "" });

    // 1. Valida campos obrigatórios localmente
    if (!validateFields()) return;

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isRegistering) {
        // 2. Cria a conta no Firebase Auth (ele valida e-mail duplicado automaticamente)
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        );

        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          });

          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: name.trim(),
            email: cleanEmail,
            createdAt: new Date(),
          });

          await userCredential.user.reload();
        }

        Alert.alert("Sucesso", "Conta criada com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
      router.replace("/");
    } catch (error: any) {
      console.error("Erro na autenticação:", error.code, error.message);

      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({
          ...prev,
          email: "Este e-mail já está vinculado a outra conta.",
        }));
        Alert.alert("Atenção", "Este e-mail já está cadastrado.");
      } else if (error.code === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: "E-mail inválido." }));
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        Alert.alert("Erro", "E-mail ou senha incorretos.");
      } else if (error.code === "auth/weak-password") {
        setErrors((prev) => ({
          ...prev,
          password: "A senha deve ter pelo menos 6 caracteres.",
        }));
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao tentar processar o cadastro.");
      }
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
          {canGoBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}

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
            {/* Nome Completo */}
            {isRegistering && (
              <>
                <Text style={styles.label}>Nome Completo *</Text>
                <TextInput
                  style={[
                    styles.input,
                    isNameFocused ? styles.inputFocused : null,
                    !!errors.name ? styles.inputError : null,
                  ]}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#666666"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  autoCapitalize="words"
                />
                {!!errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </>
            )}

            {/* E-mail */}
            <Text style={styles.label}>E-mail *</Text>
            <TextInput
              style={[
                styles.input,
                isEmailFocused ? styles.inputFocused : null,
                !!errors.email ? styles.inputError : null,
              ]}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((p) => ({ ...p, email: "" }));
              }}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            {/* Senha */}
            <Text style={styles.label}>Senha *</Text>
            <View
              style={[
                styles.passwordContainer,
                isPasswordFocused ? styles.inputFocused : null,
                !!errors.password ? styles.inputError : null,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Sua senha"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: "" }));
                }}
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
            {!!errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

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

            {/* Confirmar Senha */}
            {isRegistering && (
              <>
                <Text style={styles.label}>Confirmar Senha *</Text>
                <View
                  style={[
                    styles.passwordContainer,
                    isConfirmPasswordFocused ? styles.inputFocused : null,
                    !!errors.confirmPassword ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Repita sua senha"
                    placeholderTextColor="#666666"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword)
                        setErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
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
                {!!errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
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
                setErrors({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
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
  inputError: {
    borderColor: "#FF4D4D",
    borderWidth: 1.5,
  },
  errorText: {
    color: "#FF9999",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
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
