import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView } from
"react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { Button } from "../../src/components/ui/Button";
import { authApi } from "../../src/services/api/auth.api";
import { useAuthStore } from "../../src/store/auth.store";

export default function RegisterScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const registerMutation = useMutation({
    mutationFn: () => authApi.register({ email, password, firstName, lastName }),
    onSuccess: (res) => {
      setUser(res.data?.user);
      router.back();
    },
    onError: (err) => {
      setErrorMsg(err.message || "Registration failed. Please check your details.");
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join Vanom for seamless tracking, faster checkout, and exclusive offers.</Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <View style={styles.form}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ramesh"
            value={firstName}
            onChangeText={setFirstName} />
          

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ayyala"
            value={lastName}
            onChangeText={setLastName} />
          

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@domain.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail} />
          

          <Text style={styles.label}>Password (minimum 8 characters)</Text>
          <TextInput
            style={styles.input}
            placeholder="��������"
            secureTextEntry
            value={password}
            onChangeText={setPassword} />
          

          <Button
            title="Create Account"
            loading={registerMutation.isPending}
            onPress={() => {
              setErrorMsg("");
              if (!email || !password || password.length < 8) {
                setErrorMsg("Please provide a valid email and 8+ character password.");
                return;
              }
              registerMutation.mutate();
            }} />
          

          <TouchableOpacity
            onPress={() => router.replace("/auth/login")}
            style={styles.switchLink}>
            
            <Text style={styles.switchText}>Already registered? Sign in ?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>);

}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white
  },
  container: {
    padding: 24,
    justifyContent: "center"
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.brand.deep,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral.muted,
    marginBottom: 24
  },
  error: {
    color: colors.status.error,
    fontSize: 13,
    marginBottom: 16,
    backgroundColor: "#FEF3F2",
    padding: 10,
    borderRadius: radius.sm
  },
  form: {
    gap: 12
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral.text
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 14
  },
  switchLink: {
    alignItems: "center",
    marginTop: 18
  },
  switchText: {
    color: colors.brand.primary,
    fontWeight: "600",
    fontSize: 13
  }
});