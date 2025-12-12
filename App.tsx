import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import FestivalsScreen from './src/screens/FestivalsScreen';
import FestivalDetailsScreen from './src/screens/FestivalDetailsScreen';
import MyTicketsScreen from './src/screens/MyTicketsScreen';
import TicketDetailScreen from './src/screens/TicketDetailScreen';
import AdminScreen from './src/screens/AdminScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/constants/colors';
import CustomTabBar from './src/components/CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Disable RTL to center content
I18nManager.forceRTL(false);
I18nManager.allowRTL(false);

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Festivals"
        component={FestivalsScreen}
        options={{
          tabBarLabel: 'المهرجانات',
        }}
      />
      <Tab.Screen
        name="MyTickets"
        component={MyTicketsScreen}
        options={{
          tabBarLabel: 'تذاكري',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLargeTitle: false,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'إنشاء حساب' }}
            />
          </>
        ) : (user.isAdmin === true || user.email === 'shrfa@gmail.com') ? (
          <>
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FestivalDetails"
              component={FestivalDetailsScreen}
              options={{ title: 'تفاصيل المهرجان' }}
            />
            <Stack.Screen
              name="TicketDetail"
              component={TicketDetailScreen}
              options={{ title: 'تفاصيل التذكرة' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
