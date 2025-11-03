import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BloodDropLoader from './BloodDropLoader';

/**
 * Loading indicator with progressive messages for slow API calls
 * Helpful for users when Render.com backend is spinning up (can take 30-60s)
 */
export default function LoadingIndicator({ 
  loading, 
  message = 'Loading...', 
  showProgressiveMessages = true 
}) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!loading || !showProgressiveMessages) {
      setCurrentMessage(message);
      return;
    }

    // Progressive messages for long loads
    const messages = [
      { delay: 0, text: message },
      { delay: 3000, text: 'Connecting to server...' },
      { delay: 10000, text: 'Server is starting up...' },
      { delay: 20000, text: 'Almost there...' },
      { delay: 30000, text: 'Thank you for your patience...' },
    ];

    const timers = messages.map(({ delay, text }) =>
      setTimeout(() => setCurrentMessage(text), delay)
    );

    // Animate dots
    const dotTimer = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(dotTimer);
      setDots('');
    };
  }, [loading, message, showProgressiveMessages]);

  if (!loading) return null;

  return (
    <View style={styles.container}>
      <BloodDropLoader size={70} />
      <Text style={styles.message}>
        {currentMessage}
        {showProgressiveMessages && dots}
      </Text>
      {showProgressiveMessages && (
        <Text style={styles.hint}>
          First load may take up to 60 seconds
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
