import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity, Modal, Alert, Linking } from 'react-native';
import { useDonorAuth } from '../context/DonorAuthContext'; // Import the auth context

const initialRequests = [
  { 
    id: '1', 
    name: 'Rahim Ahmed', 
    bloodGroup: 'A+', 
    location: 'Dhaka Medical College Hospital, Dhaka', 
    contact: '01712345678',
    urgency: 'Critical',
    hospital: 'Dhaka Medical College Hospital',
    patientAge: '45',
    requiredBy: '2024-12-30',
    unitsNeeded: '2',
    notes: 'Patient is undergoing major surgery. Blood needed urgently for post-operative care. Please contact immediately if available.',
    requestedAt: '2 hours ago',
    status: 'Active'
  },
  { 
    id: '2', 
    name: 'Karim Hassan', 
    bloodGroup: 'B-', 
    location: 'Chittagong Medical College, Chittagong', 
    contact: '01887654321',
    urgency: 'High',
    hospital: 'Chittagong Medical College',
    patientAge: '28',
    requiredBy: '2024-12-31',
    unitsNeeded: '1',
    notes: 'Emergency case - road accident victim. Family is at the hospital. Any help would be greatly appreciated.',
    requestedAt: '4 hours ago',
    status: 'Active'
  },
  { 
    id: '3', 
    name: 'Sumaiya Khatun', 
    bloodGroup: 'O+', 
    location: 'Sylhet MAG Osmani Medical College, Sylhet', 
    contact: '01999887766',
    urgency: 'Medium',
    hospital: 'MAG Osmani Medical College',
    patientAge: '35',
    requiredBy: '2025-01-02',
    unitsNeeded: '3',
    notes: 'Planned surgery for kidney stones. Patient has been waiting for suitable donor. Regular blood transfusion needed.',
    requestedAt: '6 hours ago',
    status: 'Active'
  },
  { 
    id: '4', 
    name: 'Jamal Uddin', 
    bloodGroup: 'AB+', 
    location: 'Barisal Sher-e-Bangla Medical College, Barisal', 
    contact: '01711223344',
    urgency: 'Low',
    hospital: 'Sher-e-Bangla Medical College',
    patientAge: '52',
    requiredBy: '2025-01-05',
    unitsNeeded: '1',
    notes: 'Routine blood transfusion for anemia treatment. Patient is stable. Flexible with timing.',
    requestedAt: '1 day ago',
    status: 'Active'
  },
  { 
    id: '5', 
    name: 'Nazia Begum', 
    bloodGroup: 'O-', 
    location: 'Rangpur Medical College, Rangpur', 
    contact: '01899887766',
    urgency: 'Critical',
    hospital: 'Rangpur Medical College',
    patientAge: '22',
    requiredBy: '2024-12-29',
    unitsNeeded: '4',
    notes: 'Pregnancy complications - immediate blood transfusion required. Mother and baby both in critical condition. Please help urgently.',
    requestedAt: '30 minutes ago',
    status: 'Active'
  },
];

export default function DonorDashboard() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Get the current donor from auth context
  const { currentDonor } = useDonorAuth();

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

  const handleDonated = (requestId) => {
    Alert.alert(
      "Confirm Donation",
      "Have you completed the blood donation for this request?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Yes, I Donated",
          style: "default",
          onPress: () => {
            // Remove the request from the list
            setRequests(prevRequests => 
              prevRequests.filter(request => request.id !== requestId)
            );
            setModalVisible(false);
            
            // Show success message with donor's name
            Alert.alert(
              "Thank You! 🙏",
              `${currentDonor.name}, your donation has been recorded. You've helped save a life!`,
              [{ text: "OK", style: "default" }]
            );
          }
        }
      ]
    );
  };

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

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <RNText style={styles.statNumber}>{requests.length}</RNText>
              <RNText style={styles.statLabel}>Active Requests</RNText>
            </View>
            <View style={styles.statCard}>
              <RNText style={styles.statNumber}>
                {requests.filter(r => r.urgency === 'Critical').length}
              </RNText>
              <RNText style={styles.statLabel}>Critical</RNText>
            </View>
          </View>

          {/* Requests List */}
          <View style={styles.requestsList}>
            {requests.length > 0 ? (
              requests.map((item, index) => (
                <View key={item.id}>
                  {renderRequestCard({ item })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <RNText style={styles.emptyStateIcon}>🎉</RNText>
                <RNText style={styles.emptyStateText}>
                  Great! No active requests right now.
                </RNText>
                <RNText style={styles.emptyStateSubtext}>
                  Thank you for your contributions to saving lives!
                </RNText>
              </View>
            )}
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
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
    fontWeight: '600',
  },
  requestsList: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  requestCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  bloodGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  tapText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
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
    paddingBottom: 40,
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalUrgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bloodGroupSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FEF2F2',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
  },
  bloodGroupLarge: {
    fontSize: 36,
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  notesContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButtons: {
    gap: 12,
  },
  callButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  contactNumber: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  smsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New Donated Button Styles
  donationSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  donatedButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  donatedEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  donatedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  donatedSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  donationNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  requestInfoSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
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
    marginRight: 6,
  },
  securityText: {
    fontSize: 11,
    color: '#6B7280',
  },
   loginPromptSection: {
    marginTop: 20,
    marginBottom: 15,
  },
  loginPromptContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  loginPromptIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  loginPromptText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  loginPromptSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});