import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity, Modal, TextInput, Alert, Linking } from 'react-native';

const dummyDonors = [
  {
    id: '1',
    name: 'Ali Rahman',
    bloodGroup: 'A+',
    location: 'Dhanmondi, Dhaka',
    contact: '01710000001',
    lastDonated: '2024-05-10',
    age: 28,
    availability: 'Available',
    donationCount: 12,
    verified: true,
    emergencyContact: '01810000001',
    medicalHistory: 'No major health issues. Regular donor with consistent health checkups.',
    preferredTime: 'Morning (9 AM - 12 PM)',
    notes: 'Available for emergency donations. Prefer to donate at Dhaka Medical College Hospital.',
    registeredSince: '2022-01-15',
    weight: '70 kg',
    bloodPressure: '120/80',
    lastCheckup: '2024-11-15'
  },
  {
    id: '2',
    name: 'Tania Khatun',
    bloodGroup: 'B+',
    location: 'Sonadanga, Khulna',
    contact: '01710000002',
    lastDonated: '2024-06-01',
    age: 32,
    availability: 'Available',
    donationCount: 8,
    verified: true,
    emergencyContact: '01820000002',
    medicalHistory: 'Healthy donor. No allergies or major medical conditions.',
    preferredTime: 'Evening (2 PM - 6 PM)',
    notes: 'Works as a teacher. Available after school hours and on weekends.',
    registeredSince: '2023-03-22',
    weight: '58 kg',
    bloodPressure: '115/75',
    lastCheckup: '2024-10-20'
  },
  {
    id: '3',
    name: 'Mitu Ahmed',
    bloodGroup: 'O-',
    location: 'Shaheb Bazar, Rajshahi',
    contact: '01710000003',
    lastDonated: '2024-04-25',
    age: 25,
    availability: 'Busy until Jan 5',
    donationCount: 15,
    verified: true,
    emergencyContact: '01830000003',
    medicalHistory: 'Universal donor. Excellent health record with regular donations.',
    preferredTime: 'Flexible',
    notes: 'University student. Can donate during emergencies even when busy.',
    registeredSince: '2021-08-10',
    weight: '65 kg',
    bloodPressure: '118/78',
    lastCheckup: '2024-12-01'
  },
  {
    id: '4',
    name: 'Rafiq Hasan',
    bloodGroup: 'AB+',
    location: 'Wari, Dhaka',
    contact: '01710000004',
    lastDonated: '2024-03-15',
    age: 35,
    availability: 'Available',
    donationCount: 20,
    verified: true,
    emergencyContact: '01840000004',
    medicalHistory: 'Experienced donor with excellent health profile.',
    preferredTime: 'Weekend',
    notes: 'Business owner. Prefers weekend donations but available for emergencies.',
    registeredSince: '2020-05-18',
    weight: '75 kg',
    bloodPressure: '122/82',
    lastCheckup: '2024-11-30'
  },
  {
    id: '5',
    name: 'Fatima Begum',
    bloodGroup: 'A-',
    location: 'Agrabad, Chittagong',
    contact: '01710000005',
    lastDonated: '2024-07-20',
    age: 29,
    availability: 'Available',
    donationCount: 6,
    verified: true,
    emergencyContact: '01850000005',
    medicalHistory: 'New regular donor. Clean health record.',
    preferredTime: 'Morning (10 AM - 1 PM)',
    notes: 'Nurse at Chittagong Medical College. Understands urgency of blood donations.',
    registeredSince: '2023-12-05',
    weight: '62 kg',
    bloodPressure: '110/70',
    lastCheckup: '2024-12-10'
  }
];

export default function RecipientDashboard() {
  const [bloodGroupInput, setBloodGroupInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [filteredDonors, setFilteredDonors] = useState(dummyDonors);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filterByBloodGroup = () => {
    if (!bloodGroupInput.trim()) {
      Alert.alert('Error', 'Please enter a blood group');
      return;
    }
    const filtered = dummyDonors.filter(donor =>
      donor.bloodGroup.toLowerCase() === bloodGroupInput.trim().toLowerCase()
    );
    setFilteredDonors(filtered);
    setActiveFilter('bloodGroup');
  };

  const filterByLocation = () => {
    if (!locationInput.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    const filtered = dummyDonors.filter(donor =>
      donor.location.toLowerCase().includes(locationInput.trim().toLowerCase())
    );
    setFilteredDonors(filtered);
    setActiveFilter('location');
  };

  const filterByBoth = () => {
    if (!bloodGroupInput.trim() || !locationInput.trim()) {
      Alert.alert('Error', 'Please enter both blood group and location');
      return;
    }
    const filtered = dummyDonors.filter(donor =>
      donor.bloodGroup.toLowerCase() === bloodGroupInput.trim().toLowerCase() &&
      donor.location.toLowerCase().includes(locationInput.trim().toLowerCase())
    );
    setFilteredDonors(filtered);
    setActiveFilter('both');
  };

  const resetFilters = () => {
    setFilteredDonors(dummyDonors);
    setBloodGroupInput('');
    setLocationInput('');
    setActiveFilter('all');
  };

  const openProfile = (donor) => {
    setSelectedDonor(donor);
    setModalVisible(true);
  };

  const handleCall = (contact) => {
    Linking.openURL(`tel:${contact}`);
  };

  const handleSMS = (contact) => {
    Linking.openURL(`sms:${contact}`);
  };

  const getAvailabilityColor = (availability) => {
    return availability === 'Available' ? '#10B981' : '#F59E0B';
  };

  const getAvailabilityBg = (availability) => {
    return availability === 'Available' ? '#F0FDF4' : '#FFFBEB';
  };

  const renderDonorCard = (donor) => (
    <TouchableOpacity
      key={donor.id}
      style={[
        styles.donorCard,
        { backgroundColor: getAvailabilityBg(donor.availability) }
      ]}
      onPress={() => openProfile(donor)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.donorInfo}>
          <View style={styles.nameContainer}>
            <RNText style={styles.donorName}>{donor.name}</RNText>
            {donor.verified && (
              <RNText style={styles.verifiedBadge}>✓</RNText>
            )}
          </View>
          <View style={[
            styles.availabilityBadge,
            { backgroundColor: getAvailabilityColor(donor.availability) }
          ]}>
            <RNText style={styles.availabilityText}>{donor.availability}</RNText>
          </View>
        </View>
        <View style={styles.bloodGroupContainer}>
          <RNText style={styles.bloodGroupText}>{donor.bloodGroup}</RNText>
        </View>
      </View>

      <View style={styles.donorDetails}>
        <View style={styles.detailRow}>
          <RNText style={styles.emoji}>📍</RNText>
          <RNText style={styles.detailText} numberOfLines={1}>{donor.location}</RNText>
        </View>
        <View style={styles.detailRow}>
          <RNText style={styles.emoji}>🩸</RNText>
          <RNText style={styles.detailText}>{donor.donationCount} donations</RNText>
        </View>
        <View style={styles.detailRow}>
          <RNText style={styles.emoji}>📅</RNText>
          <RNText style={styles.detailText}>Last: {donor.lastDonated}</RNText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <RNText style={styles.tapText}>👆 Tap for full profile</RNText>
        <RNText style={styles.ageText}>{donor.age} years old</RNText>
      </View>
    </TouchableOpacity>
  );

  const renderBloodGroupButton = (group) => (
    <TouchableOpacity
      key={group}
      style={[
        styles.bloodGroupButton,
        bloodGroupInput === group && styles.selectedBloodGroupButton
      ]}
      onPress={() => setBloodGroupInput(group)}
    >
      <RNText style={[
        styles.bloodGroupButtonText,
        bloodGroupInput === group && styles.selectedBloodGroupButtonText
      ]}>
        {group}
      </RNText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centerContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <RNText style={styles.headerIcon}>🔍</RNText>
            </View>
            <RNText style={styles.mainTitle}>Find Blood Donors</RNText>
            <RNText style={styles.subtitle}>
              Connect with verified donors in your area
            </RNText>
          </View>

          {/* Search Section */}
          <View style={styles.searchCard}>
            <RNText style={styles.searchTitle}>🩸 Search Filters</RNText>

            {/* Blood Group Selection */}
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <RNText style={styles.filterLabel}>Blood Group Needed</RNText>
              </View>
              <View style={styles.bloodGroupGrid}>
                {bloodGroups.map(group => renderBloodGroupButton(group))}
              </View>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={filterByBloodGroup}
              >
                <RNText style={styles.searchEmoji}>🩸</RNText>
                <RNText style={styles.searchButtonText}>Search by Blood Group</RNText>
              </TouchableOpacity>
            </View>

            {/* Location Search */}
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <RNText style={styles.filterLabel}>📍 Location</RNText>
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter city or area (e.g. Dhaka, Chittagong)"
                value={locationInput}
                onChangeText={setLocationInput}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.searchButton, styles.locationButton]}
                onPress={filterByLocation}
              >
                <RNText style={styles.searchEmoji}>📍</RNText>
                <RNText style={styles.searchButtonText}>Search by Location</RNText>
              </TouchableOpacity>
            </View>

            {/* Combined Search */}
            <View style={styles.combinedSearchSection}>
              <TouchableOpacity
                style={styles.combinedButton}
                onPress={filterByBoth}
              >
                <RNText style={styles.combinedEmoji}>🎯</RNText>
                <RNText style={styles.combinedButtonText}>Search by Both</RNText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <RNText style={styles.resetEmoji}>🔄</RNText>
                <RNText style={styles.resetButtonText}>Reset Filters</RNText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Results Section */}
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <RNText style={styles.resultsTitle}>
                {activeFilter === 'all' ? '👥 All Donors' : '🎯 Search Results'}
              </RNText>
              <RNText style={styles.resultsCount}>
                {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
              </RNText>
            </View>

            <View style={styles.donorsList}>
              {filteredDonors.length > 0 ? (
                filteredDonors.map(donor => renderDonorCard(donor))
              ) : (
                <View style={styles.noResultsContainer}>
                  <RNText style={styles.noResultsEmoji}>😔</RNText>
                  <RNText style={styles.noResultsText}>No donors found</RNText>
                  <RNText style={styles.noResultsSubtext}>
                    Try adjusting your search criteria
                  </RNText>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <RNText style={styles.footerText}>
              All donors are verified and willing to help 💝
            </RNText>
          </View>
        </View>
      </ScrollView>

      {/* Donor Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDonor && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <RNText style={styles.modalTitle}>Donor Profile</RNText>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <RNText style={styles.closeButtonText}>✕</RNText>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.profileHeader}>
                      <View style={styles.profileInfo}>
                        <RNText style={styles.profileName}>{selectedDonor.name}</RNText>
                        {selectedDonor.verified && (
                          <View style={styles.verifiedContainer}>
                            <RNText style={styles.verifiedIcon}>✓</RNText>
                            <RNText style={styles.verifiedText}>Verified Donor</RNText>
                          </View>
                        )}
                      </View>
                      <View style={styles.profileBloodGroup}>
                        <RNText style={styles.profileBloodGroupText}>{selectedDonor.bloodGroup}</RNText>
                      </View>
                    </View>
                  </View>

                  {/* Availability Status */}
                  <View style={styles.availabilitySection}>
                    <View style={[
                      styles.availabilityCard,
                      { backgroundColor: getAvailabilityBg(selectedDonor.availability) }
                    ]}>
                      <RNText style={styles.availabilityEmoji}>
                        {selectedDonor.availability === 'Available' ? '✅' : '⏳'}
                      </RNText>
                      <RNText style={[
                        styles.availabilityStatus,
                        { color: getAvailabilityColor(selectedDonor.availability) }
                      ]}>
                        {selectedDonor.availability}
                      </RNText>
                    </View>
                  </View>

                  {/* Personal Information */}
                  <View style={styles.detailSection}>
                    <RNText style={styles.sectionTitle}>👤 Personal Information</RNText>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Age</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.age} years</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Weight</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.weight}</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Location</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.location}</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Member Since</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.registeredSince}</RNText>
                      </View>
                    </View>
                  </View>

                  {/* Donation History */}
                  <View style={styles.detailSection}>
                    <RNText style={styles.sectionTitle}>🩸 Donation History</RNText>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Total Donations</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.donationCount} times</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Last Donated</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.lastDonated}</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Preferred Time</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.preferredTime}</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Last Checkup</RNText>
                        <RNText style={styles.detailValue}>{selectedDonor.lastCheckup}</RNText>
                      </View>
                    </View>
                  </View>

                  {/* Health Information */}
                  <View style={styles.detailSection}>
                    <RNText style={styles.sectionTitle}>🏥 Health Information</RNText>
                    <View style={styles.detailItem}>
                      <RNText style={styles.detailLabel}>Blood Pressure</RNText>
                      <RNText style={styles.detailValue}>{selectedDonor.bloodPressure}</RNText>
                    </View>
                    <View style={styles.healthNotesContainer}>
                      <RNText style={styles.healthNotesText}>{selectedDonor.medicalHistory}</RNText>
                    </View>
                  </View>

                  {/* Additional Notes */}
                  <View style={styles.detailSection}>
                    <RNText style={styles.sectionTitle}>📝 Additional Notes</RNText>
                    <View style={styles.notesContainer}>
                      <RNText style={styles.notesText}>{selectedDonor.notes}</RNText>
                    </View>
                  </View>

                  {/* Contact Actions */}
                  <View style={styles.actionSection}>
                    <RNText style={styles.sectionTitle}>📞 Contact Donor</RNText>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCall(selectedDonor.contact)}
                      >
                        <RNText style={styles.callEmoji}>📞</RNText>
                        <RNText style={styles.callButtonText}>Call Now</RNText>
                        <RNText style={styles.contactNumber}>{selectedDonor.contact}</RNText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.smsButton}
                        onPress={() => handleSMS(selectedDonor.contact)}
                      >
                        <RNText style={styles.smsEmoji}>💬</RNText>
                        <RNText style={styles.smsButtonText}>Send Message</RNText>
                      </TouchableOpacity>

                      {selectedDonor.emergencyContact && (
                        <TouchableOpacity
                          style={styles.emergencyButton}
                          onPress={() => handleCall(selectedDonor.emergencyContact)}
                        >
                          <RNText style={styles.emergencyEmoji}>🚨</RNText>
                          <RNText style={styles.emergencyButtonText}>Emergency Contact</RNText>
                          <RNText style={styles.emergencyContactNumber}>{selectedDonor.emergencyContact}</RNText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Security Info */}
                  <View style={styles.securitySection}>
                    <View style={styles.securityInfo}>
                      <RNText style={styles.shieldEmoji}>🛡️</RNText>
                      <RNText style={styles.securityText}>
                        Verified Donor • Safe Contact • Health Checked
                      </RNText>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#059669', // Green background for recipient dashboard
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  centerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  iconContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerIcon: {
    fontSize: 32,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  searchCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterHeader: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bloodGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: 60,
    alignItems: 'center',
  },
  selectedBloodGroupButton: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  bloodGroupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedBloodGroupButtonText: {
    color: 'white',
  },
  locationInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 48,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  locationButton: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
  },
  searchEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  combinedSearchSection: {
    flexDirection: 'row',
    gap: 12,
  },
  combinedButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  combinedEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  combinedButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B7280',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsCount: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  donorsList: {
    gap: 16,
  },
  donorCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  donorInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden', // Ensures content stays within borderRadius
    alignSelf: 'flex-start', // Important for badges in flex containers
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },
  bloodGroupContainer: {
    backgroundColor: '#EF4444', // Red for blood group
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  bloodGroupText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  donorDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#374151',
    flexShrink: 1, // Allows text to wrap
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  tapText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  ageText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    marginHorizontal: 4,
  },
  noResultsEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  footerText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5', // Light green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedIcon: {
    fontSize: 12,
    color: '#059669',
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  profileBloodGroup: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  profileBloodGroupText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  availabilitySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  availabilityEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  availabilityStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%', // Roughly half width for two columns
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  healthNotesContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  healthNotesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  notesContainer: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtons: {
    gap: 12,
  },
  callButton: {
    backgroundColor: '#059669', // Green
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  callEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.9,
  },
  smsButton: {
    backgroundColor: '#3B82F6', // Blue
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  smsEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  smsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  emergencyButton: {
    backgroundColor: '#DC2626', // Red
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  emergencyContactNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.9,
  },
  securitySection: {
    marginTop: 10,
    alignItems: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF', // Light blue background
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE', // Slightly darker blue border
  },
  shieldEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  securityText: {
    fontSize: 13,
    color: '#2563EB', // Darker blue text
    fontWeight: '600',
  },
});