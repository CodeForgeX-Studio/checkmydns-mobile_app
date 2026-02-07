import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DollarSign,
  FileText,
  Globe,
  ExternalLink,
  Code,
} from "lucide-react-native";
import * as Device from "expo-device";
import Colors from "@/constants/colors";

type PendingLinkState = {
  url: string | null;
  domain: string | null;
};

const googlePlayReviewUrl = "";
const appStoreReviewUrl = "";

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const [trustedDomains, setTrustedDomains] = useState<string[]>([]);
  const [pendingLink, setPendingLink] = useState<PendingLinkState>({
    url: null,
    domain: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [trustDomainChecked, setTrustDomainChecked] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const extractDomain = (url: string): string | null => {
    try {
      const hostname = new URL(url).hostname;
      return hostname;
    } catch {
      return null;
    }
  };

  const isDomainTrusted = (domain: string | null): boolean => {
    if (!domain) return false;
    return trustedDomains.includes(domain);
  };

  const handleOpenLinkConfirmed = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Cannot open URL: ${url}`);
      }
    } catch {
      Alert.alert("Error", "Failed to open URL");
    }
  };

  const openURL = async (url: string) => {
    const domain = extractDomain(url);

    if (isDomainTrusted(domain)) {
      await handleOpenLinkConfirmed(url);
      return;
    }

    setPendingLink({ url, domain });
    setTrustDomainChecked(false);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setPendingLink({ url: null, domain: null });
    setTrustDomainChecked(false);
  };

  const handleConfirmOpen = async () => {
    if (!pendingLink.url) {
      handleCloseModal();
      return;
    }

    const urlToOpen = pendingLink.url;
    const domainToTrust = pendingLink.domain;

    if (trustDomainChecked && domainToTrust) {
      setTrustedDomains((prev) =>
        prev.includes(domainToTrust) ? prev : [...prev, domainToTrust]
      );
    }

    handleCloseModal();
    await handleOpenLinkConfirmed(urlToOpen);
  };

  const displayDomain = useMemo(() => {
    if (!pendingLink.domain) return "";
    return pendingLink.domain;
  }, [pendingLink.domain]);

  const handleLeaveReview = async () => {
    const osName = Device.osName;
    let url: string | null = null;

    if (osName === "iOS" || osName === "iPadOS") {
      url = appStoreReviewUrl || null;
    } else if (osName === "Android" || "google" || "xiaomi") {
      url = googlePlayReviewUrl || null;
    } else {
      url = null;
    }

    if (!url) {
      setReviewModalVisible(true);
      return;
    }

    await openURL(url);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>About Check My DNS</Text>
          <Text style={styles.subtitle}>
            Learn what this app does, where to find documentation, and who is behind it.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App overview</Text>

          <View style={styles.aboutCard}>
            <View style={styles.logoContainer}>
              <Code size={40} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>Check My DNS</Text>
            <Text style={styles.appVersion}>Version 1.0.1</Text>
            <Text style={styles.aboutDescription}>
              Check My DNS is a professional DNS lookup and email security validation tool.
              Use it to perform global DNS checks, validate email authentication, run
              comprehensive security audits, and monitor blacklist status for your domains
              and mail servers.
            </Text>

            <TouchableOpacity
              style={styles.reviewButton}
              onPress={handleLeaveReview}
              activeOpacity={0.8}
            >
              <Text style={styles.reviewButtonText}>Leave a review</Text>
              <ExternalLink size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL("https://checkmydns.online/pricing")}
          >
            <View style={styles.menuIcon}>
              <DollarSign size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Pricing</Text>
              <Text style={styles.menuDescription}>
                View available plans and included features.
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              openURL("https://docs.checkmydns.online")
            }
          >
            <View style={styles.menuIcon}>
              <FileText size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Documentation</Text>
              <Text style={styles.menuDescription}>
                API reference, integration examples, and usage guides.
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL("https://checkmydns.online")}
          >
            <View style={styles.menuIcon}>
              <Globe size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Web dashboard</Text>
              <Text style={styles.menuDescription}>
                Open the full web version at checkmydns.online.
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publisher</Text>

          <View style={styles.brandCard}>
            <View style={styles.brandHeader}>
              <Code size={28} color={Colors.primary} />
              <Text style={styles.brandTitle}>CodeForgeX Studio</Text>
            </View>
            <Text style={styles.brandDescription}>
              Check My DNS is built, owned, and maintained by CodeForgeX Studio, a
              developer-focused studio specialising in network tooling and security-oriented
              utilities.
            </Text>
            <TouchableOpacity
              style={styles.brandButton}
              onPress={() => openURL("https://codeforgex.studio")}
            >
              <Text style={styles.brandButtonText}>Visit CodeForgeX Studio</Text>
              <ExternalLink size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} CodeForgeX Studio
          </Text>
          <Text style={styles.footerText}>All rights reserved.</Text>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Open external link</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeIconButton}>
                <Text style={styles.closeIconText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMessage}>
              This will open the following link in your browser:
            </Text>
            <Text style={styles.modalUrl}>{pendingLink.url}</Text>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setTrustDomainChecked((prev) => !prev)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxBox,
                  trustDomainChecked && styles.checkboxBoxChecked,
                ]}
              >
                {trustDomainChecked && <Text style={styles.checkboxCheckmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                Trust links from {displayDomain || "this domain"} for this session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={handleConfirmOpen}
            >
              <Text style={styles.modalButtonPrimaryText}>Open link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReviewModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Reviews not available yet</Text>
              <TouchableOpacity onPress={closeReviewModal} style={styles.closeIconButton}>
                <Text style={styles.closeIconText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalMessage}>
              Reviews for this app are not available yet for your device platform.
            </Text>
            <Text style={styles.modalMessage}>
              Please try again later once Check My DNS is live on the official app store for your device.
            </Text>
          </View>
        </View>
      </Modal>
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
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  aboutCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "flex-start",
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  brandCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  brandDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  brandButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  brandButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  closeIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIconText: {
    fontSize: 22,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  modalMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalUrl: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 16,
  },
  modalButtonPrimary: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600" as const,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: Colors.cardBg,
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxCheckmark: {
    color: "#fff",
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    alignSelf: "stretch",
    marginTop: 8,
  },
  reviewButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  reviewNote: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});