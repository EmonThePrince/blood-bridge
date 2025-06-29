import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text as RNText, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useDonorAuth } from '../context/DonorAuthContext'; // Import the context hook

export default function DonorProfile({ route, navigation }) {
  const { currentDonor, updateDonorInfo, logout } = useDonorAuth();
  const [lastDonation, setLastDonation] = useState(currentDonor?.lastDonated || null);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // State for editable fields in the modal
  const [editableName, setEditableName] = useState(currentDonor?.name || '');
  const [editableLocation, setEditableLocation] = useState(currentDonor?.location || '');
  const [editablePhone, setEditablePhone] = useState(currentDonor?.phone || '');
  const [editableMedicalHistory, setEditableMedicalHistory] = useState(currentDonor?.medicalHistory || '');
  const [editablePreferredTime, setEditablePreferredTime] = useState(currentDonor?.preferredTime || '');
  const [editableNotes, setEditableNotes] = useState(currentDonor?.notes || '');


  useEffect(() => {
    if (currentDonor) {
      setLastDonation(currentDonor.lastDonated || null);
      setEditableName(currentDonor.name || '');
      setEditableLocation(currentDonor.location || '');
      setEditablePhone(currentDonor.phone || '');
      setEditableMedicalHistory(currentDonor.medicalHistory || '');
      setEditablePreferredTime(currentDonor.preferredTime || '');
      setEditableNotes(currentDonor.notes || '');
    } else {
      // If no donor is logged in (e.g., after logout), navigate away
      navigation.replace('Donor Registration'); // Or to a home screen
    }
  }, [currentDonor, navigation]);

  const markDonation = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    setLastDonation(today);
    // Update the context with the new lastDonated date
    updateDonorInfo({ lastDonated: today });
    setShowDonationModal(false);
  };

  const handleSaveProfile = () => {
    // Basic validation
    if (!editableName || !editablePhone || !editableLocation) {
      Alert.alert('Error', 'Name, Phone, and Location cannot be empty.');
      return;
    }

    const updatedData = {
      name: editableName,
      location: editableLocation,
      phone: editablePhone,
      medicalHistory: editableMedicalHistory,
      preferredTime: editablePreferredTime,
      notes: editableNotes,
      // Do NOT allow editing bloodGroup, age, donationCount, verified status directly here
    };
    updateDonorInfo(updatedData);
    setShowEditModal(false);
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
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowEditModal(false)}>
              <RNText style={styles.modalCloseButtonText}>✕</RNText>
            </TouchableOpacity>
            <RNText style={styles.modalHeader}>Edit Profile</RNText>

            <ScrollView style={{ marginTop: 10 }}>
              <RNText style={styles.inputLabel}>Name</RNText>
              <TextInput
                style={styles.input}
                value={editableName}
                onChangeText={setEditableName}
              />
              <RNText style={styles.inputLabel}>Location</RNText>
              <TextInput
                style={styles.input}
                value={editableLocation}
                onChangeText={setEditableLocation}
              />
              <RNText style={styles.inputLabel}>Phone</RNText>
              <TextInput
                style={styles.input}
                value={editablePhone}
                keyboardType="phone-pad"
                onChangeText={setEditablePhone}
              />
              <RNText style={styles.inputLabel}>Medical History</RNText>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={editableMedicalHistory}
                multiline
                onChangeText={setEditableMedicalHistory}
              />
              <RNText style={styles.inputLabel}>Preferred Time</RNText>
              <TextInput
                style={styles.input}
                value={editablePreferredTime}
                onChangeText={setEditablePreferredTime}
              />
              <RNText style={styles.inputLabel}>Notes</RNText>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={editableNotes}
                multiline
                onChangeText={setEditableNotes}
              />

              <TouchableOpacity style={[styles.markDonationButton, { marginTop: 20 }]} onPress={handleSaveProfile}>
                <RNText style={styles.markDonationButtonText}>Save Changes</RNText>
              </TouchableOpacity>
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
});
