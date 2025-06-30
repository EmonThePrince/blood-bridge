import React, { useState } from 'react';
import { ScrollView, TextInput, StyleSheet, View, Text as RNText, TouchableOpacity, Alert } from 'react-native';

export default function DonorRegistration({ navigation }) {
  const [name, setName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState(''); // New state for password
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = () => {
    // Validate all required fields, including the new password
    if (!name || !bloodGroup || !phone || !location || !password) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    // Basic password validation (you can enhance this)
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    console.log({ name, bloodGroup, phone, location, password }); // Log all fields
    Alert.alert('Success', 'Donor registered successfully!');

    // Navigate to Donor Profile screen, pass donor info as params
    // In a real app, you would typically register with a backend,
    // and then log the user in, perhaps navigating to a dashboard.
    // We're passing the password here for simple local demonstration.
    navigation.navigate('Donor Profile', {
      donor: { name, bloodGroup, phone, location, password } // Pass password for demo
    });

    // Clear form after successful registration
    setName('');
    setBloodGroup('');
    setPhone('');
    setLocation('');
    setPassword(''); // Clear password field as well
  };

  const selectBloodGroup = (group) => {
    setBloodGroup(group);
    setIsDropdownOpen(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centerContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <RNText style={styles.heartIcon}>❤️</RNText>
            </View>
            <RNText style={styles.mainTitle}>Become a Life Saver</RNText>
            <RNText style={styles.subtitle}>
              Register as a blood donor and help save lives
            </RNText>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>👤</RNText>
                <RNText style={styles.label}>Full Name</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            {/* Blood Group Select */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>🩸</RNText>
                <RNText style={styles.label}>Blood Group</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <RNText style={[styles.dropdownText, !bloodGroup && styles.placeholder]}>
                  {bloodGroup || 'Choose your blood group'}
                </RNText>
                <RNText style={styles.dropdownArrow}>
                  {isDropdownOpen ? '▲' : '▼'}
                </RNText>
              </TouchableOpacity>

              {isDropdownOpen && (
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
                      {group === bloodGroup && ( // Added checkmark for selected item
                        <RNText style={styles.checkmark}>✓</RNText>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>📞</RNText>
                <RNText style={styles.label}>Phone Number</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#999"
              />
            </View>

            {/* Location Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>📍</RNText>
                <RNText style={styles.label}>Location</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your location (e.g., City, Area)"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#999"
              />
            </View>

            {/* Password Input (NEW) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <RNText style={styles.emoji}>🔒</RNText>
                <RNText style={styles.label}>Password</RNText>
                <RNText style={styles.required}>*</RNText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Set your password"
                secureTextEntry={true} // Hides the input characters
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <RNText style={styles.heartEmoji}>❤️</RNText>
              <RNText style={styles.buttonText}>Register as Donor</RNText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <RNText style={styles.footerText}>
              Your donation can save up to 3 lives
            </RNText>
            <View style={styles.securityInfo}>
              <RNText style={styles.shieldEmoji}>🛡️</RNText>
              <RNText style={styles.securityText}>
                Safe • Secure • Confidential
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
    backgroundColor: '#EF4444', // Red background consistent with donor theme
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
  heartIcon: {
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
    shadowColor: '#EF4444', // Consistent with donor theme
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 24,
    position: 'relative',
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
    flex: 1, // Allow label to take available space
  },
  required: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: 'bold',
    marginLeft: 4, // Add some space from the label
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
    zIndex: 1000,
    maxHeight: 200, // Added to prevent dropdown from going off-screen with many items
    overflow: 'hidden', // Ensures content respects maxHeight and borderRadius
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row', // For checkmark
    justifyContent: 'space-between', // For checkmark
    alignItems: 'center', // For checkmark
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  checkmark: { // New style for the checkmark
    fontSize: 16,
    color: '#DC2626', // Use primary red for consistency
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#DC2626', // Main donor theme button color
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 8,
  },
  heartEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
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
    backgroundColor: 'rgba(255,255,255,0.2)', // Light background for info
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
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