import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SecurityCheckResult {
  percentage: number;
  level: string;
  issues: string[];
  warnings: string[];
  improvements: string[];
  details: {
    input_domain?: string;
    parent_domain?: string;
    using_parent_fallback?: boolean;
    SPF?: any;
    DMARC?: any;
    DKIM?: any;
    BIMI?: any;
    SSL?: any;
    HSTS?: any;
    DNSSEC?: any;
    CAA?: any;
    MTA_STS?: any;
    TLS_RPT?: any;
  };
}

export default function SecurityCheckerScreen() {
  const insets = useSafeAreaInsets();
  const [domain, setDomain] = useState('');
  const [dkimSelector, setDkimSelector] = useState('');
  const [result, setResult] = useState<SecurityCheckResult | null>(null);

  const checkSecurity = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('domain', domain);
      if (dkimSelector.trim()) {
        formData.append('dkim_selector', dkimSelector);
      }

      const response = await fetch('https://checkmydns.online/api/security-check', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Security check failed');
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
    checkSecurity.mutate();
  };

  const getStatusIcon = (level: string) => {
    if (level === 'High')
      return <CheckCircle size={24} color={Colors.success} />;
    if (level === 'Low') return <XCircle size={24} color={Colors.error} />;
    return <AlertTriangle size={24} color={Colors.warning} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Security Checker</Text>
          <Text style={styles.subtitle}>
            Comprehensive domain security check for email, SSL/TLS, DNSSEC & more
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Domain Name</Text>
            <TextInput
              style={styles.input}
              placeholder="example.com or sub.example.com"
              placeholderTextColor={Colors.textMuted}
              value={domain}
              onChangeText={setDomain}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Enter the primary domain or subdomain you want to audit, without protocol
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>DKIM Selector (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. default, google, s1"
              placeholderTextColor={Colors.textMuted}
              value={dkimSelector}
              onChangeText={setDkimSelector}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Leave empty to auto-detect with common selectors
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, checkSecurity.isPending && styles.buttonDisabled]}
            onPress={handleCheck}
            disabled={checkSecurity.isPending}
          >
            {checkSecurity.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Run Security Check</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Security Overview</Text>
              <View
                style={[
                  styles.statusBadge,
                  result.level === 'High'
                    ? styles.statusSuccess
                    : result.level === 'Low'
                    ? styles.statusError
                    : styles.statusWarning,
                ]}
              >
                {getStatusIcon(result.level)}
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusBadgeText}>
                    Overall security score: {result.percentage}% ({result.level})
                  </Text>
                </View>
              </View>
              <Text style={styles.summaryDescription}>
                This score is based on email authentication, SSL/TLS, DNS security and
                advanced email TLS.
              </Text>
              <Text style={styles.summaryDescription}>
                Focus first on the critical issues, then apply the recommended improvements
                to reach a higher score.
              </Text>
            </View>

            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Detailed Security Findings</Text>

              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>Critical Issues</Text>
                  <View style={[styles.badge, styles.badgeError]}>
                    <Text style={styles.badgeText}>Fix ASAP</Text>
                  </View>
                </View>
                <View style={styles.resultContent}>
                  {result.issues.length > 0 ? (
                    result.issues.map((issue, index) => (
                      <Text key={index} style={styles.listItem}>
                        • {issue}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.listItem}>
                      No critical issues detected.
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>Best Practice Warnings</Text>
                  <View style={[styles.badge, styles.badgeWarning]}>
                    <Text style={styles.badgeText}>Recommended</Text>
                  </View>
                </View>
                <View style={styles.resultContent}>
                  {result.warnings.length > 0 ? (
                    result.warnings.map((warning, index) => (
                      <Text key={index} style={styles.listItem}>
                        • {warning}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.listItem}>
                      No additional warnings. Good job!
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>
                    Suggested Improvements & Next Steps
                  </Text>
                </View>
                <View style={styles.resultContent}>
                  {result.improvements.length > 0 ? (
                    result.improvements.map((improvement, index) => (
                      <Text key={index} style={styles.listItem}>
                        • {improvement}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.listItem}>
                      No additional suggestions at this time.
                    </Text>
                  )}
                </View>
              </View>

              {result.details && (
                <>
                  <View style={styles.resultCard}>
                    <View style={styles.resultCardHeader}>
                      <Text style={styles.resultCardTitle}>Email Security Details</Text>
                    </View>
                    <View style={styles.resultContent}>
                      {result.details.using_parent_fallback && (
                        <Text style={[styles.listItem, styles.warningText]}>
                          Note: No email/auth records found on {result.details.input_domain}.
                          Using records from {result.details.parent_domain}.
                        </Text>
                      )}
                      {result.details.SPF && (
                        <Text style={styles.listItem}>
                          • SPF: {result.details.SPF.value}
                        </Text>
                      )}
                      {result.details.DMARC && (
                        <Text style={styles.listItem}>
                          • DMARC: {result.details.DMARC.value}
                        </Text>
                      )}
                      {result.details.DKIM && (
                        <Text style={styles.listItem}>
                          • DKIM: Found (selector: {result.details.DKIM.selector_used})
                        </Text>
                      )}
                      {result.details.BIMI && (
                        <Text style={styles.listItem}>
                          • BIMI: {result.details.BIMI.value}
                        </Text>
                      )}
                    </View>
                  </View>

                  {result.details.SSL && (
                    <View style={styles.resultCard}>
                      <View style={styles.resultCardHeader}>
                        <Text style={styles.resultCardTitle}>SSL / HTTPS Details</Text>
                      </View>
                      <View style={styles.resultContent}>
                        <Text style={styles.listItem}>
                          • SSL Issuer: {result.details.SSL.issuer || 'Unknown'}
                        </Text>
                        {result.details.SSL.expiry_days !== undefined && (
                          <Text style={styles.listItem}>
                            • SSL Expiry: ~{Math.round(result.details.SSL.expiry_days)} days
                            remaining
                          </Text>
                        )}
                        {result.details.HSTS && (
                          <Text style={styles.listItem}>
                            • HSTS: {result.details.HSTS}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.resultCard}>
                    <View style={styles.resultCardHeader}>
                      <Text style={styles.resultCardTitle}>
                        DNS & Transport Security Details
                      </Text>
                    </View>
                    <View style={styles.resultContent}>
                      {result.details.DNSSEC && (
                        <Text style={styles.listItem}>
                          • DNSSEC: {result.details.DNSSEC.status}
                        </Text>
                      )}
                      {result.details.CAA && (
                        <Text style={styles.listItem}>
                          • CAA: {result.details.CAA.value}
                        </Text>
                      )}
                      {result.details.MTA_STS && (
                        <Text style={styles.listItem}>
                          • MTA-STS: {result.details.MTA_STS.value}
                        </Text>
                      )}
                      {result.details.TLS_RPT && (
                        <Text style={styles.listItem}>
                          • TLS-RPT: {result.details.TLS_RPT.value}
                        </Text>
                      )}
                    </View>
                  </View>
                </>
              )}
            </View>
          </>
        )}

        {checkSecurity.isError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Failed to complete security check. Please try again.
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
  statusTextContainer: {
    flex: 1,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  summaryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
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
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeError: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error,
  },
  badgeWarning: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.success,
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
  listItem: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  warningText: {
    color: Colors.warning,
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