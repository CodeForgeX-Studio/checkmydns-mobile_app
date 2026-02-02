import { Tabs } from "expo-router";
import {
  Globe,
  Mail,
  Shield,
  SlidersHorizontal,
  AlertCircle,
  Info,
  X,
} from "lucide-react-native";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/colors";

const tools = [
  { key: "security", label: "Security Checker", icon: Shield },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const [toolsVisible, setToolsVisible] = useState(false);

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
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          if (route.name === "app-info" || route.name === "security") return null;
          const label = options.title ?? route.name;
          const isFocused = state.index === index;
          const onPress = () => {
            navigation.navigate(route.name as never);
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{ flex: 1, padding: 8, alignItems: "center" }}
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
          style={{ flex: 1, padding: 8, alignItems: "center" }}
        >
          <SlidersHorizontal color={Colors.textMuted} size={24} />
          <Text style={{ color: Colors.textMuted, fontSize: 12 }}>
            More
          </Text>
        </TouchableOpacity>

        {state.routes.map((route) => {
          if (route.name === "app-info") {
            const { options } = descriptors[route.key];
            const index = state.routes.findIndex((r) => r.name === "app-info");
            const isFocused = state.index === index;
            const onPress = () => {
              navigation.navigate(route.name as never);
            };
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={{ flex: 1, padding: 8, alignItems: "center" }}
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
              paddingBottom: 16,
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
              showsVerticalScrollIndicator
              renderItem={({ item }) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    onPress={() => handleToolPress(item.key)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
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

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.cardBg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
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
        name="app-info"
        options={{
          title: "About",
          tabBarIcon: ({ color }) => <Info size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="Security"
        options={{
          href: null,
          title: "Security",
        }}
      />
    </Tabs>
  );
}