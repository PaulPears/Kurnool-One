import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import DirectoryScreen from '../screens/DirectoryScreen';
import ExploreScreen from '../screens/ExploreScreen';
import OffersScreen from '../screens/OffersScreen';
import ProfileScreen from '../screens/ProfileScreen';

import BusinessDetailScreen from '../screens/BusinessDetailScreen';
import ProfessionalDetailScreen from '../screens/ProfessionalDetailScreen';
import RegisterBusinessScreen from '../screens/RegisterBusinessScreen';
import SearchScreen from '../screens/SearchScreen';
import MobileFirebaseLogin from '../screens/MobileFirebaseLogin';
import EditProfileScreen from '../screens/EditProfileScreen';
import AdminBannerScreen from '../screens/AdminBannerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import VerticalImageViewer from '../screens/VerticalImageViewer';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Directory') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Offers') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Directory" component={DirectoryScreen} options={{ tabBarLabel: 'Directory' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ tabBarLabel: 'Explore' }} />
      <Tab.Screen name="Offers" component={OffersScreen} options={{ tabBarLabel: 'Offers' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MobileFirebaseLogin">
        <Stack.Screen name="MobileFirebaseLogin" component={MobileFirebaseLogin} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
        <Stack.Screen name="ProfessionalDetail" component={ProfessionalDetailScreen} />
        <Stack.Screen name="RegisterBusiness" component={RegisterBusinessScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="UserProfile" component={ProfileScreen} />
        <Stack.Screen name="VerticalImageViewer" component={VerticalImageViewer} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="AdminBanners" component={AdminBannerScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
