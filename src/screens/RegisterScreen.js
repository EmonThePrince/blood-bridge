import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    location: '',
    age: '',
    lastDonated: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.contact ||
      !formData.password ||
      !formData.bloodGroup ||
      !formData.location
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const registerData = {
      name: formData.name,
      contact: formData.contact,
      password: formData.password,
      bloodGroup: formData.bloodGroup,
      location: formData.location,
    };

    // Add optional fields only if they have values
    if (formData.age) {
      registerData.age = parseInt(formData.age);
    }
    
    if (formData.lastDonated) {
      registerData.lastDonated = formData.lastDonated.toISOString().split('T')[0];
    }

    const result = await register(registerData);

    setLoading(false);

    if (!result.success) {
      // Handle different error formats
      let errorMessage = 'Registration failed. Please try again.';
      
      if (typeof result.error === 'string') {
        errorMessage = result.error;
      } else if (result.error && typeof result.error === 'object') {
        // Extract first error message from error object
        const firstError = Object.values(result.error)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } else {
      Alert.alert(
        'Success',
        'Registration successful! Please login.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={['#E53935', '#C62828']} style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/splash-icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Join BloodBridge</Text>
          <Text style={styles.subtitle}>Become a Life Saver</Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={formData.contact}
              onChangeText={(text) => setFormData({ ...formData, contact: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Blood Type *</Text>
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
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="City, State"
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your age"
              keyboardType="numeric"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Donation Date (Optional)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, !formData.lastDonated && styles.placeholderText]}>
                {formData.lastDonated 
                  ? formData.lastDonated.toLocaleDateString() 
                  : 'Select date (if donated before)'}
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
          </View>

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

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFEBEE',
  },
  formContainer: {
    padding: 30,
    marginTop: -10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  registerButton: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: 'bold',
  },
});
