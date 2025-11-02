import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function RequestTab() {
  const [formData, setFormData] = useState({
    name: '',
    bloodGroup: '',
    contact: '',
    location: '',
    hospital: '',
    patientAge: '',
    unitsNeeded: '',
    urgency: 'Medium',
    requiredBy: new Date(),
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencies = [
    { value: 'Normal', label: 'Normal', color: '#66BB6A' },
    { value: 'Low', label: 'Low', color: '#4CAF50' },
    { value: 'Medium', label: 'Medium', color: '#FF9800' },
    { value: 'High', label: 'High', color: '#F44336' },
    { value: 'Urgent', label: 'Urgent', color: '#D32F2F' },
    { value: 'Critical', label: 'Critical', color: '#B71C1C' },
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.bloodGroup || !formData.unitsNeeded || !formData.hospital || !formData.contact) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const submitData = {
        name: formData.name,
        bloodGroup: formData.bloodGroup,
        contact: formData.contact,
        location: formData.location,
        hospital: formData.hospital,
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : null,
        unitsNeeded: parseInt(formData.unitsNeeded),
        urgency: formData.urgency,
        requiredBy: formData.requiredBy.toISOString().split('T')[0],
        notes: formData.notes,
      };

      const response = await fetch(`${API_BASE_URL}/api/requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Token ${token}` : '',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Blood request submitted successfully!');
        setFormData({
          name: '',
          bloodGroup: '',
          contact: '',
          location: '',
          hospital: '',
          patientAge: '',
          unitsNeeded: '',
          urgency: 'Medium',
          requiredBy: new Date(),
          notes: '',
        });
      } else {
        const data = await response.json();
        Alert.alert('Error', data.error || 'Failed to submit request');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Request Blood</Text>
        <Text style={styles.subtitle}>Fill out the form to request blood</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Patient Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter patient name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

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

        <Text style={styles.label}>Units Required *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of units"
          keyboardType="numeric"
          value={formData.unitsNeeded}
          onChangeText={(text) => setFormData({ ...formData, unitsNeeded: text })}
        />

        <Text style={styles.label}>Patient Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter patient age (optional)"
          keyboardType="numeric"
          value={formData.patientAge}
          onChangeText={(text) => setFormData({ ...formData, patientAge: text })}
        />

        <Text style={styles.label}>Urgency *</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.urgencyScroll}
        >
          {urgencies.map((urgency) => (
            <TouchableOpacity
              key={urgency.value}
              style={[
                styles.urgencyButton,
                formData.urgency === urgency.value && {
                  backgroundColor: urgency.color,
                  borderColor: urgency.color,
                },
              ]}
              onPress={() => setFormData({ ...formData, urgency: urgency.value })}
            >
              <Text
                style={[
                  styles.urgencyText,
                  formData.urgency === urgency.value && styles.urgencyTextActive,
                ]}
              >
                {urgency.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Hospital Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter hospital name"
          value={formData.hospital}
          onChangeText={(text) => setFormData({ ...formData, hospital: text })}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="City, State"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />

        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={formData.contact}
          onChangeText={(text) => setFormData({ ...formData, contact: text })}
        />

        <Text style={styles.label}>Needed By *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {formData.requiredBy.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.requiredBy}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setFormData({ ...formData, requiredBy: selectedDate });
              }
            }}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any additional information..."
          multiline
          numberOfLines={4}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#E53935',
    padding: 30,
    paddingTop: 60,
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
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
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
    height: 100,
    textAlignVertical: 'top',
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bloodTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  urgencyScroll: {
    marginBottom: 10,
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginRight: 8,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  urgencyTextActive: {
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
  submitButton: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
