import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Page not found",
          headerStyle: { backgroundColor: Colors.cardBg },
          headerTintColor: Colors.text,
        }}
      />
      <View style={styles.container}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>This page could not be found</Text>
        <Text style={styles.subtitle}>
          The screen you are looking for does not exist or is no longer available.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return to home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: Colors.dark,
  },
  code: {
    fontSize: 48,
    fontWeight: "800" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  link: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  linkText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600" as const,
  },
});