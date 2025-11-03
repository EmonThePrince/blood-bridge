import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

export default function BloodDropLoader({ size = 60, color = '#E53935' }) {
  const drop1 = useRef(new Animated.Value(0)).current;
  const drop2 = useRef(new Animated.Value(0)).current;
  const drop3 = useRef(new Animated.Value(0)).current;
  const opacity1 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(1)).current;
  const opacity3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createDropAnimation = (dropValue, opacityValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(dropValue, {
              toValue: 1,
              duration: 1200,
              easing: Easing.cubic,
              useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
              toValue: 0,
              duration: 1200,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dropValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    const animation1 = createDropAnimation(drop1, opacity1, 0);
    const animation2 = createDropAnimation(drop2, opacity2, 400);
    const animation3 = createDropAnimation(drop3, opacity3, 800);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, []);

  const createDropStyle = (dropValue, opacityValue) => ({
    transform: [
      {
        translateY: dropValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, size * 1.5],
        }),
      },
    ],
    opacity: opacityValue,
  });

  return (
    <View style={styles.container}>
      <View style={styles.dropContainer}>
        {/* Drop 1 */}
        <Animated.View style={[styles.dropWrapper, { left: size * 0.2 }]}>
          <Animated.View style={[createDropStyle(drop1, opacity1)]}>
            <BloodDrop size={size * 0.35} color={color} />
          </Animated.View>
        </Animated.View>

        {/* Drop 2 */}
        <Animated.View style={[styles.dropWrapper, { left: size * 0.45 }]}>
          <Animated.View style={[createDropStyle(drop2, opacity2)]}>
            <BloodDrop size={size * 0.35} color={color} />
          </Animated.View>
        </Animated.View>

        {/* Drop 3 */}
        <Animated.View style={[styles.dropWrapper, { left: size * 0.7 }]}>
          <Animated.View style={[createDropStyle(drop3, opacity3)]}>
            <BloodDrop size={size * 0.35} color={color} />
          </Animated.View>
        </Animated.View>
      </View>

      {/* Collection puddle at bottom */}
      <View style={[styles.puddle, { width: size, backgroundColor: color }]} />
    </View>
  );
}

// Blood drop shape component
function BloodDrop({ size, color }) {
  return (
    <View
      style={[
        styles.drop,
        {
          width: size,
          height: size * 1.2,
          backgroundColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.dropTop,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  dropContainer: {
    flexDirection: 'row',
    position: 'relative',
    width: 100,
    height: 100,
  },
  dropWrapper: {
    position: 'absolute',
    top: 0,
  },
  drop: {
    position: 'relative',
  },
  dropTop: {
    position: 'absolute',
    top: 0,
  },
  puddle: {
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    opacity: 0.3,
  },
});
