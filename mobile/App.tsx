import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";

import LoginScreen from "@/features/auth/LoginScreen";

import HomeScreen from "@/features/home/HomeScreen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Stack = createNativeStackNavigator();

function RootNavigation() {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0070f3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack user={user} />
    </NavigationContainer>
  );
}

// Main stack with conditional screens based on auth state
function RootStack({ user }) {
  return (
    <Stack.Navigator>
      {user
        ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )
        : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
    </Stack.Navigator>
  );
}
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </QueryClientProvider>
  );
}
