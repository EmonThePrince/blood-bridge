import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useDonorAuth } from '../context/DonorAuthContext';

const API_BASE_URL = 'http://192.168.2.109:8000/api'; // adjust your backend URL

export default function DonorProfile({ route, navigation }) {
  const { currentDonor, updateDonorInfo, logout } = useDonorAuth();

  const [donorData, setDonorData] = useState(null);

  // Local editable state
  const [lastDonation, setLastDonation] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Changed from editablePhone to editableContact
  const [editableName, setEditableName] = useState('');
  const [editableLocation, setEditableLocation] = useState('');
  const [editableContact, setEditableContact] = useState(''); // <-- renamed here
  const [editableAge, setEditableAge] = useState('');
  const [editableWeight, setEditableWeight] = useState('');
  const [editableBloodPressure, setEditableBloodPressure] = useState('');
  const [editableMedicalHistory, setEditableMedicalHistory] = useState('');
  const [editablePreferredTime, setEditablePreferredTime] = useState('');
  const [editableAvailability, setEditableAvailability] = useState('');
  const [editableNotes, setEditableNotes] = useState('');
  const [editableEmergencyContact, setEditableEmergencyContact] = useState('');

  // Fetch donor data from backend when component mounts or currentDonor changes
  useEffect(() => {
    if (!currentDonor) {
      navigation.replace('Donor Registration');
      return;
    }

    const fetchDonor = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/donors/${currentDonor.id}/`, {
          headers: {
            Authorization: `Token ${currentDonor.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to fetch donor info');
        const data = await res.json();
        setDonorData(data);
        initializeEditableFields(data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not load profile. Please login again.');
        logout();
        navigation.replace('Donor Registration');
      }
    };

    fetchDonor();
  }, [currentDonor, navigation, logout]);

  // Initialize editable states from donor data
  const initializeEditableFields = (data) => {
    setLastDonation(data.lastDonated || null);
    setEditableName(data.name || '');
    setEditableLocation(data.location || '');
    setEditableContact(data.contact || ''); // <-- renamed here
    setEditableAge(data.age?.toString() || '');
    setEditableWeight(data.weight || '');
    setEditableBloodPressure(data.bloodPressure || '');
    setEditableMedicalHistory(data.medicalHistory || '');
    setEditablePreferredTime(data.preferredTime || '');
    setEditableAvailability(data.availability || '');
    setEditableNotes(data.notes || '');
    setEditableEmergencyContact(data.emergencyContact || '');
  };

  const markDonation = async () => {
  if (!donorData) return;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    // Send only updated fields using PATCH
    const updatedData = {
      lastDonated: today,
      donationCount: (donorData.donationCount || 0) + 1,
    };

    const res = await fetch(`${API_BASE_URL}/donors/${donorData.id}/`, {
      method: 'PATCH', // use PATCH here
      headers: {
        Authorization: `Token ${currentDonor.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error('Failed to update donation info');

    const updatedDonor = await res.json();
    setDonorData(updatedDonor);
    initializeEditableFields(updatedDonor);
    updateDonorInfo(updatedDonor);

    setShowDonationModal(false);
    Alert.alert('Success', 'Donation recorded successfully!');
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to record donation.');
  }
};

  const handleSaveProfile = async () => {
  if (!editableName.trim()) {
    Alert.alert('Error', 'Name cannot be empty.');
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

  try {
    const updatedData = {
      name: editableName.trim(),
      location: editableLocation.trim(),
      age: editableAge ? parseInt(editableAge) : null,
      weight: editableWeight.trim() || null,
      bloodPressure: editableBloodPressure.trim() || null,
      medicalHistory: editableMedicalHistory.trim() || null,
      preferredTime: editablePreferredTime.trim() || null,
      availability: editableAvailability.trim() || null,
      notes: editableNotes.trim() || null,
      emergencyContact: editableEmergencyContact.trim() || null,
      // DO NOT include phone/contact here — read-only
    };

    const res = await fetch(`${API_BASE_URL}/donors/${donorData.id}/`, {
      method: 'PATCH',  // Use PATCH for partial update
      headers: {
        Authorization: `Token ${currentDonor.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!res.ok) throw new Error('Failed to update profile');

    const updatedDonor = await res.json();
    setDonorData(updatedDonor);
    initializeEditableFields(updatedDonor);
    updateDonorInfo(updatedDonor);

    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to update profile.');
  }
};

  const resetEditForm = () => {
    if (donorData) {
      initializeEditableFields(donorData);
    }
  };

  if (!donorData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <RNText style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          Loading your profile...
        </RNText>
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
              
              {/* <RNText style={styles.inputLabel}>Phone Number *</RNText>
              <TextInput
                style={styles.input}
                value={editableContact}           // changed from editablePhone
                keyboardType="phone-pad"
                onChangeText={setEditableContact} // changed from setEditablePhone
                placeholder="Enter your phone number"
              /> */}
              
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