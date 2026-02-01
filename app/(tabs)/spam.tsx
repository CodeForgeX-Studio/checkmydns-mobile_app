import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';

const MODE_OPTIONS = [
  { label: 'Auto detect (IP or Domain)', value: 'auto' },
  { label: 'Force IP check', value: 'ip' },
  { label: 'Force domain check', value: 'domain' },
];

interface SpamCheckResult {
  checked_value: string;
  type: string;
  ip: string;
  domain: string;
  total_lists: number;
  listed_count: number;
  results: {
    name: string;
    host: string;
    listed: boolean;
    response?: string;
    reason?: string;
    list_url?: string;
  }[];
}

export default function SpamCheckerScreen() {
  const insets = useSafeAreaInsets();
  const [target, setTarget] = useState('');
  const [mode, setMode] = useState('auto');
  const [showModePicker, setShowModePicker] = useState(false);
  const [result, setResult] = useState<SpamCheckResult | null>(null);

  const checkSpam = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('target', target);
      formData.append('mode', mode);

      const response = await fetch('https://checkmydns.online/api/spam-check', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unknown error during spam check');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleCheck = () => {
    if (!target.trim()) {
      alert('Please enter an IP address or domain');
      return;
    }
    setResult(null);
    checkSpam.mutate();
  };

  const getStatusIcon = (listedCount: number) => {
    if (listedCount === 0) return <CheckCircle size={24} color={Colors.success} />;
    if (listedCount <= 3) return <AlertTriangle size={24} color={Colors.warning} />;
    return <XCircle size={24} color={Colors.error} />;
  };

  const getStatusText = (listedCount: number) => {
    if (listedCount === 0) return 'No listings detected on checked blacklists.';
    if (listedCount === 1) return 'Listed on 1 blacklist.';
    return `Listed on ${listedCount} blacklists.`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Spam Checker</Text>
          <Text style={styles.subtitle}>
            Check if your IP or domain is listed in major DNSBL (blacklist) databases
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>IP Address or Domain</Text>
            <TextInput
              style={styles.input}
              placeholder="1.2.3.4 or example.com"
              placeholderTextColor={Colors.textMuted}
              value={target}
              onChangeText={setTarget}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Enter the sending IP address of your mailserver or the domain you want to check
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Check Type</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowModePicker(!showModePicker)}
            >
              <Text style={styles.pickerText}>
                {MODE_OPTIONS.find((t) => t.value === mode)?.label}
              </Text>
            </TouchableOpacity>

            {showModePicker && (
              <View style={styles.pickerOptions}>
                {MODE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      mode === option.value && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setMode(option.value);
                      setShowModePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        mode === option.value && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Text style={styles.hint}>
              Auto detect tries to determine if the input is an IP address or a domain
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, checkSpam.isPending && styles.buttonDisabled]}
            onPress={handleCheck}
            disabled={checkSpam.isPending}
          >
            {checkSpam.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Check Blacklists</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Blacklist Summary</Text>
              <View
                style={[
                  styles.statusBadge,
                  result.listed_count === 0
                    ? styles.statusSuccess
                    : result.listed_count <= 3
                    ? styles.statusWarning
                    : styles.statusError,
                ]}
              >
                {getStatusIcon(result.listed_count)}
                <Text style={styles.statusBadgeText}>
                  {getStatusText(result.listed_count)}
                </Text>
              </View>
              <Text style={styles.summaryDescription}>
                Checked {result.total_lists} DNSBL/RBL providers for{' '}
                <Text style={styles.boldText}>{result.checked_value}</Text>.
              </Text>
            </View>

            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>DNSBL / Blacklist Results</Text>
              {result.results.map((item, index) => (
                <View key={index} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>{item.name}</Text>
                      <Text style={styles.resultProvider}>{item.host}</Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        item.listed ? styles.badgeError : styles.badgeSuccess,
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {item.listed ? 'LISTED' : 'OK'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultContent}>
                    <Text style={styles.resultText}>
                      <Text style={styles.boldText}>Status:</Text>{' '}
                      {item.listed ? 'LISTED' : 'OK'}
                    </Text>
                    <Text style={styles.resultText}>
                      <Text style={styles.boldText}>Host:</Text> {item.host}
                    </Text>
                    {item.response && (
                      <Text style={styles.resultText}>
                        <Text style={styles.boldText}>Response:</Text> {item.response}
                      </Text>
                    )}
                    <Text style={styles.resultText}>
                      <Text style={styles.boldText}>Reason:</Text>{' '}
                      {item.reason ||
                        (item.listed
                          ? 'Listed without provided reason.'
                          : 'Not listed on this blacklist.')}
                    </Text>
                    {item.list_url && (
                      <Text style={styles.resultText}>
                        <Text style={styles.boldText}>More info:</Text> {item.list_url}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {checkSpam.isError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {checkSpam.error instanceof Error
                ? checkSpam.error.message
                : 'Failed to perform spam/blacklist check. Please try again.'}
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
    fontWeight: '800' as const,
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
    fontWeight: '600' as const,
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
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
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
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  pickerOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pickerOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  summaryCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 50,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  statusSuccess: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success,
  },
  statusWarning: {
    backgroundColor: Colors.warningBg,
    borderColor: Colors.warning,
  },
  statusError: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  summaryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '600' as const,
    color: Colors.text,
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  resultProvider: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success,
  },
  badgeError: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  resultContent: {
    backgroundColor: Colors.dark,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  resultText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
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