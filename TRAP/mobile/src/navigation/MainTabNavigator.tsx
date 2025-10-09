import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import GroupsScreen from '../screens/GroupsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Camera modal
import CameraModal from '../components/CameraModal';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const [cameraVisible, setCameraVisible] = useState(false);

  const handleCameraPress = () => {
    setCameraVisible(true);
  };

  const handleCloseCamera = () => {
    setCameraVisible(false);
  };

  const handleDrinkPosted = () => {
    setCameraVisible(false);
    // Optionally refresh the feed here
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#999',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Groups') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Camera') {
              iconName = 'add-circle';
              size = 56; // Bigger center button
            } else if (route.name === 'Discover') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Groups" component={GroupsScreen} />
        <Tab.Screen
          name="Camera"
          component={HomeScreen} // Placeholder - will handle camera separately
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleCameraPress();
            },
          }}
          options={{
            tabBarIcon: ({ color }) => (
              <View style={styles.cameraButtonContainer}>
                <View style={styles.cameraButton}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <CameraModal
        visible={cameraVisible}
        onClose={handleCloseCamera}
        onDrinkPosted={handleDrinkPosted}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#dbdbdb',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  cameraButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
