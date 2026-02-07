import { Tabs } from "expo-router";
import {
  Globe,
  Mail,
  Shield,
  SlidersHorizontal,
  AlertCircle,
  Info,
  X,
  WifiOff,
} from "lucide-react-native";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Network from "expo-network";
import Colors from "@/constants/colors";

const tools = [
  { key: "security", label: "Security Checker", icon: Shield },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const [toolsVisible, setToolsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const handleToolPress = (toolKey: string) => {
    setToolsVisible(false);
    navigation.navigate(toolKey as never);
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: Colors.cardBg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          if (route.name === "about" || route.name === "security") return null;
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const onPress = () => {
            navigation.navigate(route.name as never);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{ flex: 1, alignItems: "center" }}
            >
              {options.tabBarIcon?.({
                color: isFocused ? Colors.primary : Colors.textMuted,
                size: 24,
              })}
              <Text
                style={{
                  color: isFocused ? Colors.primary : Colors.textMuted,
                  fontSize: 12,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => setToolsVisible(true)}
          style={{ flex: 1, alignItems: "center" }}
        >
          <SlidersHorizontal color={Colors.textMuted} size={24} />
          <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
            More
          </Text>
        </TouchableOpacity>

        {state.routes.map((route) => {
          if (route.name === "about") {
            const { options } = descriptors[route.key];
            const index = state.routes.findIndex((r) => r.name === "about");
            const isFocused = state.index === index;
            const onPress = () => {
              navigation.navigate(route.name as never);
            };
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={{ flex: 1, alignItems: "center" }}
              >
                {options.tabBarIcon?.({
                  color: isFocused ? Colors.primary : Colors.textMuted,
                  size: 24,
                })}
                <Text
                  style={{
                    color: isFocused ? Colors.primary : Colors.textMuted,
                    fontSize: 12,
                  }}
                >
                  About
                </Text>
              </TouchableOpacity>
            );
          }
          return null;
        })}
      </View>

      <Modal
        visible={toolsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setToolsVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={() => setToolsVisible(false)}
        >
          <Pressable
            style={{
              backgroundColor: Colors.cardBg,
              paddingTop: 12,
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 16,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "60%",
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 16,
                  fontWeight: "600",
                  color: Colors.text,
                }}
              >
                More
              </Text>
              <TouchableOpacity onPress={() => setToolsVisible(false)}>
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={tools}
              keyExtractor={(item) => item.key}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    onPress={() => handleToolPress(item.key)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                    }}
                  >
                    {Icon && (
                      <Icon
                        size={20}
                        color={Colors.textMuted}
                        style={{ marginRight: 10 }}
                      />
                    )}
                    <Text style={{ color: Colors.text, fontSize: 14 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function NetworkMonitor() {
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        const offline = !state.isConnected || state.isInternetReachable === false;
        setIsOffline(offline);
      } catch (error) {
        setIsOffline(true);
      }
    };

    checkConnection();

    const intervalId = setInterval(() => {
      checkConnection();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const state = await Network.getNetworkStateAsync();
      if (state.isConnected && state.isInternetReachable !== false) {
        setIsOffline(false);
      }
    } catch (error) {
      console.error("Network check failed:", error);
    } finally {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  return (
    <Modal
      visible={isOffline}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.85)",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.cardBg,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 340,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: Colors.primary + "20",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <WifiOff size={32} color={Colors.primary} />
          </View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: Colors.text,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            No Internet Connection
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: Colors.textMuted,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            Check My DNS needs an active internet connection to function. Please check your network settings and try again.
          </Text>

          <TouchableOpacity
            onPress={handleRetry}
            disabled={isRetrying}
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 8,
              width: "100%",
              alignItems: "center",
              opacity: isRetrying ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              {isRetrying ? "Checking..." : "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function TabLayout() {
  return (
    <>
      <NetworkMonitor />
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "DNS",
            tabBarIcon: ({ color }) => <Globe size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="email"
          options={{
            title: "Email",
            tabBarIcon: ({ color }) => <Mail size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="spam"
          options={{
            title: "Spam",
            tabBarIcon: ({ color }) => <AlertCircle size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: "About",
            tabBarIcon: ({ color }) => <Info size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="security"
          options={{
            href: null,
            title: "Security",
          }}
        />
      </Tabs>
    </>
  );
}