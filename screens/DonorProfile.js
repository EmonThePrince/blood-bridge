import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useDonorAuth } from '../context/DonorAuthContext'; // Import the context hook

export default function DonorProfile({ route, navigation }) {
  const { currentDonor, updateDonorInfo, logout } = useDonorAuth();
  const [lastDonation, setLastDonation] = useState(currentDonor?.lastDonated || null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // State for all editable fields in the modal
  const [editableName, setEditableName] = useState(currentDonor?.name || '');
  const [editableLocation, setEditableLocation] = useState(currentDonor?.location || '');
  const [editablePhone, setEditablePhone] = useState(currentDonor?.phone || '');
  const [editableAge, setEditableAge] = useState(currentDonor?.age?.toString() || '');
  const [editableWeight, setEditableWeight] = useState(currentDonor?.weight || '');
  const [editableBloodPressure, setEditableBloodPressure] = useState(currentDonor?.bloodPressure || '');
  const [editableMedicalHistory, setEditableMedicalHistory] = useState(currentDonor?.medicalHistory || '');
  const [editablePreferredTime, setEditablePreferredTime] = useState(currentDonor?.preferredTime || '');
  const [editableAvailability, setEditableAvailability] = useState(currentDonor?.availability || '');
  const [editableNotes, setEditableNotes] = useState(currentDonor?.notes || '');
  const [editableEmergencyContact, setEditableEmergencyContact] = useState(currentDonor?.emergencyContact || '');

  useEffect(() => {
    if (currentDonor) {
      setLastDonation(currentDonor.lastDonated || null);
      setEditableName(currentDonor.name || '');
      setEditableLocation(currentDonor.location || '');
      setEditablePhone(currentDonor.phone || '');
      setEditableAge(currentDonor.age?.toString() || '');
      setEditableWeight(currentDonor.weight || '');
      setEditableBloodPressure(currentDonor.bloodPressure || '');
      setEditableMedicalHistory(currentDonor.medicalHistory || '');
      setEditablePreferredTime(currentDonor.preferredTime || '');
      setEditableAvailability(currentDonor.availability || '');
      setEditableNotes(currentDonor.notes || '');
      setEditableEmergencyContact(currentDonor.emergencyContact || '');
    } else {
      // If no donor is logged in (e.g., after logout), navigate away
      navigation.replace('Donor Registration'); // Or to a home screen
    }
  }, [currentDonor, navigation]);

  const markDonation = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    setLastDonation(today);
    // Update the context with the new lastDonated date and increment donation count
    const newDonationCount = (currentDonor.donationCount || 0) + 1;
    updateDonorInfo({ 
      lastDonated: today,
      donationCount: newDonationCount
    });
    setShowDonationModal(false);
    Alert.alert('Success', 'Donation recorded successfully!');
  };

  const handleSaveProfile = () => {
    // Enhanced validation
    if (!editableName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    if (!editablePhone.trim()) {
      Alert.alert('Error', 'Phone number cannot be empty.');
      return;
    }
    if (!editableLocation.trim()) {
      Alert.alert('Error', 'Location cannot be empty.');
      return;
    }
    if (editableAge && (isNaN(editableAge) || parseInt(editableAge) < 18 || parseInt(editableAge) > 65)) {
      Alert.alert('Error', 'Age must be between 18 and 65.');
      return;
    }

    const updatedData = {
      name: editableName.trim(),
      location: editableLocation.trim(),
      phone: editablePhone.trim(),
      age: editableAge ? parseInt(editableAge) : currentDonor.age,
      weight: editableWeight.trim(),
      bloodPressure: editableBloodPressure.trim(),
      medicalHistory: editableMedicalHistory.trim(),
      preferredTime: editablePreferredTime.trim(),
      availability: editableAvailability.trim(),
      notes: editableNotes.trim(),
      emergencyContact: editableEmergencyContact.trim(),
      // Do NOT allow editing bloodGroup, donationCount, verified status, registeredSince directly here
    };
    
    updateDonorInfo(updatedData);
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const resetEditForm = () => {
    if (currentDonor) {
      setEditableName(currentDonor.name || '');
      setEditableLocation(currentDonor.location || '');
      setEditablePhone(currentDonor.phone || '');
      setEditableAge(currentDonor.age?.toString() || '');
      setEditableWeight(currentDonor.weight || '');
      setEditableBloodPressure(currentDonor.bloodPressure || '');
      setEditableMedicalHistory(currentDonor.medicalHistory || '');
      setEditablePreferredTime(currentDonor.preferredTime || '');
      setEditableAvailability(currentDonor.availability || '');
      setEditableNotes(currentDonor.notes || '');
      setEditableEmergencyContact(currentDonor.emergencyContact || '');
    }
  };

  if (!currentDonor) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <RNText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          Please log in to view your profile.
        </RNText>
        <TouchableOpacity
          style={[styles.markDonationButton, { marginTop: 20 }]}
          onPress={() => navigation.navigate('Donor Login')}
        >
          <RNText style={styles.markDonationButtonText}>Go to Login</RNText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centerContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <RNText style={styles.heartIcon}>📋</RNText>
            </View>
            <RNText style={styles.mainTitle}>Your Donor Profile</RNText>
            <RNText style={styles.subtitle}>
              Review your information and update your donation status
            </RNText>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <RNText style={styles.cardTitle}>👤 Personal Details</RNText>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Name:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.name}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Blood Group:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.bloodGroup}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Phone:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.phone}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Location:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.location}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Age:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.age} years</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Weight:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.weight}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Blood Pressure:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.bloodPressure}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Member Since:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.registeredSince}</RNText>
            </View>

            <RNText style={styles.cardTitle}>🩸 Donation Details</RNText>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Total Donations:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.donationCount} times</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Last Donated:</RNText>
              <RNText style={styles.detailValue}>{lastDonation ?? 'Never'}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Preferred Time:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.preferredTime}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Availability:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.availability}</RNText>
            </View>
            <View style={styles.detailItem}>
              <RNText style={styles.detailLabel}>Verified Status:</RNText>
              <RNText style={styles.detailValue}>{currentDonor.verified ? 'Yes' : 'No'}</RNText>
            </View>

            <RNText style={styles.cardTitle}>📝 Health & Notes</RNText>
            <View style={styles.longDetailItem}>
              <RNText style={styles.detailLabel}>Medical History:</RNText>
              <RNText style={styles.detailValueLong}>{currentDonor.medicalHistory}</RNText>
            </View>
            <View style={styles.longDetailItem}>
              <RNText style={styles.detailLabel}>Notes:</RNText>
              <RNText style={styles.detailValueLong}>{currentDonor.notes}</RNText>
            </View>
            <View style={styles.longDetailItem}>
              <RNText style={styles.detailLabel}>Emergency Contact:</RNText>
              <RNText style={styles.detailValueLong}>{currentDonor.emergencyContact}</RNText>
            </View>

            <TouchableOpacity style={styles.markDonationButton} onPress={() => setShowDonationModal(true)}>
              <RNText style={styles.markDonationEmoji}>🩸</RNText>
              <RNText style={styles.markDonationButtonText}>Mark New Donation</RNText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.markDonationButton, styles.editProfileButton]} onPress={() => setShowEditModal(true)}>
              <RNText style={styles.markDonationEmoji}>✏️</RNText>
              <RNText style={styles.markDonationButtonText}>Edit Profile</RNText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <RNText style={styles.footerText}>
              Thank you for being a hero! ❤️
            </RNText>
            <View style={styles.securityInfo}>
              <RNText style={styles.shieldEmoji}>🛡️</RNText>
              <RNText style={styles.securityText}>
                Your data is secure and private
              </RNText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Mark Donation Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDonationModal}
        onRequestClose={() => setShowDonationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowDonationModal(false)}>
              <RNText style={styles.modalCloseButtonText}>✕</RNText>
            </TouchableOpacity>
            <RNText style={styles.modalHeader}>Confirm Donation</RNText>
            <RNText style={styles.modalBody}>Are you sure you want to mark a new donation today?</RNText>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={markDonation}>
                <RNText style={styles.modalButtonText}>Yes, Confirm</RNText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setShowDonationModal(false)}>
                <RNText style={styles.modalButtonText}>Cancel</RNText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => {
          resetEditForm();
          setShowEditModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%', width: '95%' }]}>
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => {
                resetEditForm();
                setShowEditModal(false);
              }}
            >
              <RNText style={styles.modalCloseButtonText}>✕</RNText>
            </TouchableOpacity>
            <RNText style={styles.modalHeader}>Edit Profile</RNText>

            <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
              {/* Personal Information Section */}
              <RNText style={styles.sectionHeader}>👤 Personal Information</RNText>
              
              <RNText style={styles.inputLabel}>Name *</RNText>
              <TextInput
                style={styles.input}
                value={editableName}
                onChangeText={setEditableName}
                placeholder="Enter your full name"
              />
              
              <RNText style={styles.inputLabel}>Phone Number *</RNText>
              <TextInput
                style={styles.input}
                value={editablePhone}
                keyboardType="phone-pad"
                onChangeText={setEditablePhone}
                placeholder="Enter your phone number"
              />
              
              <RNText style={styles.inputLabel}>Location *</RNText>
              <TextInput
                style={styles.input}
                value={editableLocation}
                onChangeText={setEditableLocation}
                placeholder="Enter your location"
              />
              
              <RNText style={styles.inputLabel}>Age</RNText>
              <TextInput
                style={styles.input}
                value={editableAge}
                keyboardType="numeric"
                onChangeText={setEditableAge}
                placeholder="Enter your age (18-65)"
              />
              
              <RNText style={styles.inputLabel}>Weight</RNText>
              <TextInput
                style={styles.input}
                value={editableWeight}
                onChangeText={setEditableWeight}
                placeholder="e.g., 70 kg"
              />
              
              <RNText style={styles.inputLabel}>Blood Pressure</RNText>
              <TextInput
                style={styles.input}
                value={editableBloodPressure}
                onChangeText={setEditableBloodPressure}
                placeholder="e.g., 120/80"
              />

              {/* Donation Preferences Section */}
              <RNText style={styles.sectionHeader}>🩸 Donation Preferences</RNText>
              
              <RNText style={styles.inputLabel}>Preferred Time</RNText>
              <TextInput
                style={styles.input}
                value={editablePreferredTime}
                onChangeText={setEditablePreferredTime}
                placeholder="e.g., Morning, Afternoon, Evening"
              />
              
              <RNText style={styles.inputLabel}>Availability</RNText>
              <TextInput
                style={styles.input}
                value={editableAvailability}
                onChangeText={setEditableAvailability}
                placeholder="e.g., Weekdays, Weekends, Always"
              />

              {/* Health Information Section */}
              <RNText style={styles.sectionHeader}>📝 Health Information</RNText>
              
              <RNText style={styles.inputLabel}>Medical History</RNText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editableMedicalHistory}
                multiline
                numberOfLines={4}
                onChangeText={setEditableMedicalHistory}
                placeholder="Any relevant medical history or conditions"
                textAlignVertical="top"
              />
              
              <RNText style={styles.inputLabel}>Additional Notes</RNText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editableNotes}
                multiline
                numberOfLines={4}
                onChangeText={setEditableNotes}
                placeholder="Any additional notes or special instructions"
                textAlignVertical="top"
              />
              
              <RNText style={styles.inputLabel}>Emergency Contact</RNText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editableEmergencyContact}
                multiline
                numberOfLines={3}
                onChangeText={setEditableEmergencyContact}
                placeholder="Name and phone number of emergency contact"
                textAlignVertical="top"
              />

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton]} 
                  onPress={handleSaveProfile}
                >
                  <RNText style={styles.actionButtonText}>💾 Save Changes</RNText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]} 
                  onPress={() => {
                    resetEditForm();
                    setShowEditModal(false);
                  }}
                >
                  <RNText style={styles.actionButtonText}>❌ Cancel</RNText>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#8b0000',
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  centerContainer: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#b71c1c',
    padding: 15,
    borderRadius: 50,
    marginBottom: 10,
    shadowColor: 'black',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  heartIcon: {
    fontSize: 28,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#b71c1c',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  longDetailItem: {
    marginBottom: 8,
  },
  detailLabel: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#444',
  },
  detailValueLong: {
    color: '#444',
    paddingLeft: 10,
  },
  markDonationButton: {
    flexDirection: 'row',
    backgroundColor: '#b71c1c',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markDonationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  markDonationEmoji: {
    fontSize: 20,
  },
  editProfileButton: {
    backgroundColor: '#4caf50',
  },
  footer: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 16,
  },
  securityInfo: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  shieldEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  securityText: {
    color: 'white',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: '#b71c1c',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#b71c1c',
  },
  modalBody: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalConfirmButton: {
    backgroundColor: '#b71c1c',
  },
  modalCancelButton: {
    backgroundColor: '#aaa',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b71c1c',
    marginTop: 20,
    marginBottom: 15,
  },
  inputLabel: {
    fontWeight: 'bold',
    color: '#b71c1c',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#b71c1c',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#b71c1c',
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});