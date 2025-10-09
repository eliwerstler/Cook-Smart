import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{user?.username}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.lifetimeDrinks || 0}</Text>
              <Text style={styles.statLabel}>Drinks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.totalStandards.toFixed(1) || 0}
              </Text>
              <Text style={styles.statLabel}>Standards</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.peakBph.toFixed(1) || 0}
              </Text>
              <Text style={styles.statLabel}>Peak BPH</Text>
            </View>
          </View>

          <Text style={styles.bio}>{user?.bio || 'No bio yet'}</Text>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifetime Statistics</Text>

          <View style={styles.statisticCard}>
            <View style={styles.statisticRow}>
              <Text style={styles.statisticLabel}>Total Standards</Text>
              <Text style={styles.statisticValue}>
                {user?.totalStandards.toFixed(1) || 0}
              </Text>
            </View>

            <View style={styles.statisticRow}>
              <Text style={styles.statisticLabel}>Average BPH</Text>
              <Text style={styles.statisticValue}>
                {user?.avgBph.toFixed(1) || 0}
              </Text>
            </View>

            <View style={styles.statisticRow}>
              <Text style={styles.statisticLabel}>Peak BPH</Text>
              <Text style={styles.statisticValue}>
                {user?.peakBph.toFixed(1) || 0}
              </Text>
            </View>

            <View style={styles.statisticRow}>
              <Text style={styles.statisticLabel}>Lifetime Drinks</Text>
              <Text style={styles.statisticValue}>
                {user?.lifetimeDrinks || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Sessions Grid Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Sessions</Text>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>📅</Text>
            <Text style={styles.placeholderTitle}>No sessions yet</Text>
            <Text style={styles.placeholderSubtitle}>
              Start drinking to create your first session!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0095f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statisticCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
  },
  statisticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statisticLabel: {
    fontSize: 16,
    color: '#333',
  },
  statisticValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
