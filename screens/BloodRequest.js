import React, { useState } from 'react';
import { ScrollView, TextInput, StyleSheet, View, Text as RNText, TouchableOpacity, Alert, Platform } from 'react-native'; // Added Platform for DatePicker
import DateTimePicker from '@react-native-community/datetimepicker'; // For date selection

export default function BloodRequest() {
  const [requestorName, setRequestorName] = useState(''); // New: Requestor Name
  const [bloodGroup, setBloodGroup] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [hospital, setHospital] = useState(''); // New: Hospital
  const [patientAge, setPatientAge] = useState(''); // New: Patient Age
  const [unitsNeeded, setUnitsNeeded] = useState(''); // New: Units Needed
  const [urgency, setUrgency] = useState('Normal'); // New: Urgency (default to Normal)
  const [requiredBy, setRequiredBy] = useState(new Date()); // New: Required By Date
  const [showDatePicker, setShowDatePicker] = useState(false); // For date picker visibility
  const [notes, setNotes] = useState('');
  const [isBloodGroupDropdownOpen, setIsBloodGroupDropdownOpen] = useState(false);
  const [isUrgencyDropdownOpen, setIsUrgencyDropdownOpen] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = ['Critical', 'Urgent', 'Normal']; // Urgency options

  const handleSubmit = () => {
    // Basic validation for required fields
    if (!requestorName || !bloodGroup || !contact || !location || !hospital || !unitsNeeded) {
      Alert.alert('Error', 'Please fill in all required fields: Name, Blood Group, Contact, Location, Hospital, Units Needed.');
      return;
    }
    if (isNaN(Number(unitsNeeded)) || Number(unitsNeeded) <= 0) {
      Alert.alert('Error', 'Units Needed must be a positive number.');
      return;
    }
    if (patientAge && (isNaN(Number(patientAge)) || Number(patientAge) <= 0)) {
        Alert.alert('Error', 'Patient Age must be a positive number or left empty.');
        return;
    }


    const formattedRequiredBy = requiredBy.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const requestedAt = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // Current time

    const newRequest = {
      id: Math.random().toString(36).substring(2, 10), // Simple unique ID
      name: requestorName,
      bloodGroup: bloodGroup,
      location: location,
      contact: contact,
      urgency: urgency,
      hospital: hospital,
      patientAge: patientAge || null, // Optional
      requiredBy: formattedRequiredBy,
      unitsNeeded: unitsNeeded,
      notes: notes, // Optional
      requestedAt: requestedAt, // Storing current time
      status: 'Active' // Default status
    };

    console.log('New Blood Request:', newRequest);
    Alert.alert('Success', 'Blood request submitted successfully!', [
        { text: 'OK', onPress: () => {
            // You can navigate or perform other actions after successful submission
            // For example, navigate back to a dashboard or show a confirmation screen
            // navigation.navigate('RecipientDashboard'); // if you want to navigate
        }}
    ]);

    // Clear form after submission
    setRequestorName('');
    setBloodGroup('');
    setContact('');
    setLocation('');
    setHospital('');
    setPatientAge('');
    setUnitsNeeded('');
    setUrgency('Normal');
    setRequiredBy(new Date());
    setNotes('');
  };

  const selectBloodGroup = (group) => {
    setBloodGroup(group);
    setIsBloodGroupDropdownOpen(false);
  };

  const selectUrgency = (level) => {
    setUrgency(level);
    setIsUrgencyDropdownOpen(false);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || requiredBy;
    setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS until confirmed, close on Android
    setRequiredBy(currentDate);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centerContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <RNText style={styles.emergencyIcon}>🚨</RNText>
            </View>
            <RNText style={styles.mainTitle}>Request Blood</RNText>
            <RNText style={styles.subtitle}>
              Find donors in your area quickly and safely
            </RNText>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Requestor Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>👤</RNText>
                <RNText style={styles.label}>Your Name / Patient Guardian Name</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={requestorName}
                onChangeText={setRequestorName}
                placeholderTextColor="#999"
              />
            </View>

            {/* Blood Group Select */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>🩸</RNText>
                <RNText style={styles.label}>Blood Group Needed</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsBloodGroupDropdownOpen(!isBloodGroupDropdownOpen)}
              >
                <RNText style={[styles.dropdownText, !bloodGroup && styles.placeholder]}>
                  {bloodGroup || 'Select required blood group'}
                </RNText>
                <RNText style={styles.dropdownArrow}>
                  {isBloodGroupDropdownOpen ? '▲' : '▼'}
                </RNText>
              </TouchableOpacity>

             {isBloodGroupDropdownOpen && (
                <ScrollView 
                  style={styles.dropdownList}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {bloodGroups.map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={styles.dropdownItem}
                      onPress={() => selectBloodGroup(group)}
                    >
                      <RNText style={styles.dropdownItemText}>{group}</RNText>
                      {group === bloodGroup && (
                        <RNText style={styles.checkmark}>✓</RNText>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Contact Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>📞</RNText>
                <RNText style={styles.label}>Contact Number</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your contact number"
                keyboardType="phone-pad"
                value={contact}
                onChangeText={setContact}
                placeholderTextColor="#999"
              />
            </View>

            {/* Location Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>📍</RNText>
                <RNText style={styles.label}>General Location</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., City, Area (Dhaka, Gulshan)"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#999"
              />
            </View>

            {/* Hospital Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>🏥</RNText>
                <RNText style={styles.label}>Hospital Name</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., Dhaka Medical College Hospital"
                value={hospital}
                onChangeText={setHospital}
                placeholderTextColor="#999"
              />
            </View>

            {/* Patient Age Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>👶</RNText>
                <RNText style={styles.label}>Patient Age</RNText>
                <RNText style={styles.optional}>(Optional)</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 45"
                keyboardType="numeric"
                value={patientAge}
                onChangeText={setPatientAge}
                placeholderTextColor="#999"
              />
            </View>

            {/* Units Needed Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>📏</RNText>
                <RNText style={styles.label}>Units Needed</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2 (units)"
                keyboardType="numeric"
                value={unitsNeeded}
                onChangeText={setUnitsNeeded}
                placeholderTextColor="#999"
              />
            </View>

            {/* Urgency Level Select */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>⚡</RNText>
                <RNText style={styles.label}>Urgency Level</RNText>
                <RNText style={styles.optional}>(Optional)</RNText>
              </View>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsUrgencyDropdownOpen(!isUrgencyDropdownOpen)}
              >
                <RNText style={[styles.dropdownText]}>
                  {urgency}
                </RNText>
                <RNText style={styles.dropdownArrow}>
                  {isUrgencyDropdownOpen ? '▲' : '▼'}
                </RNText>
              </TouchableOpacity>

              {isUrgencyDropdownOpen && (
                <View style={styles.dropdownList}>
                  {urgencyLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={styles.dropdownItem}
                      onPress={() => selectUrgency(level)}
                    >
                      <RNText style={styles.dropdownItemText}>{level}</RNText>
                      {level === urgency && (
                        <RNText style={styles.checkmark}>✓</RNText>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Required By Date Picker */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>🗓️</RNText>
                <RNText style={styles.label}>Required By Date</RNText>
                <RNText style={styles.optional}>(Optional)</RNText>
              </View>
              <TouchableOpacity onPress={showDatePickerModal} style={styles.input}>
                <RNText style={styles.dropdownText}>
                  {requiredBy.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </RNText>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={requiredBy}
                  mode="date"
                  display="default"
                  minimumDate={new Date()} // Cannot select past dates
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>📝</RNText>
                <RNText style={styles.label}>Additional Notes</RNText>
                <RNText style={styles.optional}>(Optional)</RNText>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Urgency level, patient details, specific instructions..."
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <RNText style={styles.urgentEmoji}>Submit</RNText>
            </TouchableOpacity>
          </View>

          {/* Emergency Info */}
          <View style={styles.emergencyInfo}>
            <View style={styles.emergencyCard}>
              <RNText style={styles.emergencyTitle}>🔴 Emergency?</RNText>
              <RNText style={styles.emergencyText}>
                For critical situations, call emergency services immediately
              </RNText>
              <TouchableOpacity style={styles.emergencyButton}>
                <RNText style={styles.emergencyButtonText}>📞 Emergency: 999</RNText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <RNText style={styles.footerText}>
              Your request will be shared with nearby donors
            </RNText>
            <View style={styles.securityInfo}>
              <RNText style={styles.shieldEmoji}>🛡️</RNText>
              <RNText style={styles.securityText}>
                Verified • Secure • Fast Response
              </RNText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF', // Blue background for requests
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
    marginBottom: 32,
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
  emergencyIcon: {
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
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
    position: 'relative', // For dropdown positioning
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  required: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  optional: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 48,
    color: '#1F2937',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
    textAlignVertical: 'top', // For Android multi-line TextInput alignment
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  placeholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000, // Ensure dropdown appears on top
    maxHeight: 200, // Limit height and make it scrollable if many options
    overflow: 'hidden', // Hide overflow content if it exceeds maxHeight
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  urgentEmoji: {
    fontSize: 18,
    marginRight: 8,
    color: 'white',
    fontWeight: 'bold', // Combined with buttonText
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  emergencyInfo: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
    textAlign: 'center',
  },
  emergencyText: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 12,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emergencyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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
    marginBottom: 12,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldEmoji: {
    fontSize: 14,
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
});