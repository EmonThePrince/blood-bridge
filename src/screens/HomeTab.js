import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

export default function HomeTab({ navigation }) {
  const [stats, setStats] = useState({
    totalDonations: '...',
    totalDonors: '...',
    totalRequests: '...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/requests/stats/`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalDonations: data.totalDonations.toString(),
          totalDonors: data.totalDonors.toString(),
          totalRequests: data.totalRequests.toString(),
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { icon: '🩸', label: 'Lives Saved', value: stats.totalDonations, color: '#DC2626' },
    { icon: '👥', label: 'Donors', value: stats.totalDonors, color: '#059669' },
    { icon: '📋', label: 'Requests', value: stats.totalRequests, color: '#1E40AF' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#DC2626', '#B91C1C']}
        style={styles.hero}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/splash-icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.heroTitle}>BloodBridge</Text>
        <Text style={styles.heroSubtitle}>
          Connecting donors with those in need
        </Text>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#DC2626" />
        ) : (
          statsData.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#1E40AF' }]}
          onPress={() => navigation.navigate('Request')}
        >
          <Text style={styles.actionIcon}>🩸</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Request Blood</Text>
            <Text style={styles.actionDescription}>
              Find donors near you quickly
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#059669' }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.actionIcon}>🔍</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Find Donors</Text>
            <Text style={styles.actionDescription}>
              Search available donors by blood type
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#DC2626' }]}
          onPress={() => navigation.navigate('Donate')}
        >
          <Text style={styles.actionIcon}>❤️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Donate Blood</Text>
            <Text style={styles.actionDescription}>
              See who needs your help today
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Donate?</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💝</Text>
          <Text style={styles.infoText}>
            One donation can save up to 3 lives
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔄</Text>
          <Text style={styles.infoText}>
            Donate every 56 days to help more people
          </Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🏥</Text>
          <Text style={styles.infoText}>
            Blood is always needed in emergencies
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  hero: {
    padding: 30,
    paddingTop: 40,
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    opacity: 0.95,
  },
  heroDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.85,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -30,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  actionArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});
