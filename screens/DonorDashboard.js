import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity, Modal, Alert, Linking, TextInput } from 'react-native';
import { useDonorAuth } from '../context/DonorAuthContext';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorDashboard() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Filters
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { currentDonor,updateDonorInfo } = useDonorAuth();

  // API base URL
  const API_BASE_URL = 'http://192.168.2.109:8000'; // <== Replace with your real backend URL

  // Fetch all requests on mount or refresh
  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests(filters = {}) {
    try {
      let url = `${API_BASE_URL}/api/requests/`;

      // Build query params for filters (bloodGroup, location)
      const params = new URLSearchParams();
      if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
      if (filters.location) params.append('location', filters.location);

      if ([...params].length) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();

      setRequests(data);
      setFilteredRequests(data);
      setActiveFilter('all');
      setSelectedBloodGroup('');
      setLocationInput('');
    } catch (error) {
      Alert.alert('Error', 'Could not load requests from server.');
      console.error(error);
    }
  }

  // Replace previous filterByBloodGroup to call backend
  const filterByBloodGroup = async () => {
    if (!selectedBloodGroup) {
      Alert.alert('Please select a blood group first');
      return;
    }
    try {
      const url = `${API_BASE_URL}/api/requests/?bloodGroup=${encodeURIComponent(selectedBloodGroup)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to filter by blood group');
      const data = await res.json();
      setFilteredRequests(data);
      setActiveFilter('bloodGroup');
      setLocationInput('');
    } catch (error) {
      Alert.alert('Error', 'Failed to filter by blood group');
      console.error(error);
    }
  };

  // Replace filterByLocation to call backend
  const filterByLocation = async () => {
    if (!locationInput.trim()) {
      Alert.alert('Please enter a location first');
      return;
    }
    try {
      const url = `${API_BASE_URL}/api/requests/?location=${encodeURIComponent(locationInput.trim())}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to filter by location');
      const data = await res.json();
      setFilteredRequests(data);
      setActiveFilter('location');
      setSelectedBloodGroup('');
    } catch (error) {
      Alert.alert('Error', 'Failed to filter by location');
      console.error(error);
    }
  };

  // Replace filterByBoth to call backend with both params
  const filterByBoth = async () => {
    if (!selectedBloodGroup || !locationInput.trim()) {
      Alert.alert('Please select both blood group and location');
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append('bloodGroup', selectedBloodGroup);
      params.append('location', locationInput.trim());
      const url = `${API_BASE_URL}/api/requests/?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to filter by blood group and location');
      const data = await res.json();
      setFilteredRequests(data);
      setActiveFilter('both');
    } catch (error) {
      Alert.alert('Error', 'Failed to filter by both blood group and location');
      console.error(error);
    }
  };

  // Reset filters - refetch all requests from backend
  const resetFilters = () => {
    fetchRequests();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getUrgencyBgColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return '#FEF2F2';
      case 'high': return '#FFFBEB';
      case 'medium': return '#EFF6FF';
      case 'low': return '#F0FDF4';
      default: return '#F9FAFB';
    }
  };

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const handleCall = (contact) => {
    Linking.openURL(`tel:${contact}`);
  };

  const handleSMS = (contact) => {
    Linking.openURL(`sms:${contact}`);
  };

  // On donation confirm, call backend and update frontend list
  const handleDonated = (requestId) => {
  Alert.alert(
    "Confirm Donation",
    "Have you completed the blood donation for this request?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, I Donated",
        onPress: async () => {
          try {
            // Step 1: Fetch the full request details to access recipient's blood group
            const requestRes = await fetch(`${API_BASE_URL}/api/requests/${requestId}/`, {
              headers: {
                'Authorization': `Token ${currentDonor?.token}`,
                'Content-Type': 'application/json',
              },
            });

            if (!requestRes.ok) {
              throw new Error("Failed to fetch request details.");
            }

            const requestDetails = await requestRes.json();
            const recipientBloodGroup = requestDetails.bloodGroup; // Adjust if the field name is different

            // Step 2: Compare blood groups
            if (recipientBloodGroup !== currentDonor.bloodGroup) {
              Alert.alert(
                "Blood Group Mismatch ❗",
                `Your blood group (${currentDonor.bloodGroup}) does not match the recipient's (${recipientBloodGroup}). Please verify before confirming.`,
                [{ text: "OK" }]
              );
              return;
            }

            // Step 3: Proceed to mark donation if blood groups match
            const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/donated/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${currentDonor?.token}`,
              },
            });

            if (!res.ok) {
              const errorData = await res.json();
              console.error('Donation mark failed:', errorData);
              throw new Error(errorData?.detail || 'Failed to mark donation');
            }

            // Remove request from UI
            const updatedRequests = requests.filter(r => r.id !== requestId);
            const updatedFiltered = filteredRequests.filter(r => r.id !== requestId);
            setRequests(updatedRequests);
            setFilteredRequests(updatedFiltered);
            setModalVisible(false);

            // Update donor state locally
            const today = new Date().toISOString().slice(0, 10);
            const updatedDonor = {
              ...currentDonor,
              donationCount: (currentDonor.donationCount || 0) + 1,
              lastDonated: today,
            };
            updateDonorInfo(updatedDonor);

            Alert.alert(
              "Thank You! 🙏",
              `${currentDonor.name}, your donation has been recorded. You've helped save a life!`,
              [{ text: "OK" }]
            );

          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to record donation');
            console.error(error);
          }
        }
      }
    ]
  );
};




  // Blood group button renderer (no change)
  const renderBloodGroupButton = (group) => (
    <TouchableOpacity
      key={group}
      style={[
        styles.bloodGroupButton,
        selectedBloodGroup === group && styles.selectedBloodGroupButton
      ]}
      onPress={() => setSelectedBloodGroup(selectedBloodGroup === group ? '' : group)}
    >
      <RNText style={[
        styles.bloodGroupButtonText,
        selectedBloodGroup === group && styles.selectedBloodGroupButtonText
      ]}>
        {group}
      </RNText>
    </TouchableOpacity>
  );

  // Request card renderer (no change)
  const renderRequestCard = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.requestCard,
        { backgroundColor: getUrgencyBgColor(item.urgency) }
      ]} 
      onPress={() => handleRequestPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
          <RNText style={styles.urgencyText}>{item.urgency.toUpperCase()}</RNText>
        </View>
        <RNText style={styles.timeText}>{item.requestedAt}</RNText>
      </View>

      <View style={styles.bloodGroupContainer}>
        <RNText style={styles.bloodGroupText}>{item.bloodGroup}</RNText>
        <RNText style={styles.unitsText}>{item.unitsNeeded} unit(s)</RNText>
      </View>

      <View style={styles.requestInfo}>
        <View style={styles.infoRow}>
          <RNText style={styles.emoji}>👤</RNText>
          <RNText style={styles.infoText}>{item.name}</RNText>
        </View>
        <View style={styles.infoRow}>
          <RNText style={styles.emoji}>🏥</RNText>
          <RNText style={styles.infoText} numberOfLines={1}>{item.hospital}</RNText>
        </View>
        <View style={styles.infoRow}>
          <RNText style={styles.emoji}>📍</RNText>
          <RNText style={styles.infoText} numberOfLines={1}>{item.location}</RNText>
        </View>
        <View style={styles.infoRow}>
          <RNText style={styles.emoji}>⏰</RNText>
          <RNText style={styles.infoText}>Needed by: {item.requiredBy}</RNText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <RNText style={styles.tapText}>👆 Tap for details</RNText>
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <RNText style={styles.statusText}>{item.status}</RNText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centerContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <RNText style={styles.headerIcon}>🩸</RNText>
            </View>
            <RNText style={styles.mainTitle}>Blood Requests</RNText>
            <RNText style={styles.subtitle}>
              Help save lives by responding to urgent requests
            </RNText>
            {/* Show welcome message if donor is logged in */}
            {currentDonor && (
              <View style={styles.welcomeContainer}>
                <RNText style={styles.welcomeText}>
                  Welcome back, {currentDonor.name}! 👋
                </RNText>
                <RNText style={styles.welcomeSubtext}>
                  Blood Group: {currentDonor.bloodGroup} • {currentDonor.donationCount} donations
                </RNText>
              </View>
            )}
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

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <RNText style={styles.statNumber}>{requests.length}</RNText>
              <RNText style={styles.statLabel}>Total Requests</RNText>
            </View>
            <View style={styles.statCard}>
              <RNText style={styles.statNumber}>
                {requests.filter(r => r.urgency === 'Critical').length}
              </RNText>
              <RNText style={styles.statLabel}>Critical</RNText>
            </View>
          </View>

          {/* Results Section */}
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <RNText style={styles.resultsTitle}>
                {activeFilter === 'all' ? '👥 All Requests' : '🎯 Search Results'}
              </RNText>
              <RNText style={styles.resultsCount}>
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
              </RNText>
            </View>
            <View style={styles.requestsList}>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((item, index) => (
                  <View key={item.id}>
                    {renderRequestCard({ item })}
                  </View>
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <RNText style={styles.noResultsEmoji}>😔</RNText>
                  <RNText style={styles.noResultsText}>No requests found</RNText>
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
              Every donation can save up to 3 lives 💝
            </RNText>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Request Details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRequest && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleContainer}>
                      <RNText style={styles.modalTitle}>Request Details</RNText>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <RNText style={styles.closeButtonText}>✕</RNText>
                      </TouchableOpacity>
                    </View>
                    <View style={[
                      styles.modalUrgencyBadge, 
                      { backgroundColor: getUrgencyColor(selectedRequest.urgency) }
                    ]}>
                      <RNText style={styles.modalUrgencyText}>
                        {selectedRequest.urgency.toUpperCase()} PRIORITY
                      </RNText>
                    </View>
                  </View>

                  {/* Blood Group Section */}
                  <View style={styles.bloodGroupSection}>
                    <RNText style={styles.bloodGroupLarge}>{selectedRequest.bloodGroup}</RNText>
                    <RNText style={styles.unitsLarge}>{selectedRequest.unitsNeeded} unit(s) needed</RNText>
                  </View>

                  {/* Patient Information */}
                  <View style={styles.detailSection}>
                    <RNText style={styles.sectionTitle}>👤 Patient Information</RNText>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Name</RNText>
                        <RNText style={styles.detailValue}>{selectedRequest.name}</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Age</RNText>
                        <RNText style={styles.detailValue}>{selectedRequest.patientAge} years</RNText>
                      </View>
                    </View>
                  </View>

                  {/* Medical Information */}
                  <View style={styles.detailSection}>
                    <RNText style={styles.sectionTitle}>🏥 Medical Information</RNText>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Hospital</RNText>
                        <RNText style={styles.detailValue}>{selectedRequest.hospital}</RNText>
                      </View>
                      <View style={styles.detailItem}>
                        <RNText style={styles.detailLabel}>Required By</RNText>
                        <RNText style={styles.detailValue}>{selectedRequest.requiredBy}</RNText>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <RNText style={styles.detailLabel}>Location</RNText>
                      <RNText style={styles.detailValue}>{selectedRequest.location}</RNText>
                    </View>
                  </View>

                  {/* Additional Notes */}
                  <View style={styles.detailSection}>
                    <RNText style={styles.sectionTitle}>📝 Additional Notes</RNText>
                    <View style={styles.notesContainer}>
                      <RNText style={styles.notesText}>{selectedRequest.notes}</RNText>
                    </View>
                  </View>

                  {/* Contact Actions */}
                  <View style={styles.actionSection}>
                    <RNText style={styles.sectionTitle}>📞 Contact Options</RNText>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={styles.callButton}
                        onPress={() => handleCall(selectedRequest.contact)}
                      >
                        <RNText style={styles.callEmoji}>📞</RNText>
                        <RNText style={styles.callButtonText}>Call Now</RNText>
                        <RNText style={styles.contactNumber}>{selectedRequest.contact}</RNText>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.smsButton}
                        onPress={() => handleSMS(selectedRequest.contact)}
                      >
                        <RNText style={styles.smsEmoji}>💬</RNText>
                        <RNText style={styles.smsButtonText}>Send SMS</RNText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Donated Button - Only visible to logged-in donors */}
                  {currentDonor && (
                    <View style={styles.donationSection}>
                      <RNText style={styles.sectionTitle}>🩸 Donation Status</RNText>
                      <TouchableOpacity 
                        style={styles.donatedButton}
                        onPress={() => handleDonated(selectedRequest.id)}
                      >
                        <RNText style={styles.donatedEmoji}>✅</RNText>
                        <RNText style={styles.donatedButtonText}>I Have Donated</RNText>
                        <RNText style={styles.donatedSubtext}>Tap after successful donation</RNText>
                      </TouchableOpacity>
                      <RNText style={styles.donationNote}>
                        Only click this button after you have successfully completed the blood donation.
                      </RNText>
                    </View>
                  )}

                  {/* Login Prompt for Non-Donors */}
                  {!currentDonor && (
                    <View style={styles.loginPromptSection}>
                      <RNText style={styles.sectionTitle}>🔐 Donor Login Required</RNText>
                      <View style={styles.loginPromptContainer}>
                        <RNText style={styles.loginPromptIcon}>👤</RNText>
                        <RNText style={styles.loginPromptText}>
                          Please log in as a verified donor to mark your donation status.
                        </RNText>
                        <RNText style={styles.loginPromptSubtext}>
                          This helps us maintain accurate records and verify donations.
                        </RNText>
                      </View>
                    </View>
                  )}

                  {/* Request Info */}
                  <View style={styles.requestInfoSection}>
                    <RNText style={styles.requestInfoText}>
                      Request posted {selectedRequest.requestedAt}
                    </RNText>
                    <View style={styles.securityInfo}>
                      <RNText style={styles.shieldEmoji}>🛡️</RNText>
                      <RNText style={styles.securityText}>
                        Verified Request • Safe Contact
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
    backgroundColor: '#DC2626', // Red background for donor dashboard
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
  // Search Styles
  searchCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterHeader: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
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
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  selectedBloodGroupButton: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  bloodGroupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedBloodGroupButtonText: {
    color: 'white',
  },
  searchButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButton: {
    backgroundColor: '#3B82F6',
  },
  searchEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  combinedSearchSection: {
    flexDirection: 'row',
    gap: 8,
  },
  combinedButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  combinedEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  resetEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  combinedButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Results Styles
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
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsCount: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 4,
  },
  noResultsEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  welcomeContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    gap: 12,
  },
  // Complete the remaining styles from where it was cut off:

  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  requestsList: {
    width: '100%',
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  urgencyBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  urgencyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  bloodGroupText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  unitsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  requestInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  emoji: {
    fontSize: 14,
    marginRight: 8,
    width: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tapText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalUrgencyBadge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modalUrgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bloodGroupSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  bloodGroupLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  unitsLarge: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  callEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contactNumber: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  smsButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  smsEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  smsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  donationSection: {
    marginBottom: 20,
  },
  donatedButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  donatedEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  donatedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  donatedSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  donationNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loginPromptSection: {
    marginBottom: 20,
  },
  loginPromptContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loginPromptIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  loginPromptSubtext: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    opacity: 0.8,
  },
  requestInfoSection: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  requestInfoText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  securityText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
});