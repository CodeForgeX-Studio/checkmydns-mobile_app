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
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react-native";
import Colors from "@/constants/colors";

interface SecurityDetailsSPF {
  value?: string;
  mode?: string;
  found_on?: string;
  fallback_used?: boolean;
}

interface SecurityDetailsDMARC {
  value?: string;
  policy?: string;
  subdomain_policy?: string;
  rua?: string;
  ruf?: string;
  found_on?: string;
  fallback_used?: boolean;
}

interface SecurityDetailsDKIM {
  selector_used?: string;
  found_on?: string;
  fallback_used?: boolean;
  status?: string;
}

interface SecurityDetailsBIMI {
  value?: string;
  found_on?: string;
  fallback_used?: boolean;
}

interface SecurityDetailsSSL {
  issuer?: string;
  expiry_days?: number;
  subject?: { [key: string]: any };
  altnames?: string[];
}

interface SecurityDetailsDNSSEC {
  status?: string;
  applies_to?: string;
  fallback_used?: boolean;
  ds?: any[];
  dnskey?: any[];
}

interface SecurityDetailsCAA {
  value?: string;
  found_on?: string;
  fallback_used?: boolean;
}

interface SecurityDetailsMtaStsOrTlsRpt {
  value?: string;
  found_on?: string;
  fallback_used?: boolean;
}

interface SecurityCheckDetails {
  input_domain?: string;
  parent_domain?: string;
  using_parent_fallback?: boolean;
  SPF?: SecurityDetailsSPF | null;
  DMARC?: SecurityDetailsDMARC | null;
  DKIM?: SecurityDetailsDKIM | null;
  BIMI?: SecurityDetailsBIMI | null;
  SSL?: SecurityDetailsSSL | null;
  HSTS?: string | null;
  DNSSEC?: SecurityDetailsDNSSEC | null;
  CAA?: SecurityDetailsCAA | null;
  MTA_STS?: SecurityDetailsMtaStsOrTlsRpt | null;
  TLS_RPT?: SecurityDetailsMtaStsOrTlsRpt | null;
}

interface SecurityCheckResult {
  percentage: number;
  level: string;
  issues: string[];
  warnings: string[];
  improvements: string[];
  details: SecurityCheckDetails;
}

export default function SecurityCheckerScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [hasEverFocused, setHasEverFocused] = useState(false);
  const [domain, setDomain] = useState("");
  const [dkimSelector, setDkimSelector] = useState("");
  const [result, setResult] = useState<SecurityCheckResult | null>(null);

  const checkSecurity = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("domain", domain);
      if (dkimSelector.trim()) {
        formData.append("dkim_selector", dkimSelector);
      }

      const response = await fetch("https://api.checkmydns.online/v1.0/security-check", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Security check failed.");
      }

      return data as SecurityCheckResult;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleCheck = () => {
    if (!domain.trim()) {
      alert("Please enter a domain name.");
      return;
    }
    setResult(null);
    checkSecurity.mutate();
  };

  const getStatusIcon = (level: string) => {
    if (level === "High") return <CheckCircle size={24} color={Colors.success} />;
    if (level === "Low") return <XCircle size={24} color={Colors.error} />;
    return <AlertTriangle size={24} color={Colors.warning} />;
  };

  useEffect(() => {
    if (isFocused && hasEverFocused) {
      setDomain("");
      setDkimSelector("");
      setResult(null);
      checkSecurity.reset();
    }
    if (isFocused && !hasEverFocused) {
      setHasEverFocused(true);
    }
  }, [isFocused]);

  const renderEmailDetails = (details: SecurityCheckDetails) => {
    const lines: string[] = [];
    const inputDomain = details.input_domain || "";
    const parentDomain = details.parent_domain || "";
    const usingParent = details.using_parent_fallback === true;

    if (usingParent && parentDomain && inputDomain && parentDomain !== inputDomain) {
      lines.push(
        `Note: No email/auth records were found on ${inputDomain}.`,
      );
      lines.push(
        `The checker looked at the main domain ${parentDomain} and is using those records for this subdomain.`,
      );
      lines.push("");
    }

    if (details.SPF) {
      lines.push(`• SPF record: ${details.SPF.value}`);
      if (details.SPF.mode) {
        lines.push(`  Mode: ${details.SPF.mode}`);
      }
      if (details.SPF.found_on) {
        lines.push(`  Record location: ${details.SPF.found_on}`);
      }
      if (details.SPF.fallback_used) {
        lines.push(
          `  No SPF on ${inputDomain}; using SPF from ${details.SPF.found_on} for this check.`,
        );
      }
    } else {
      lines.push("• SPF: not found.");
    }

    if (details.DMARC) {
      lines.push(`• DMARC: ${details.DMARC.value}`);
      if (details.DMARC.policy) {
        lines.push(`  Policy: ${details.DMARC.policy}`);
      }
      if (details.DMARC.subdomain_policy) {
        lines.push(`  Subdomain policy: ${details.DMARC.subdomain_policy}`);
      }
      if (details.DMARC.rua) {
        lines.push(`  RUA: ${details.DMARC.rua}`);
      }
      if (details.DMARC.ruf) {
        lines.push(`  RUF: ${details.DMARC.ruf}`);
      }
      if (details.DMARC.found_on) {
        lines.push(`  Record location: ${details.DMARC.found_on}`);
      }
      if (details.DMARC.fallback_used) {
        lines.push(
          `  No DMARC on ${inputDomain}; using DMARC from ${details.DMARC.found_on} (applies to subdomains).`,
        );
      }
    } else {
      lines.push("• DMARC: not found.");
    }

    if (details.DKIM) {
      lines.push("• DKIM: record found.");
      if (details.DKIM.selector_used) {
        lines.push(`  Selector used: ${details.DKIM.selector_used}`);
      }
      if (details.DKIM.found_on) {
        lines.push(`  Record location: ${details.DKIM.found_on}`);
      }
      if (details.DKIM.fallback_used) {
        lines.push(
          `  No DKIM on ${inputDomain}; using DKIM selector on ${details.DKIM.found_on}.`,
        );
      }
    } else {
      lines.push("• DKIM: no record found with tested selectors.");
    }

    if (details.BIMI) {
      const bimiText = details.BIMI.value || "Present";
      lines.push(`• BIMI: ${bimiText}`);
      if (details.BIMI.found_on) {
        lines.push(`  Record location: ${details.BIMI.found_on}`);
      }
      if (details.BIMI.fallback_used) {
        lines.push(
          `  No BIMI on ${inputDomain}; using BIMI from ${details.BIMI.found_on}.`,
        );
      }
    } else {
      lines.push("• BIMI: not configured.");
    }

    return lines;
  };

  const renderSslDetails = (details: SecurityCheckDetails) => {
    const lines: string[] = [];

    if (details.SSL) {
      const ssl = details.SSL;
      const issuer = ssl.issuer || "Unknown";
      const expiryDays =
        ssl.expiry_days !== undefined && ssl.expiry_days !== null
          ? Math.round(ssl.expiry_days)
          : null;

      lines.push(`• SSL issuer: ${issuer}`);
      if (expiryDays !== null) {
        lines.push(`• SSL expiry: ~${expiryDays} days remaining.`);
      }
      if (ssl.subject && (ssl.subject as any)["CN"]) {
        lines.push(`• Subject CN: ${(ssl.subject as any)["CN"]}`);
      }
      if (ssl.altnames && ssl.altnames.length) {
        lines.push(`• SANs: ${ssl.altnames.join(", ")}`);
      }
    } else {
      lines.push("• No valid SSL certificate detected.");
    }

    if (details.HSTS) {
      lines.push(`• HSTS: ${details.HSTS}`);
    } else {
      lines.push("• HSTS: not enabled or not detected.");
    }

    return lines;
  };

  const renderDnsDetails = (details: SecurityCheckDetails) => {
    const lines: string[] = [];
    const inputDomain = details.input_domain || "";

    if (details.DNSSEC) {
      const status = details.DNSSEC.status || "Enabled";
      lines.push(`• DNSSEC: ${status}`);
      if (details.DNSSEC.applies_to) {
        lines.push(`  DNSSEC enabled for: ${details.DNSSEC.applies_to}`);
      }
      if (details.DNSSEC.fallback_used) {
        lines.push(
          `  No DNSSEC data found directly for ${inputDomain}; using DNSSEC chain from ${details.DNSSEC.applies_to}.`,
        );
      }
      if (Array.isArray(details.DNSSEC.ds) && details.DNSSEC.ds.length) {
        lines.push(
          `  DS records seen from ${details.DNSSEC.ds.length} resolver(s).`,
        );
      }
      if (Array.isArray(details.DNSSEC.dnskey) && details.DNSSEC.dnskey.length) {
        lines.push(
          `  DNSKEY records seen from ${details.DNSSEC.dnskey.length} resolver(s).`,
        );
      }
    } else {
      lines.push("• DNSSEC: Not detected from the tested resolvers.");
    }

    if (details.CAA) {
      const caaText =
        details.CAA.value || "Present (restricts certificate authorities).";
      lines.push(`• CAA: ${caaText}`);
      if (details.CAA.found_on) {
        lines.push(`  Record location: ${details.CAA.found_on}`);
      }
      if (details.CAA.fallback_used) {
        lines.push(
          `  No CAA on ${inputDomain}; using CAA from ${details.CAA.found_on}.`,
        );
      }
    } else {
      lines.push("• CAA: no CAA records detected.");
    }

    if (details.MTA_STS) {
      const mtaText = details.MTA_STS.value || "Present";
      lines.push(`• MTA-STS: ${mtaText}`);
      if (details.MTA_STS.found_on) {
        lines.push(`  Record location: ${details.MTA_STS.found_on}`);
      }
      if (details.MTA_STS.fallback_used) {
        lines.push(
          `  No MTA-STS on ${inputDomain}; using MTA-STS from ${details.MTA_STS.found_on}.`,
        );
      }
    } else {
      lines.push("• MTA-STS: not configured.");
    }

    if (details.TLS_RPT) {
      const tlsText = details.TLS_RPT.value || "Present";
      lines.push(`• TLS-RPT: ${tlsText}`);
      if (details.TLS_RPT.found_on) {
        lines.push(`  Record location: ${details.TLS_RPT.found_on}`);
      }
      if (details.TLS_RPT.fallback_used) {
        lines.push(
          `  No TLS-RPT on ${inputDomain}; using TLS-RPT from ${details.TLS_RPT.found_on}.`,
        );
      }
    } else {
      lines.push("• TLS-RPT: not configured.");
    }

    return lines;
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
              Enter the primary domain or subdomain you want to audit, without protocol (no
              https://).
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>DKIM Selector (optional)</Text>
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
              Leave empty to auto-detect with common selectors (default, google, selector1,
              mail, s1, s2). Use this if your provider uses a custom selector.
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
                  result.level === "High"
                    ? styles.statusSuccess
                    : result.level === "Low"
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
                    <Text style={styles.badgeText}>Fix as soon as possible</Text>
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
                    <Text style={styles.listItem}>No critical issues detected.</Text>
                  )}
                </View>
              </View>

              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <Text style={styles.resultCardTitle}>Best Practice Warnings</Text>
                  <View style={[styles.badge, styles.badgeWarning]}>
                    <Text style={styles.badgeText}>Improvements recommended</Text>
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
                      {renderEmailDetails(result.details).map((line, index) => (
                        <Text key={index} style={styles.listItem}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View style={styles.resultCard}>
                    <View style={styles.resultCardHeader}>
                      <Text style={styles.resultCardTitle}>SSL / HTTPS Details</Text>
                    </View>
                    <View style={styles.resultContent}>
                      {renderSslDetails(result.details).map((line, index) => (
                        <Text key={index} style={styles.listItem}>
                          {line}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View style={styles.resultCard}>
                    <View style={styles.resultCardHeader}>
                      <Text style={styles.resultCardTitle}>
                        DNS & Transport Security Details
                      </Text>
                    </View>
                    <View style={styles.resultContent}>
                      {renderDnsDetails(result.details).map((line, index) => (
                        <Text key={index} style={styles.listItem}>
                          {line}
                        </Text>
                      ))}
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
  hint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
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
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600" as const,
    color: Colors.text,
  },
  summaryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
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
  resultCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
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
    fontWeight: "600" as const,
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
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
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