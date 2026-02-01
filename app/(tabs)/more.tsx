import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DollarSign,
  FileText,
  Globe,
  ExternalLink,
  Code,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

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
      alert('Failed to open URL');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>
            Access pricing, documentation, and learn more about Check My DNS
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL('https://checkmydns.online/pricing')}
          >
            <View style={styles.menuIcon}>
              <DollarSign size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Pricing</Text>
              <Text style={styles.menuDescription}>
                View pricing plans and features
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL('https://docs.codeforgex.studio/checkmydns/overview')}
          >
            <View style={styles.menuIcon}>
              <FileText size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Documentation</Text>
              <Text style={styles.menuDescription}>
                API documentation and integration guides
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openURL('https://checkmydns.online')}
          >
            <View style={styles.menuIcon}>
              <Globe size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Visit Website</Text>
              <Text style={styles.menuDescription}>
                Go to checkmydns.online
              </Text>
            </View>
            <ExternalLink size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.aboutCard}>
            <View style={styles.logoContainer}>
              <Code size={48} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>Check My DNS</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Professional DNS lookup and email security validation tool. Check DNS
              records globally, validate email configuration, run comprehensive security
              audits, and monitor blacklist status.
            </Text>
          </View>

          <View style={styles.brandCard}>
            <View style={styles.brandHeader}>
              <Code size={32} color={Colors.primary} />
              <Text style={styles.brandTitle}>CodeForgeX Studio</Text>
            </View>
            <Text style={styles.brandDescription}>
              Check My DNS is owned and powered by CodeForgeX Studio
            </Text>
            <TouchableOpacity
              style={styles.brandButton}
              onPress={() => openURL('https://codeforgex.studio')}
            >
              <Text style={styles.brandButtonText}>Visit CodeForgeX Studio</Text>
              <ExternalLink size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} CodeForgeX Studio</Text>
          <Text style={styles.footerText}>All rights reserved</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  aboutCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  brandCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  brandDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  brandButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
});