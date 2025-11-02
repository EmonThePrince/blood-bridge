import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../config';

export default function ProfileTab() {
  const navigation = useNavigation();
  const { user, logout, updateUser, loadUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCheckupDatePicker, setShowCheckupDatePicker] = useState(false);
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    bloodGroup: '',
    location: '',
    age: '',
    lastDonated: new Date(),
    availability: 'Available',
    emergencyContact: '',
    medicalHistory: '',
    preferredTime: '',
    notes: '',
    weight: '',
    bloodPressure: '',
    lastCheckup: null,
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Refresh user data and donations when tab becomes active
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadUser(); // Refresh user data
        fetchDonations(); // Refresh donation history
      }
    }, [user?.id])
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        contact: user.contact || '',
        bloodGroup: user.bloodGroup || '',
        location: user.location || '',
        age: user.age?.toString() || '',
        lastDonated: user.lastDonated ? new Date(user.lastDonated) : null,
        availability: user.availability || 'Available',
        emergencyContact: user.emergencyContact || '',
        medicalHistory: user.medicalHistory || '',
        preferredTime: user.preferredTime || '',
        notes: user.notes || '',
        weight: user.weight || '',
        bloodPressure: user.bloodPressure || '',
        lastCheckup: user.lastCheckup ? new Date(user.lastCheckup) : null,
      });
      fetchDonations();
    }
  }, [user]);

  const fetchDonations = async () => {
    setLoadingDonations(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/donations/my_donations/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDonations(data);
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const updateData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : null,
    };
    
    // Only include lastDonated if it has a value
    if (formData.lastDonated) {
      updateData.lastDonated = formData.lastDonated.toISOString().split('T')[0];
    }
    
    // Only include lastCheckup if it has a value
    if (formData.lastCheckup) {
      updateData.lastCheckup = formData.lastCheckup.toISOString().split('T')[0];
    }
    
    const result = await updateUser(updateData);

    setLoading(false);
    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully!');
      setEditing(false);
    } else {
      Alert.alert('Error', result.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_BASE_URL}/api/donors/delete_account/`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Your account has been deleted', [
                  { text: 'OK', onPress: logout },
                ]);
              } else {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.guestHeader}>
          <Text style={styles.guestTitle}>Donor Profile</Text>
          <Text style={styles.guestSubtitle}>Login to manage your donations</Text>
        </View>
        
        <View style={styles.guestContent}>
          <View style={styles.guestCard}>
            <Text style={styles.guestIcon}>🩸</Text>
            <Text style={styles.guestCardTitle}>Become a Blood Donor</Text>
            <Text style={styles.guestCardText}>
              Register as a donor to help save lives and track your donation history
            </Text>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Login as Donor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerButtonText}>Register as Donor</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>💝 Why Register?</Text>
            <Text style={styles.infoBoxText}>
              • Get notified of urgent blood requests{'\n'}
              • Track your donation history{'\n'}
              • Help save lives in your community{'\n'}
              • Connect with recipients
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user.name || 'User'}</Text>
          <Text style={styles.userPhone}>{user.contact}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {!editing ? (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Name" value={user.name || 'Not set'} />
                <InfoRow label="Phone" value={user.contact || 'Not set'} />
                {user.emergencyContact && (
                  <InfoRow label="Emergency Contact" value={user.emergencyContact} />
                )}
                <InfoRow label="Blood Type" value={user.bloodGroup || 'Not set'} />
                <InfoRow label="Location" value={user.location || 'Not set'} />
                <InfoRow label="Age" value={user.age ? `${user.age} years` : 'Not set'} />
                {user.weight && (
                  <InfoRow label="Weight" value={`${user.weight} kg`} />
                )}
                {user.bloodPressure && (
                  <InfoRow label="Blood Pressure" value={user.bloodPressure} />
                )}
                <InfoRow
                  label="Last Donation"
                  value={
                    user.lastDonated
                      ? new Date(user.lastDonated).toLocaleDateString()
                      : 'Never'
                  }
                />
                {user.lastCheckup && (
                  <InfoRow
                    label="Last Checkup"
                    value={new Date(user.lastCheckup).toLocaleDateString()}
                  />
                )}
                {user.preferredTime && (
                  <InfoRow label="Preferred Time" value={user.preferredTime} />
                )}
                <InfoRow
                  label="Availability"
                  value={user.availability || 'Not set'}
                />
                {user.donationCount > 0 && (
                  <InfoRow
                    label="Total Donations"
                    value={user.donationCount.toString()}
                  />
                )}
                {user.registeredSince && (
                  <InfoRow
                    label="Member Since"
                    value={new Date(user.registeredSince).toLocaleDateString()}
                  />
                )}
                {user.verified && (
                  <View style={styles.verifiedBadgeProfile}>
                    <Text style={styles.verifiedTextProfile}>✓ Verified Donor</Text>
                  </View>
                )}
              </View>
              
              {user.medicalHistory && (
                <View style={[styles.infoCard, {marginTop: 15}]}>
                  <Text style={styles.cardTitle}>Medical History</Text>
                  <Text style={styles.cardContent}>{user.medicalHistory}</Text>
                </View>
              )}
              
              {user.notes && (
                <View style={[styles.infoCard, {marginTop: 15}]}>
                  <Text style={styles.cardTitle}>Additional Notes</Text>
                  <Text style={styles.cardContent}>{user.notes}</Text>
                </View>
              )}
            </View>

            {/* Donation History Section */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Donation History</Text>
              {loadingDonations ? (
                <ActivityIndicator size="small" color="#E53935" />
              ) : donations.length === 0 ? (
                <View style={styles.emptyDonations}>
                  <Text style={styles.emptyDonationsIcon}>🩸</Text>
                  <Text style={styles.emptyDonationsText}>No donations yet</Text>
                  <Text style={styles.emptyDonationsSubtext}>
                    Start saving lives by responding to blood requests
                  </Text>
                </View>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.donationsScrollView}
                  contentContainerStyle={styles.donationsContainer}
                >
                  {donations.map((donation) => (
                    <View key={donation.id} style={styles.donationCard}>
                      <View style={styles.donationHeader}>
                        <Text style={styles.donationDate}>
                          📅 {new Date(donation.donationDate).toLocaleDateString()}
                        </Text>
                        <View style={styles.donationBadge}>
                          <Text style={styles.donationBadgeText}>
                            {donation.unitsDonated} unit{donation.unitsDonated > 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.donationHospital}>🏥 {donation.hospital}</Text>
                      <Text style={styles.donationLocation}>📍 {donation.location}</Text>
                      {donation.notes && (
                        <Text style={styles.donationNotes}>📝 {donation.notes}</Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>

            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteButtonText}>🗑️ Delete Account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={formData.contact}
                onChangeText={(text) => setFormData({ ...formData, contact: text })}
              />

              <Text style={styles.label}>Blood Type</Text>
              <View style={styles.bloodTypeContainer}>
                {bloodTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.bloodTypeButton,
                      formData.bloodGroup === type && styles.bloodTypeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, bloodGroup: type })}
                  >
                    <Text
                      style={[
                        styles.bloodTypeText,
                        formData.bloodGroup === type && styles.bloodTypeTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="City, State"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />

              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Your age"
                keyboardType="numeric"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
              />

              <Text style={styles.label}>Last Donation Date (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.dateText, !formData.lastDonated && styles.placeholderText]}>
                  {formData.lastDonated 
                    ? formData.lastDonated.toLocaleDateString()
                    : 'No previous donation'}
                </Text>
              </TouchableOpacity>
              {formData.lastDonated && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => setFormData({ ...formData, lastDonated: null })}
                >
                  <Text style={styles.clearDateText}>Clear Date</Text>
                </TouchableOpacity>
              )}

              {showDatePicker && (
                <DateTimePicker
                  value={formData.lastDonated || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData({ ...formData, lastDonated: selectedDate });
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.label}>Emergency Contact (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Emergency contact number"
                keyboardType="phone-pad"
                value={formData.emergencyContact}
                onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
              />

              <Text style={styles.label}>Weight (kg) (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 70"
                keyboardType="numeric"
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
              />

              <Text style={styles.label}>Blood Pressure (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 120/80"
                value={formData.bloodPressure}
                onChangeText={(text) => setFormData({ ...formData, bloodPressure: text })}
              />

              <Text style={styles.label}>Last Health Checkup (Optional)</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCheckupDatePicker(true)}
              >
                <Text style={[styles.dateText, !formData.lastCheckup && styles.placeholderText]}>
                  {formData.lastCheckup 
                    ? formData.lastCheckup.toLocaleDateString()
                    : 'No checkup recorded'}
                </Text>
              </TouchableOpacity>
              {formData.lastCheckup && (
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => setFormData({ ...formData, lastCheckup: null })}
                >
                  <Text style={styles.clearDateText}>Clear Date</Text>
                </TouchableOpacity>
              )}

              {showCheckupDatePicker && (
                <DateTimePicker
                  value={formData.lastCheckup || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowCheckupDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData({ ...formData, lastCheckup: selectedDate });
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.label}>Preferred Donation Time (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Weekends, Mornings"
                value={formData.preferredTime}
                onChangeText={(text) => setFormData({ ...formData, preferredTime: text })}
              />

              <Text style={styles.label}>Medical History (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any medical conditions or allergies"
                value={formData.medicalHistory}
                onChangeText={(text) => setFormData({ ...formData, medicalHistory: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Additional Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any other information you'd like to share"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.availabilityContainer}>
                <Text style={styles.label}>Availability Status</Text>
                <View style={styles.switchContainer}>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      formData.availability === 'Available' && styles.switchButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, availability: 'Available' })}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        formData.availability === 'Available' && styles.switchTextActive,
                      ]}
                    >
                      Available
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.switchButton,
                      formData.availability !== 'Available' && styles.switchButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, availability: 'Not Available' })}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        formData.availability !== 'Available' && styles.switchTextActive,
                      ]}
                    >
                      Not Available
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditing(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#E53935',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 16,
    color: '#FFEBEE',
  },
  content: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E53935',
    marginBottom: 15,
  },
  logoutButtonText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 15,
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  bloodTypeButtonActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  bloodTypeTextActive: {
    color: '#FFFFFF',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  clearDateButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '600',
  },
  availabilityContainer: {
    marginTop: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  switchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  switchTextActive: {
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  saveButton: {
    backgroundColor: '#E53935',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Guest view styles
  guestHeader: {
    backgroundColor: '#E53935',
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  guestContent: {
    padding: 20,
  },
  guestCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  guestIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  guestCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  guestCardText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  loginButton: {
    backgroundColor: '#E53935',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  registerButtonText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
  // Donation history styles
  donationsScrollView: {
    marginTop: 10,
  },
  donationsContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingRight: 20,
  },
  donationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  donationDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  donationBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  donationBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  donationHospital: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  donationLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  donationNotes: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyDonations: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyDonationsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyDonationsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyDonationsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  verifiedBadgeProfile: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  verifiedTextProfile: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
