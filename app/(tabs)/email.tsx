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

interface EmailCheckResult {
  success: boolean;
  mxValid: boolean;
  disposable: boolean;
  deliverable: boolean;
  spf: string;
  dmarc: string;
  dkim: string;
  mx: string;
  ptr: string;
  bimi: string;
  google_verification: string;
}

export default function EmailCheckerScreen() {
  const insets = useSafeAreaInsets();
  const [domain, setDomain] = useState('');
  const [dkimSelector, setDkimSelector] = useState('');
  const [result, setResult] = useState<EmailCheckResult | null>(null);

  const checkEmail = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('domain', domain);
      if (dkimSelector.trim()) {
        formData.append('dkimSelector', dkimSelector);
      }

      const response = await fetch('https://checkmydns.online/api/email-check', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to check email host');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleCheck = () => {
    if (!domain.trim()) {
      alert('Please enter a domain name');
      return;
    }
    setResult(null);
    checkEmail.mutate();
  };

  const getStatusIcon = (value: string) => {
    const isMissing =
      value.toLowerCase().includes('missing') ||
      value.toLowerCase().includes('not found') ||
      value.toLowerCase().includes('invalid') ||
      value.toLowerCase().includes('not verified');

    if (isMissing) {
      return <XCircle size={20} color={Colors.error} />;
    }
    return <CheckCircle size={20} color={Colors.success} />;
  };

  const checks = result
    ? [
        { title: 'SPF Record', value: result.spf },
        { title: 'DMARC Record', value: result.dmarc },
        { title: 'DKIM Record', value: result.dkim },
        { title: 'MX Records', value: result.mx },
        { title: 'PTR Record', value: result.ptr },
        { title: 'BIMI Record', value: result.bimi },
        { title: 'Google Verification', value: result.google_verification },
      ]
    : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Email Checker</Text>
          <Text style={styles.subtitle}>
            Validate email domain configuration including SPF, DMARC, DKIM & more
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
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
            <Text style={styles.label}>DKIM Selector (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="default, google, k1, selector1"
              placeholderTextColor={Colors.textMuted}
              value={dkimSelector}
              onChangeText={setDkimSelector}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>Common selectors: default, google, k1, selector1</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, checkEmail.isPending && styles.buttonDisabled]}
            onPress={handleCheck}
            disabled={checkEmail.isPending}
          >
            {checkEmail.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Check Email Security</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Deliverability Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  result.deliverable
                    ? styles.statusSuccess
                    : result.disposable
                    ? styles.statusWarning
                    : styles.statusError,
                ]}
              >
                {result.deliverable ? (
                  <CheckCircle size={20} color={Colors.success} />
                ) : result.disposable ? (
                  <AlertTriangle size={20} color={Colors.warning} />
                ) : (
                  <XCircle size={20} color={Colors.error} />
                )}
                <Text style={styles.statusBadgeText}>
                  {result.deliverable
                    ? 'Email is deliverable'
                    : result.disposable
                    ? 'Disposable email domain detected'
                    : result.mxValid
                    ? 'Email may not be deliverable'
                    : 'No valid MX records found'}
                </Text>
              </View>
            </View>

            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Email Configuration Results</Text>
              {checks.map((check, index) => (
                <View key={index} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>{check.title}</Text>
                    {getStatusIcon(check.value)}
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultText}>{check.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {checkEmail.isError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Failed to check email configuration. Please try again.
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
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
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