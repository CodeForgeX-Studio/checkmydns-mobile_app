import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import Colors from "@/constants/colors";

const RECORD_TYPES = [
  { label: "A - IPv4 Address", value: "A" },
  { label: "AAAA - IPv6 Address", value: "AAAA" },
  { label: "MX - Mail Exchange", value: "MX" },
  { label: "NS - Name Server", value: "NS" },
  { label: "TXT - Text Record", value: "TXT" },
  { label: "CNAME - Canonical Name", value: "CNAME" },
  { label: "SOA - Start of Authority", value: "SOA" },
  { label: "PTR - Pointer Record", value: "PTR" },
  { label: "SRV - Service Record", value: "SRV" },
  { label: "CAA - Certificate Authority", value: "CAA" },
  { label: "NAPTR - Name Authority Pointer", value: "NAPTR" },
  { label: "DS - Delegation Signer", value: "DS" },
  { label: "DNSKEY - DNS Public Key", value: "DNSKEY" },
];

interface DNSRecord {
  type?: string;
  host?: string;
  ip?: string;
  ipv6?: string;
  target?: string;
  priority?: number;
  ns_server?: string;
  txt?: string;
  cname?: string;
  primary_name_server?: string;
  hostmaster?: string;
  ptr?: string;
  port?: number;
  flags?: number | string;
  tag?: string;
  value?: string;
  order?: number;
  preference?: number;
  service?: string;
  regexp?: string;
  replacement?: string;
  key_tag?: string;
  algorithm?: string;
  digest_type?: string;
  digest?: string;
  protocol?: string;
  public_key?: string;
  message?: string;
  error?: string;
}

interface DNSResult {
  location: string;
  ip: string;
  provider: string;
  dns_results: DNSRecord[];
  resolved: boolean;
}

export default function DNSCheckerScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [hasEverFocused, setHasEverFocused] = useState(false);
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [results, setResults] = useState<DNSResult[]>([]);

  const checkDNS = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("domain", domain);
      formData.append("recordType", recordType);

      const response = await fetch("https://api.checkmydns.online/v1.0/dns-check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to check DNS records");
      }

      return response.json();
    },
    onSuccess: (data: DNSResult[]) => {
      setResults(data);
    },
  });

  const handleCheck = () => {
    if (!domain.trim()) {
      alert("Please enter a domain name");
      return;
    }
    setResults([]);
    checkDNS.mutate();
  };

  useEffect(() => {
    if (isFocused && hasEverFocused) {
      setDomain("");
      setRecordType("A");
      setShowTypePicker(false);
      setResults([]);
      checkDNS.reset();
    }
    if (isFocused && !hasEverFocused) {
      setHasEverFocused(true);
    }
  }, [isFocused]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>DNS Checker</Text>
          <Text style={styles.subtitle}>
            Check DNS records globally from multiple servers
          </Text>
        </View>

        <View style={styles.card}>
          <View className="form-group" style={styles.formGroup}>
            <Text style={styles.label}>Domain Name</Text>
            <TextInput
              style={styles.input}
              placeholder="example.com"
              placeholderTextColor={Colors.textMuted}
              value={domain}
              onChangeText={setDomain}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Record Type</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowTypePicker(!showTypePicker)}
            >
              <Text style={styles.pickerText}>
                {RECORD_TYPES.find((t) => t.value === recordType)?.label}
              </Text>
            </TouchableOpacity>

            {showTypePicker && (
              <View style={styles.pickerOptions}>
                {RECORD_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.pickerOption,
                      recordType === type.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setRecordType(type.value);
                      setShowTypePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        recordType === type.value && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, checkDNS.isPending && styles.buttonDisabled]}
            onPress={handleCheck}
            disabled={checkDNS.isPending}
          >
            {checkDNS.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Check DNS Records</Text>
            )}
          </TouchableOpacity>
        </View>

        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>DNS Query Results</Text>
            {results.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultLocation}>{result.location}</Text>
                    <Text style={styles.resultProvider}>
                      {result.provider} ({result.ip})
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      result.resolved ? styles.statusSuccess : styles.statusError,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {result.resolved ? "Resolved" : "Failed"}
                    </Text>
                  </View>
                </View>

                {result.dns_results && result.dns_results.length > 0 ? (
                  result.dns_results.map((record, idx) => (
                    <View key={idx} style={styles.recordItem}>
                      <Text style={styles.recordText}>
                        {JSON.stringify(record, null, 2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.recordItem}>
                    <Text style={styles.recordText}>No records found</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {checkDNS.isError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Failed to check DNS records. Please try again.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  picker: {
    backgroundColor: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text,
  },
  pickerOptions: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultLocation: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  resultProvider: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success,
  },
  statusError: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  recordItem: {
    backgroundColor: Colors.dark,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: 8,
  },
  recordText: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  errorCard: {
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
  },
});