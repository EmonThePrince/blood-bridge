import { BackHandler } from 'react-native';
// Polyfill for older React Native versions, though typically not needed in newer ones.
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = () => {};
}

import React from 'react';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { TouchableOpacity, Text as RNText, StyleSheet, View, Alert } from 'react-native';

// Import your screens
import HomeScreen from './screens/HomeScreen';
import DonorRegistration from './screens/DonorRegistration';
import BloodRequest from './screens/BloodRequest';
import DonorDashboard from './screens/DonorDashboard';
import RecipientDashboard from './screens/RecipientDashboard';
import DonorProfile from './screens/DonorProfile';
import DonorLoginScreen from './screens/DonorLoginScreen';

// Import the Context Provider and Hook
import { DonorAuthProvider, useDonorAuth } from './context/DonorAuthContext';

const nbConfig = {
  strictMode: 'off',
};

const theme = extendTheme({
  colors: {
    primary: {
      50: '#fdecea', 100: '#f9c5c0', 200: '#f59c98', 300: '#f1746f',
      400: '#ee4b47', 500: '#bb3a3a', 600: '#8a2929', 700: '#591818',
      800: '#290909', 900: '#000000',
    },
    secondary: {
      50: '#e0f2f1', 100: '#b2dfdb', 200: '#80cbc4', 300: '#4db6ac',
      400: '#26a69a', 500: '#009688', 600: '#00897b', 700: '#00796b',
      800: '#00695c', 900: '#004d40',
    }
  },
});

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content component with fixed navigation calls
function CustomDrawerContent(props) {
  const { currentDonor, logout } = useDonorAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            logout();
            props.navigation.closeDrawer();
            // Navigate to nested Home screen inside HomeDrawer
            props.navigation.navigate('HomeDrawer', { screen: 'Home' });
          }
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      {currentDonor && (
        <View style={drawerStyles.loggedInContainer}>
          <RNText style={drawerStyles.profileName}>
            Hello, {currentDonor.name}!
          </RNText>
          <TouchableOpacity
            style={drawerStyles.drawerButton}
            onPress={() => {
              // Navigate to Donor Profile inside nested stack
              props.navigation.navigate('HomeDrawer', { screen: 'Donor Profile' });
              props.navigation.closeDrawer();
            }}
          >
            <RNText style={drawerStyles.drawerButtonText}>My Profile</RNText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.drawerButton, drawerStyles.logoutButton]}
            onPress={handleLogout}
          >
            <RNText style={drawerStyles.drawerButtonText}>Logout</RNText>
          </TouchableOpacity>
        </View>
      )}

      {!currentDonor && (
        <View style={drawerStyles.loggedOutContainer}>
          <TouchableOpacity
            style={drawerStyles.drawerButton}
            onPress={() => {
              // Navigate to Donor Login inside nested stack
              props.navigation.navigate('HomeDrawer', { screen: 'Donor Login' });
              props.navigation.closeDrawer();
            }}
          >
            <RNText style={drawerStyles.drawerButtonText}>Donor Login</RNText>
          </TouchableOpacity>
        </View>
      )}
    </DrawerContentScrollView>
  );
}

// Styles for the drawer (unchanged)
const drawerStyles = StyleSheet.create({
  loggedInContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  drawerButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drawerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#6B7280',
  },
  loggedOutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
    alignItems: 'center',
  }
});

// Wrapper component to set header title dynamically for Donor Profile screen
function DonorProfileScreenWrapper(props) {
  const { currentDonor } = useDonorAuth();

  React.useLayoutEffect(() => {
    props.navigation.setOptions({
      title: currentDonor?.name || 'Donor Profile',
    });
  }, [props.navigation, currentDonor]);

  return <DonorProfile {...props} />;
}

// Main App component
export default function App() {
  return (
    <DonorAuthProvider>
      <NativeBaseProvider theme={theme} config={nbConfig}>
        <NavigationContainer>
          <Drawer.Navigator
            drawerContent={props => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: true,
              headerStyle: {
                backgroundColor: '#b71c1c',
              },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              headerTitleAlign: 'center',
            }}
          >
            <Drawer.Screen name="HomeDrawer" options={{ headerShown: false }}>
              {() => (
                <Stack.Navigator
                  initialRouteName="Home"
                  screenOptions={({ navigation, route }) => ({
                    headerStyle: {
                      backgroundColor: route.name === 'Recipient Dashboard' ? '#059669' : '#b71c1c',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerTitleAlign: 'center',
                    headerRight: () => {
                      if (route.name === 'Donor Login') {
                        return null;
                      }
                      return (
                        <TouchableOpacity
                          onPress={() => navigation.toggleDrawer()}
                          style={{ marginRight: 15 }}
                        >
                          <RNText style={{ color: 'white', fontSize: 24 }}>☰</RNText>
                        </TouchableOpacity>
                      );
                    },
                  })}
                >
                  {/* Stack Screens */}
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Donor Registration" component={DonorRegistration} />
                  <Stack.Screen name="Blood Request" component={BloodRequest} />
                  <Stack.Screen name="Donor Dashboard" component={DonorDashboard} />
                  <Stack.Screen name="Recipient Dashboard" component={RecipientDashboard} />
                  <Stack.Screen
                    name="Donor Login"
                    component={DonorLoginScreen}
                    options={{
                      title: 'Donor Login',
                      headerLeft: () => null,
                    }}
                  />
                  <Stack.Screen
                    name="Donor Profile"
                    component={DonorProfileScreenWrapper}
                  />
                </Stack.Navigator>
              )}
            </Drawer.Screen>
          </Drawer.Navigator>
        </NavigationContainer>
      </NativeBaseProvider>
    </DonorAuthProvider>
  );
}
