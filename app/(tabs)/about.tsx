import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DollarSign,
  FileText,
  Globe,
  ExternalLink,
  Code,
} from "lucide-react-native";
import Colors from "@/constants/colors";

export default function MoreScreen() {
  const insets = useSafeAreaInsets();

  const openURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert(`Cannot open URL: ${url}`);
      }
    } catch {
      alert("Failed to open URL");
    }
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
              openURL("https://docs.codeforgex.studio/checkmydns/overview")
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
              developer‑focused studio specialising in network tooling and security‑oriented
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
    marginBottom: 12,
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
    marginBottom: 10,
  },
  aboutDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
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
});