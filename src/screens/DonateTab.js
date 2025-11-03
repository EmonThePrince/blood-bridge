import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Linking,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function DonateTab() {
  const navigation = useNavigation();
  const { user, loadUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Units donation modal
  const [unitsModalVisible, setUnitsModalVisible] = useState(false);
  const [pendingDonation, setPendingDonation] = useState(null);
  const [unitsInput, setUnitsInput] = useState('1');
  
  // Search filters - auto-select user's blood type and location
  const [searchBloodType, setSearchBloodType] = useState('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const bloodTypes = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['all', 'Critical', 'Urgent', 'High', 'Medium', 'Low', 'Normal'];

  // Refresh data when tab is focused (initial load only)
  useFocusEffect(
    useCallback(() => {
      fetchRequests(true);
    }, [])
  );

  // Auto-search when filters change
  useEffect(() => {
    // Skip initial render
    if (loading && requests.length === 0) return;
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Trigger search
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchRequests(true);
    }, 500); // 500ms delay for smooth UX
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchBloodType, searchLocation, urgencyFilter]);

  useEffect(() => {
    // Auto-select user's blood type and location on first load
    if (user) {
      if (user.bloodGroup && searchBloodType === 'all') {
        setSearchBloodType(user.bloodGroup);
      }
      if (user.location && !searchLocation) {
        setSearchLocation(user.location);
      }
    }
  }, [user]);

  const fetchRequests = async (reset = false, pageToFetch = null) => {
    if (reset) {
      setLoading(true);
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      // Use provided page or current page
      const page = pageToFetch || (reset ? 1 : currentPage);
      
      // Build URL with filters and pagination
      let url = `${API_BASE_URL}/api/requests/?page=${page}&status=Active`;
      
      if (searchBloodType && searchBloodType !== 'all') {
        url += `&bloodGroup=${encodeURIComponent(searchBloodType)}`;
      }
      if (searchLocation && searchLocation.trim()) {
        url += `&location=${encodeURIComponent(searchLocation.trim())}`;
      }
      if (urgencyFilter && urgencyFilter !== 'all') {
        url += `&urgency=${encodeURIComponent(urgencyFilter)}`;
      }
      
      console.log('Fetching requests with URL:', url); // Debug log
      
      const response = await fetch(url, {
        headers: { Authorization: token ? `Token ${token}` : '' },
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('Requests response:', data); // Debug log
        
        // Handle paginated response
        if (reset) {
          setRequests(data.results || []);
          setFilteredRequests(data.results || []);
        } else {
          setRequests(prev => [...prev, ...(data.results || [])]);
          setFilteredRequests(prev => [...prev, ...(data.results || [])]);
        }
        
        setNextPageUrl(data.next);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        Alert.alert('Error', 'Failed to load blood requests. Please try again.');
      }
    } catch (error) {
      console.error('DonateTab - Error fetching requests:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchRequests(true);
  };

  const loadMore = () => {
    if (!loadingMore && nextPageUrl) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchRequests(false, nextPage);
    }
  };

  const handleClearFilters = () => {
    setSearchBloodType(user?.bloodGroup || 'all');
    setSearchLocation(user?.location || '');
    setUrgencyFilter('all');
  };

  const handleLocationChange = (text) => {
    setSearchLocation(text);
  };

  const handleBloodTypeChange = (bloodType) => {
    setSearchBloodType(bloodType);
  };

  const handleUrgencyChange = (urgency) => {
    setUrgencyFilter(urgency);
  };

  const SkeletonRequestCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={[styles.skeletonLine, { width: '40%', height: 20 }]} />
        <View style={[styles.skeletonLine, { width: '30%', height: 20 }]} />
      </View>
      <View style={[styles.skeletonLine, { width: '70%', marginTop: 12 }]} />
      <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
      <View style={[styles.skeletonLine, { width: '80%', marginTop: 8 }]} />
    </View>
  );

  const handleRespond = async (requestId, maxUnits) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please login as a donor to respond to blood requests',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    // Open units input modal
    setPendingDonation({ requestId, maxUnits });
    setUnitsInput('1');
    setUnitsModalVisible(true);
  };

  const confirmDonation = async () => {
    const unitsToDonate = parseInt(unitsInput);
    const { requestId, maxUnits } = pendingDonation;
    
    // Validate input
    if (!unitsInput || isNaN(unitsToDonate)) {
      Alert.alert('Invalid Input', 'Please enter a valid number of units.');
      return;
    }
    
    if (unitsToDonate <= 0) {
      Alert.alert('Invalid Input', 'Units must be greater than 0.');
      return;
    }
    
    if (unitsToDonate > maxUnits) {
      Alert.alert('Invalid Input', `Cannot donate more than ${maxUnits} unit${maxUnits > 1 ? 's' : ''}. Only ${maxUnits} unit${maxUnits > 1 ? 's are' : ' is'} needed.`);
      return;
    }
    
    // Close units modal
    setUnitsModalVisible(false);
    
    // Show confirmation
    Alert.alert(
      'Confirm Donation',
      `Are you sure you want to donate ${unitsToDonate} unit${unitsToDonate > 1 ? 's' : ''} of blood?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              console.log('Sending donation request:', {
                url: `${API_BASE_URL}/api/requests/${requestId}/donated/`,
                unitsToDonate
              });
              
              const response = await fetch(
                `${API_BASE_URL}/api/requests/${requestId}/donated/`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                  },
                  body: JSON.stringify({
                    unitsDonated: unitsToDonate
                  }),
                }
              );

              console.log('Response status:', response.status);
              const responseText = await response.text();
              console.log('Response text:', responseText);
              
              // Try to parse JSON
              let data;
              try {
                data = JSON.parse(responseText);
              } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                Alert.alert('Error', 'Invalid response from server. Please try again.');
                return;
              }

              if (response.ok) {
                console.log('Donation successful:', data);
                
                // Update user data in context and storage
                if (data.donor) {
                  const updatedUser = {
                    ...user,
                    donationCount: data.donor.donationCount,
                    lastDonated: data.donor.lastDonated,
                  };
                  await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                }
                
                // Reload user data from API to update context
                await loadUser();
                
                // Show success message with details
                Alert.alert(
                  'Success! 🩸', 
                  data.message || 'Thank you for your donation!',
                  [{ text: 'OK', onPress: () => fetchRequests(true) }]
                );
              } else {
                const errorMessage = data.error || data.message || 'Failed to respond to request';
                console.error('Donation failed:', data);
                Alert.alert('Error', errorMessage);
              }
            } catch (error) {
              console.error('Error donating:', error);
              Alert.alert('Error', `Network error: ${error.message}. Please try again.`);
            }
          },
        },
      ]
    );
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return '#B71C1C';
      case 'Urgent':
        return '#D32F2F';
      case 'High':
        return '#F44336';
      case 'Medium':
        return '#FF9800';
      case 'Low':
        return '#4CAF50';
      case 'Normal':
        return '#66BB6A';
      default:
        return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donate Blood</Text>
        <Text style={styles.subtitle}>Help save lives by donating blood</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E53935']}
            tintColor="#E53935"
          />
        }
      >
        {/* Search Filters */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchTitle}>🔍 Filter Requests</Text>
          
          <Text style={styles.label}>Blood Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={searchBloodType}
              onValueChange={handleBloodTypeChange}
              style={styles.picker}
            >
              {bloodTypes.map((type) => (
                <Picker.Item 
                  key={type} 
                  label={type === 'all' ? 'All Blood Types' : type} 
                  value={type} 
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Location / Hospital</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city or hospital name"
            value={searchLocation}
            onChangeText={handleLocationChange}
            returnKeyType="search"
          />

          <Text style={styles.label}>Urgency Level</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.urgencyScroll}
          >
            {urgencyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.urgencyButton,
                  urgencyFilter === level && styles.urgencyButtonActive,
                  urgencyFilter === level && { backgroundColor: getUrgencyColor(level) },
                ]}
                onPress={() => handleUrgencyChange(level)}
              >
                <Text
                  style={[
                    styles.urgencyText,
                    urgencyFilter === level && styles.urgencyTextActive,
                  ]}
                >
                  {level === 'all' ? 'All' : level}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
            
            <Text style={styles.resultsCount}>
              {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Blood Requests List */}
        <ScrollView 
          style={styles.requestsContainer}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🩸</Text>
              <Text style={styles.emptyText}>No requests found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your filters or check back later
              </Text>
            </View>
          ) : (
            <>
              {filteredRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View
                    style={[
                      styles.urgencyBadge,
                      { backgroundColor: getUrgencyColor(request.urgency) },
                    ]}
                  >
                    <Text style={styles.urgencyBadgeText}>
                      {request.urgency?.toUpperCase() || 'NORMAL'}
                    </Text>
                  </View>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeBadgeText}>{request.bloodGroup}</Text>
                  </View>
                </View>

                <Text style={styles.patientName}>Patient: {request.name}</Text>
                <Text style={styles.hospitalName}>{request.hospital}</Text>
                <Text style={styles.hospitalAddress}>📍 {request.location}</Text>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Units Needed:</Text>
                    <Text style={styles.detailValue}>{request.unitsNeeded || 'N/A'}</Text>
                  </View>
                  {request.patientAge && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Patient Age:</Text>
                      <Text style={styles.detailValue}>{request.patientAge} years</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Contact:</Text>
                    <Text style={styles.detailValue}>{request.contact}</Text>
                  </View>
                  {request.requiredBy && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Required By:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(request.requiredBy).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                  {request.notes && (
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionLabel}>Notes:</Text>
                      <Text style={styles.descriptionText}>{request.notes}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => {
                      setSelectedRequest(request);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.viewDetailsButtonText}>ℹ️ View Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.respondButton,
                      { backgroundColor: getUrgencyColor(request.urgency) },
                    ]}
                    onPress={() => handleRespond(request.id, request.unitsNeeded)}
                  >
                    <Text style={styles.respondButtonText}>
                      {user ? '❤️ Donate' : '🔒 Login'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              ))}
              
              {/* Loading More Indicator */}
              {loadingMore && (
                <>
                  <SkeletonRequestCard />
                  <SkeletonRequestCard />
                </>
              )}
              
              {/* End of Results */}
              {!nextPageUrl && filteredRequests.length > 0 && (
                <View style={styles.endOfResults}>
                  <Text style={styles.endOfResultsText}>No more requests</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Request Details Modal - Modern UI */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modern Header with Gradient Effect */}
            <View style={[styles.modalHeaderModern, { backgroundColor: getUrgencyColor(selectedRequest?.urgency) }]}>
              <TouchableOpacity 
                style={styles.modalCloseIconButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
              
              {selectedRequest && (
                <View style={styles.modalHeaderContent}>
                  <View style={styles.bloodTypeBadgeModern}>
                    <Text style={styles.bloodTypeBadgeTextModern}>{selectedRequest.bloodGroup}</Text>
                  </View>
                  <Text style={styles.modalTitleModern}>Blood Request</Text>
                  <View style={styles.urgencyPillModern}>
                    <Text style={styles.urgencyPillText}>{selectedRequest.urgency?.toUpperCase()}</Text>
                  </View>
                </View>
              )}
            </View>

            {selectedRequest && (
              <ScrollView 
                style={styles.modalBodyModern} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalBodyContent}
              >
                {/* Info Section Header */}
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionHeaderText}>Request Details</Text>
                  <View style={styles.sectionHeaderLine} />
                </View>

                {/* Patient Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>👤</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>PATIENT</Text>
                    <Text style={styles.cardTitle}>{selectedRequest.name}</Text>
                    {selectedRequest.patientAge && (
                      <Text style={styles.cardSubtext}>{selectedRequest.patientAge} years old</Text>
                    )}
                  </View>
                </View>

                {/* Hospital Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>🏥</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>HOSPITAL</Text>
                    <Text style={styles.cardTitle}>{selectedRequest.hospital}</Text>
                    <Text style={styles.cardSubtext}>📍 {selectedRequest.location}</Text>
                  </View>
                </View>

                {/* Blood Requirements Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>🩸</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>BLOOD NEEDED</Text>
                    <Text style={styles.cardTitle}>{selectedRequest.unitsNeeded} Unit{selectedRequest.unitsNeeded > 1 ? 's' : ''}</Text>
                    {selectedRequest.requiredBy && (
                      <Text style={styles.cardSubtext}>
                        Required by: {new Date(selectedRequest.requiredBy).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Contact Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>📞</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>CONTACT</Text>
                    <Text style={styles.cardTitle}>{selectedRequest.contact}</Text>
                    <TouchableOpacity 
                      style={styles.quickCallButton}
                      onPress={() => {
                        const phoneUrl = `tel:${selectedRequest.contact}`;
                        Linking.openURL(phoneUrl).catch(err => 
                          Alert.alert('Error', 'Unable to make call')
                        );
                      }}
                    >
                      <Text style={styles.quickCallButtonText}>📱 Quick Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Status Card */}
                <View style={styles.modernCard}>
                  <View style={styles.cardIconContainer}>
                    <Text style={styles.cardIcon}>ℹ️</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardLabel}>STATUS</Text>
                    <View style={styles.statusBadgeContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: selectedRequest.status === 'Fulfilled' ? '#4CAF50' : '#FF9800' }]}>
                        <Text style={styles.statusBadgeText}>{selectedRequest.status || 'Active'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Notes Card */}
                {selectedRequest.notes && (
                  <View style={styles.modernCardFull}>
                    <View style={styles.notesHeader}>
                      <Text style={styles.cardIcon}>📝</Text>
                      <Text style={styles.cardLabel}>ADDITIONAL INFORMATION</Text>
                    </View>
                    <Text style={styles.cardNotesText}>{selectedRequest.notes}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <TouchableOpacity
                  style={[styles.modernActionButton, { backgroundColor: getUrgencyColor(selectedRequest.urgency) }]}
                  onPress={() => {
                    setModalVisible(false);
                    handleRespond(selectedRequest.id, selectedRequest.unitsNeeded);
                  }}
                >
                  <Text style={styles.modernActionButtonText}>
                    {user ? '❤️ I Can Donate Blood' : '🔒 Login to Donate'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modernCancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modernCancelButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Units Input Modal */}
      <Modal
        visible={unitsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUnitsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.unitsModalContent}>
            <Text style={styles.unitsModalTitle}>How many units?</Text>
            <Text style={styles.unitsModalSubtitle}>
              {pendingDonation ? `Maximum: ${pendingDonation.maxUnits} unit${pendingDonation.maxUnits > 1 ? 's' : ''}` : ''}
            </Text>
            
            <TextInput
              style={styles.unitsInput}
              value={unitsInput}
              onChangeText={setUnitsInput}
              keyboardType="numeric"
              placeholder="Enter units"
              autoFocus={true}
              selectTextOnFocus={true}
            />

            <View style={styles.unitsModalButtons}>
              <TouchableOpacity
                style={styles.unitsCancelButton}
                onPress={() => setUnitsModalVisible(false)}
              >
                <Text style={styles.unitsCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.unitsDonateButton}
                onPress={confirmDonation}
              >
                <Text style={styles.unitsDonateButtonText}>Donate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E53935',
    padding: 30,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  urgencyScroll: {
    flexDirection: 'row',
  },
  urgencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    alignItems: 'center',
    marginRight: 8,
  },
  urgencyButtonActive: {
    borderColor: 'transparent',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  urgencyTextActive: {
    color: '#FFF',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  clearButton: {
    padding: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  requestsContainer: {
    padding: 20,
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  urgencyBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bloodTypeBadge: {
    backgroundColor: '#E53935',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodTypeBadgeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  requestDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  descriptionBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewDetailsButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#4A5568',
  },
  viewDetailsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  respondButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  respondButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    width: '95%',
    height: '92%',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  bloodTypeBadgeLarge: {
    backgroundColor: '#E53935',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  bloodTypeBadgeTextLarge: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  modalValue: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalSubValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  modalActionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  modalActionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Modern Modal Styles
  modalHeaderModern: {
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'relative',
  },
  modalCloseIconButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseIcon: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '600',
  },
  modalHeaderContent: {
    alignItems: 'center',
  },
  bloodTypeBadgeModern: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  bloodTypeBadgeTextModern: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E53935',
  },
  modalTitleModern: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  urgencyPillModern: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  urgencyPillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalBodyModern: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 18,
    paddingBottom: 30,
  },
  modernCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  modernCardFull: {
    backgroundColor: '#FFF9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  cardIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFE0E0',
  },
  cardIcon: {
    fontSize: 26,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 10,
    color: '#E53935',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 3,
    lineHeight: 22,
  },
  cardSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
    lineHeight: 18,
  },
  cardNotesText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginTop: 8,
  },
  modernActionButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modernActionButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modernCancelButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modernCancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  // Skeleton & Pagination Styles
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    opacity: 0.7,
  },
  endOfResults: {
    padding: 30,
    alignItems: 'center',
  },
  endOfResultsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  // Additional Modal Styles
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
  },
  quickCallButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  quickCallButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadgeContainer: {
    marginVertical: 6,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  // Units Input Modal Styles
  unitsModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  unitsModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  unitsModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  unitsInput: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 18,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E53935',
    marginBottom: 25,
  },
  unitsModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  unitsCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  unitsCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  unitsDonateButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E53935',
    alignItems: 'center',
  },
  unitsDonateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
