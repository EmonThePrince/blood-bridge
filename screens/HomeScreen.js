import React from 'react';
import { Center, VStack, Heading, Text, Button, Box } from 'native-base';
import LottieView from 'lottie-react-native';

export default function HomeScreen({ navigation }) {
  return (
    <Center flex={1} px={4} bg="red.50">
      <VStack space={6} w="100%" maxW="400" alignItems="center">
        <Heading mb={2} color="red.700" fontWeight="bold" fontSize="3xl">
          🩸 Blood Bridge
        </Heading>

        <Text fontSize="md" color="red.600" textAlign="center" px={4}>
          Connecting donors and recipients to save lives.
        </Text>

        <Box w="100%" height={200}>
          {/* Replace with your downloaded Lottie file path or use URL */}
          <LottieView
            source={require('../assets/blood-donation.json')}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </Box>

        <VStack space={4} w="100%">
          <Button
            colorScheme="red"
            size="lg"
            rounded="xl"
            shadow={3}
            onPress={() => navigation.navigate('Donor Registration')}
          >
            Register as Donor
          </Button>

          <Button
            colorScheme="blue"
            size="lg"
            rounded="xl"
            shadow={3}
            onPress={() => navigation.navigate('Blood Request')}
          >
            Request Blood
          </Button>

          <Button
            colorScheme="orange"
            size="lg"
            rounded="xl"
            shadow={3}
            onPress={() => navigation.navigate('Donor Dashboard')}
          >
            View Blood Requests
          </Button>

          <Button
            colorScheme="green"
            size="lg"
            rounded="xl"
            shadow={3}
            onPress={() => navigation.navigate('Recipient Dashboard')}
          >
            Find Donors
          </Button>
        </VStack>
      </VStack>
    </Center>
  );
}
