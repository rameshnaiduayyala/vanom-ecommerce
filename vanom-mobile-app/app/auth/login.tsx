import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { Button } from "../../src/components/ui/Button";
import { authApi } from "../../src/services/api/auth.api";
import { useAuthStore } from "../../src/store/auth.store";

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: (res) => {
      setUser(res.data?.user);
      router.back();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Vanom</Text>
        <Text style={styles.subtitle}>Sign in to access your orders, saved addresses, and profile.</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@domain.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            title="Sign In"
            loading={loginMutation.isPending}
            onPress={() => {
              setErrorMsg("");
              if (!email || !password) {
                setErrorMsg("Please enter both email and password");
                return;
              }
              loginMutation.mutate();
            }}
          />

          <TouchableOpacity
            onPress={() => router.replace("/auth/register")}
            style={styles.switchLink}
          >
            <Text style={styles.switchText}>New to Vanom? Create an account ?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.brand.deep,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral.muted,
    marginBottom: 24,
  },
  error: {
    color: colors.status.error,
    fontSize: 13,
    marginBottom: 16,
    backgroundColor: "#FEF3F2",
    padding: 10,
    borderRadius: radius.sm,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  switchLink: {
    alignItems: "center",
    marginTop: 18,
  },
  switchText: {
    color: colors.brand.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});
