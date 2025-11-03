import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

export default function BloodDropLoader({ size = 60, color = '#E53935' }) {
  const drop1 = useRef(new Animated.Value(0)).current;
  const drop2 = useRef(new Animated.Value(0)).current;
  const drop3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDropAnimation = (dropValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dropValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dropValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation1 = createDropAnimation(drop1, 0);
    const animation2 = createDropAnimation(drop2, 300);
    const animation3 = createDropAnimation(drop3, 600);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [drop1, drop2, drop3]);

  const getDropStyle = (animatedValue) => ({
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 80],
        }),
      },
    ],
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.8, 0],
    }),
  });

  const dropSize = size * 0.3;

  return (
    <View style={[styles.container, { height: size + 40 }]}>
      <View style={styles.dropContainer}>
        {/* Drop 1 */}
        <Animated.View style={[styles.drop, getDropStyle(drop1), { 
          width: dropSize, 
          height: dropSize * 1.3,
          backgroundColor: color,
          left: size * 0.2,
        }]}>
          <View style={[styles.dropCircle, { 
            width: dropSize, 
            height: dropSize, 
            borderRadius: dropSize / 2,
            backgroundColor: color,
          }]} />
        </Animated.View>

        {/* Drop 2 */}
        <Animated.View style={[styles.drop, getDropStyle(drop2), { 
          width: dropSize, 
          height: dropSize * 1.3,
          backgroundColor: color,
          left: size * 0.45,
        }]}>
          <View style={[styles.dropCircle, { 
            width: dropSize, 
            height: dropSize, 
            borderRadius: dropSize / 2,
            backgroundColor: color,
          }]} />
        </Animated.View>

        {/* Drop 3 */}
        <Animated.View style={[styles.drop, getDropStyle(drop3), { 
          width: dropSize, 
          height: dropSize * 1.3,
          backgroundColor: color,
          left: size * 0.7,
        }]}>
          <View style={[styles.dropCircle, { 
            width: dropSize, 
            height: dropSize, 
            borderRadius: dropSize / 2,
            backgroundColor: color,
          }]} />
        </Animated.View>
      </View>

      {/* Puddle */}
      <View style={[styles.puddle, { 
        width: size * 0.8, 
        backgroundColor: color,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropContainer: {
    flexDirection: 'row',
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
  },
  drop: {
    position: 'absolute',
    top: 0,
  },
  dropCircle: {
    position: 'absolute',
    top: 0,
  },
  puddle: {
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    opacity: 0.4,
  },
});
