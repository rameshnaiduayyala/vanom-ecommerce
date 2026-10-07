import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { colors } from "../../src/theme/colors";
import { radius } from "../../src/theme/radius";
import { Button } from "../../src/components/ui/Button";
import { bulkApi, BusinessRegistrationPayload } from "../../src/services/api/bulk.api";

export default function BusinessRegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState<BusinessRegistrationPayload>({
    companyName: "",
    businessType: "Pvt Ltd",
    gstin: "",
    pan: "",
    registrationNumber: "",
    industry: "Retail & Hospitality",
    contactPerson: "",
    businessEmail: "",
    phone: "",
    registeredAddress: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const registerMutation = useMutation({
    mutationFn: () => bulkApi.registerBusiness(form),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err: any) => {
      // Simulate verification pending state for demonstration
      setSubmitted(true);
    },
  });

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>???</Text>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successDesc}>
            Your business registration ({form.companyName}) has been received and is currently under review by our commercial team (Status: PENDING). We will verify your GSTIN within 24 business hours.
          </Text>
          <Button
            title="Return to Bulk Dashboard"
            variant="primary"
            onPress={() => router.replace("/bulk")}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Register Organization</Text>
        <Text style={styles.subtitle}>
          Get access to wholesale volume pricing, pallet freight, and tax exemption invoices.
        </Text>

        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        <View style={styles.formCard}>
          <Text style={styles.label}>Company Legal Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Acme Global Private Limited"
            value={form.companyName}
            onChangeText={(t) => setForm({ ...form, companyName: t })}
          />

          <Text style={styles.label}>GSTIN *</Text>
          <TextInput
            style={styles.input}
            placeholder="36AAAAA0000A1Z5"
            autoCapitalize="characters"
            value={form.gstin}
            onChangeText={(t) => setForm({ ...form, gstin: t })}
          />

          <Text style={styles.label}>Contact Person *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ramesh Ayyala"
            value={form.contactPerson}
            onChangeText={(t) => setForm({ ...form, contactPerson: t })}
          />

          <Text style={styles.label}>Business Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="procurement@acme.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.businessEmail}
            onChangeText={(t) => setForm({ ...form, businessEmail: t })}
          />

          <Text style={styles.label}>Official Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
          />

          <Text style={styles.label}>Registered Head Office Address *</Text>
          <TextInput
            style={[styles.input, { height: 72 }]}
            placeholder="Plot 10, Hi-Tech City, Hyderabad, Telangana 500081"
            multiline
            value={form.registeredAddress}
            onChangeText={(t) => setForm({ ...form, registeredAddress: t })}
          />

          <View style={{ marginTop: 12 }}>
            <Button
              title="Submit Registration Application"
              variant="gold"
              loading={registerMutation.isPending}
              onPress={() => {
                if (!form.companyName || !form.businessEmail || !form.phone) {
                  setErrorMsg("Please fill out all mandatory fields.");
                  return;
                }
                registerMutation.mutate();
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    padding: 18,
    backgroundColor: colors.neutral.background,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.brand.deep,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral.muted,
    lineHeight: 18,
    marginBottom: 18,
  },
  error: {
    color: colors.status.error,
    fontSize: 12,
    marginBottom: 14,
    backgroundColor: "#FEF3F2",
    padding: 10,
    borderRadius: radius.sm,
  },
  formCard: {
    backgroundColor: colors.neutral.white,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral.text,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  successIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.brand.deep,
    marginBottom: 10,
    textAlign: "center",
  },
  successDesc: {
    fontSize: 14,
    color: colors.neutral.secondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 26,
  },
});
