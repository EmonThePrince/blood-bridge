import React from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Import screens
import HomeTab from './src/screens/HomeTab';
import RequestTab from './src/screens/RequestTab';
import SearchTab from './src/screens/SearchTab';
import DonateTab from './src/screens/DonateTab';
import ProfileTab from './src/screens/ProfileTab';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Request"
        component={RequestTab}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🩸</Text>,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchTab}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="Donate"
        component={DonateTab}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>❤️</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const authContext = React.useContext(AuthContext);
  
  if (!authContext) {
    return null;
  }

  const { loading } = authContext;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  // Always show the main app - login is optional for donors only
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
