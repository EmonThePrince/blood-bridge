import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

export default function SearchTab() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [displayedDonors, setDisplayedDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    location: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Refresh data when tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchDonors();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [filters, donors]);

  useEffect(() => {
    // Update displayed donors when filteredDonors or page changes
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    setDisplayedDonors(filteredDonors.slice(startIndex, endIndex));
    setHasMore(endIndex < filteredDonors.length);
  }, [filteredDonors, page]);

  const fetchDonors = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/donors/`, {
        headers: { Authorization: token ? `Token ${token}` : '' },
      });


      if (response.ok) {
        const data = await response.json();
        setDonors(data);
        setFilteredDonors(data);
      } else {
        const errorText = await response.text();
        Alert.alert('Error', 'Failed to load donors. Please try again.');
      }
    } catch (error) {
      console.error('SearchTab - Error fetching donors:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = donors;

    if (filters.bloodGroup) {
      filtered = filtered.filter((donor) => donor.bloodGroup === filters.bloodGroup);
    }

    if (filters.location) {
      filtered = filtered.filter((donor) =>
        donor.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openDonorDetails = (donor) => {
    setSelectedDonor(donor);
    setModalVisible(true);
  };

  const clearFilters = () => {
    setFilters({ bloodGroup: '', location: '' });
    setPage(1); // Reset pagination
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage(prevPage => prevPage + 1);
        setLoadingMore(false);
      }, 300); // Small delay for smooth UX
    }
  };

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonBloodBadge} />
      <View style={styles.skeletonContent}>
        <View style={[styles.skeletonLine, { width: '60%' }]} />
        <View style={[styles.skeletonLine, { width: '80%', marginTop: 8 }]} />
        <View style={[styles.skeletonLine, { width: '40%', marginTop: 8 }]} />
      </View>
    </View>
  );

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
        <Text style={styles.title}>Search Donors</Text>
        <Text style={styles.subtitle}>
          {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Blood Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bloodTypeScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !filters.bloodGroup && styles.filterChipActive,
            ]}
            onPress={() => setFilters({ ...filters, bloodGroup: '' })}
          >
            <Text
              style={[
                styles.filterChipText,
                !filters.bloodGroup && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {bloodTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                filters.bloodGroup === type && styles.filterChipActive,
              ]}
              onPress={() => setFilters({ ...filters, bloodGroup: type })}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filters.bloodGroup === type && styles.filterChipTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Location</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location..."
          value={filters.location}
          onChangeText={(text) => setFilters({ ...filters, location: text })}
        />

        {(filters.bloodGroup || filters.location) && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.donorList}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {filteredDonors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No donors found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          <>
            {displayedDonors.map((donor) => (
              <TouchableOpacity 
                key={donor.id} 
                style={styles.donorCard}
                onPress={() => openDonorDetails(donor)}
                activeOpacity={0.7}
              >
                <View style={styles.donorHeader}>
                  <View style={styles.bloodTypeBadge}>
                    <Text style={styles.bloodTypeBadgeText}>{donor.bloodGroup}</Text>
                  </View>
                  <View style={styles.donorInfo}>
                    <Text style={styles.donorName}>{donor.name}</Text>
                    <Text style={styles.donorLocation}>📍 {donor.location}</Text>
                  </View>
                </View>

                <View style={styles.donorDetails}>
                  {donor.donationCount > 0 && (
                    <View style={styles.donationBadge}>
                      <Text style={styles.donationBadgeText}>
                        ❤️ {donor.donationCount} {donor.donationCount === 1 ? 'Donation' : 'Donations'}
                      </Text>
                    </View>
                  )}
                  {donor.availability && donor.availability === 'Available' && (
                    <View style={styles.availableBadge}>
                      <Text style={styles.availableBadgeText}>✓ Available</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.tapToView}>Tap to view details →</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Loading More Indicator */}
            {loadingMore && (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            
            {/* End of Results */}
            {!hasMore && displayedDonors.length > 0 && (
              <View style={styles.endOfResults}>
                <Text style={styles.endOfResultsText}>No more donors</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Donor Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Donor Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedDonor && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalBloodTypeBadge}>
                  <Text style={styles.modalBloodTypeText}>{selectedDonor.bloodGroup}</Text>
                </View>

                <Text style={styles.modalDonorName}>{selectedDonor.name}</Text>
                
                <View style={styles.modalDetailSection}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Phone:</Text>
                    <Text style={styles.modalDetailValue}>{selectedDonor.contact}</Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Location:</Text>
                    <Text style={styles.modalDetailValue}>{selectedDonor.location}</Text>
                  </View>

                  {selectedDonor.emergencyContact && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>🚨 Emergency Contact:</Text>
                      <Text style={styles.modalDetailValue}>{selectedDonor.emergencyContact}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalDetailSection}>
                  <Text style={styles.sectionTitle}>Personal Details</Text>
                  
                  {selectedDonor.age && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>👤 Age:</Text>
                      <Text style={styles.modalDetailValue}>{selectedDonor.age} years</Text>
                    </View>
                  )}

                  {selectedDonor.weight && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>⚖️ Weight:</Text>
                      <Text style={styles.modalDetailValue}>{selectedDonor.weight} kg</Text>
                    </View>
                  )}

                  {selectedDonor.bloodPressure && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>💓 Blood Pressure:</Text>
                      <Text style={styles.modalDetailValue}>{selectedDonor.bloodPressure}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalDetailSection}>
                  <Text style={styles.sectionTitle}>Donation History</Text>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>❤️ Total Donations:</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedDonor.donationCount || 0} {selectedDonor.donationCount === 1 ? 'time' : 'times'}
                    </Text>
                  </View>

                  {selectedDonor.lastDonated && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>📅 Last Donation:</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedDonor.lastDonated).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {selectedDonor.lastCheckup && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>🏥 Last Checkup:</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedDonor.lastCheckup).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {selectedDonor.preferredTime && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>⏰ Preferred Time:</Text>
                      <Text style={styles.modalDetailValue}>{selectedDonor.preferredTime}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalDetailSection}>
                  <Text style={styles.sectionTitle}>Availability & Status</Text>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>✅ Status:</Text>
                    <Text style={[
                      styles.modalDetailValue,
                      { color: selectedDonor.availability === 'Available' ? '#4CAF50' : '#F44336' }
                    ]}>
                      {selectedDonor.availability || 'Unknown'}
                    </Text>
                  </View>

                  {selectedDonor.registeredSince && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>📝 Member Since:</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedDonor.registeredSince).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {selectedDonor.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓ Verified Donor</Text>
                    </View>
                  )}
                </View>

                {selectedDonor.medicalHistory && (
                  <View style={styles.modalDetailSection}>
                    <Text style={styles.sectionTitle}>Medical History</Text>
                    <Text style={styles.modalNotes}>{selectedDonor.medicalHistory}</Text>
                  </View>
                )}

                {selectedDonor.notes && (
                  <View style={styles.modalDetailSection}>
                    <Text style={styles.sectionTitle}>Additional Notes</Text>
                    <Text style={styles.modalNotes}>{selectedDonor.notes}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalCallButton}
                  onPress={() => {
                    setModalVisible(false);
                    handleCall(selectedDonor.contact);
                  }}
                >
                  <Text style={styles.modalCallButtonText}>📞 Call {selectedDonor.name}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#E53935',
    padding: 30,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFEBEE',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginTop: 5,
  },
  bloodTypeScroll: {
    marginBottom: 15,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clearButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  clearButtonText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '600',
  },
  donorList: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  donorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  bloodTypeBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bloodTypeBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  donorLocation: {
    fontSize: 14,
    color: '#666',
  },
  donorDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  donationBadge: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
  },
  donationBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E53935',
  },
  availableBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  availableBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
    marginTop: 5,
  },
  tapToView: {
    fontSize: 13,
    color: '#E53935',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalClose: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },
  modalBody: {
    padding: 20,
  },
  modalBloodTypeBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalBloodTypeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalDonorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDetailSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalDetailLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  modalDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalNotes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  verifiedBadge: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modalCallButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  modalCallButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCloseButtonText: {
    color: '#666',
    fontSize: 16,
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
  skeletonBloodBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  skeletonContent: {
    flex: 1,
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
});
