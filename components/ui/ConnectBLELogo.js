import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

const getResponsiveSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

// Get safe area for better mobile layout
const getSafeAreaTop = () => {
  if (Platform.OS === 'ios') {
    return height > 800 ? 44 : 20; // Handle iPhone X and above
  }
  return StatusBar.currentHeight || 0;
};

const ConnectBLELogo = ({ isScanning, scanAndConnect, scanAnim }) => {
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation for background elements
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    floating.start();
    rotation.start();
    glow.start();

    return () => {
      floating.stop();
      rotation.stop();
      glow.stop();
    };
  }, []);

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Responsive sizes
  const buttonSize = getResponsiveSize(width * 0.6, width * 0.65, width * 0.7);
  const headerPadding = getResponsiveSize(20, 25, 30);
  const iconSize = getResponsiveSize(24, 28, 32);
  const titleSize = getResponsiveSize(28, 32, 36);
  const safeAreaTop = getSafeAreaTop();

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />
      
      {/* Animated Background Elements */}
      <Animated.View
        style={[
          styles.backgroundPattern,
          { transform: [{ rotate: rotateInterpolate }] }
        ]}
      >
        <View style={[styles.geometricShape, styles.shape1, { 
          width: width * 0.25, 
          height: width * 0.25,
          top: height * 0.1,
          right: width * 0.1 
        }]} />
        <View style={[styles.geometricShape, styles.shape2, { 
          width: width * 0.15, 
          height: width * 0.15,
          bottom: height * 0.15,
          left: width * 0.1 
        }]} />
        <View style={[styles.geometricShape, styles.shape3, { 
          width: width * 0.2, 
          height: width * 0.2,
          top: height * 0.3,
          right: width * 0.05 
        }]} />
      </Animated.View>

      {/* Gradient Orbs */}
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={['rgba(138, 43, 226, 0.3)', 'rgba(30, 144, 255, 0.2)']}
          style={[styles.orb, styles.orb1, {
            width: width * 0.5,
            height: width * 0.5,
            top: height * 0.1,
            right: -width * 0.15
          }]}
        />
        <LinearGradient
          colors={['rgba(255, 20, 147, 0.3)', 'rgba(255, 165, 0, 0.2)']}
          style={[styles.orb, styles.orb2, {
            width: width * 0.4,
            height: width * 0.4,
            bottom: height * 0.1,
            left: -width * 0.1
          }]}
        />
        <LinearGradient
          colors={['rgba(0, 255, 127, 0.3)', 'rgba(0, 191, 255, 0.2)']}
          style={[styles.orb, styles.orb3, {
            width: width * 0.25,
            height: width * 0.25,
            top: height * 0.45,
            left: width * 0.7
          }]}
        />
      </View>

      <View 
        style={[styles.mainContainer, {
          paddingTop: safeAreaTop + getResponsiveSize(20, 30, 40),
          paddingBottom: getResponsiveSize(30, 40, 50),
          paddingHorizontal: width * 0.08,
        }]}
      >
        <Animated.View
          style={[
            styles.content,
            { 
              transform: [{ translateY: floatingTranslateY }],
              marginTop: getResponsiveSize(-60, -80, -100),
            }
          ]}
        >
          {/* Ultra Modern Bluetooth Connection Button */}
          <View style={styles.mainButtonContainer}>
            <TouchableOpacity
              onPress={scanAndConnect}
              disabled={isScanning}
              style={[styles.neumorphicButton, {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
              }]}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isScanning 
                  ? ['#4a5568', '#2d3748'] 
                  : ['#667eea', '#764ba2', '#6c5ce7']
                }
                style={[styles.buttonGradient, {
                  borderRadius: buttonSize / 2,
                }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Enhanced Animated Rings */}
                {!isScanning && (
                  <>
                    <Animated.View
                      style={[
                        styles.animatedRing,
                        styles.ring1,
                        {
                          borderRadius: buttonSize / 2,
                          opacity: scanAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 0]
                          }),
                          transform: [{
                            scale: scanAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.8]
                            })
                          }]
                        }
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.animatedRing,
                        styles.ring2,
                        {
                          borderRadius: buttonSize / 2,
                          opacity: scanAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 0]
                          }),
                          transform: [{
                            scale: scanAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 2.2]
                            })
                          }]
                        }
                      ]}
                    />
                    <Animated.View
                      style={[
                        styles.animatedRing,
                        styles.ring3,
                        {
                          borderRadius: buttonSize / 2,
                          opacity: scanAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.4, 0]
                          }),
                          transform: [{
                            scale: scanAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 2.6]
                            })
                          }]
                        }
                      ]}
                    />
                  </>
                )}

                {/* Enhanced Glow Effect */}
                <Animated.View
                  style={[
                    styles.glowEffect,
                    {
                      width: buttonSize * 1.4,
                      height: buttonSize * 1.4,
                      borderRadius: (buttonSize * 1.4) / 2,
                      opacity: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 0.6]
                      }),
                      transform: [{
                        scale: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.1]
                        })
                      }]
                    }
                  ]}
                />

                {/* Button Content */}
                <View style={styles.buttonInner}>
                  {isScanning ? (
                    <View style={styles.scanningContent}>
                      <ActivityIndicator 
                        size={getResponsiveSize("large", "large", "large")} 
                        color="#ffffff" 
                        style={styles.spinner}
                      />
                      <View style={styles.scanningDots}>
                        <View style={[styles.scanDot, styles.dot1, {
                          width: getResponsiveSize(8, 9, 10),
                          height: getResponsiveSize(8, 9, 10),
                          borderRadius: getResponsiveSize(4, 4.5, 5),
                        }]} />
                        <View style={[styles.scanDot, styles.dot2, {
                          width: getResponsiveSize(8, 9, 10),
                          height: getResponsiveSize(8, 9, 10),
                          borderRadius: getResponsiveSize(4, 4.5, 5),
                        }]} />
                        <View style={[styles.scanDot, styles.dot3, {
                          width: getResponsiveSize(8, 9, 10),
                          height: getResponsiveSize(8, 9, 10),
                          borderRadius: getResponsiveSize(4, 4.5, 5),
                        }]} />
                      </View>
                      <Text style={[styles.scanningText, {
                        fontSize: getResponsiveSize(20, 22, 24)
                      }]}>SCANNING</Text>
                      <Text style={[styles.scanningSubtext, {
                        fontSize: getResponsiveSize(14, 15, 16)
                      }]}>Finding devices...</Text>
                    </View>
                  ) : (
                    <View style={styles.connectContent}>
                      <View style={styles.bluetoothIconContainer}>
                        <Ionicons 
                          name="bluetooth" 
                          size={getResponsiveSize(50, 55, 60)} 
                          color="#ffffff" 
                        />
                        <Animated.View style={[styles.bluetoothPulse, {
                          borderRadius: getResponsiveSize(30, 33, 36),
                          transform: [{
                            scale: glowAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.2]
                            })
                          }],
                          opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.8]
                          })
                        }]} />
                      </View>
                      <Text style={[styles.connectText, {
                        fontSize: getResponsiveSize(24, 26, 28)
                      }]}>CONNECT</Text>
                      <Text style={[styles.connectSubtext, {
                        fontSize: getResponsiveSize(16, 17, 18)
                      }]}>Tap to connect ESP32</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Minimal Status Text */}
          <Text style={[styles.minimalistStatus, {
            fontSize: getResponsiveSize(16, 17, 18),
            marginTop: getResponsiveSize(50, 55, 60),
          }]}>
            {isScanning ? 'Discovering devices...' : 'Ready to connect'}
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  geometricShape: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shape1: {
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    borderRadius: 50,
  },
  shape3: {
    borderRadius: 10,
  },
  orbContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 1000,
  },
  orb1: {},
  orb2: {},
  orb3: {},
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonContainer: {
    alignItems: 'center',
    marginBottom: getResponsiveSize(20, 25, 30),
  },
  neumorphicButton: {
    shadowColor: '#000',
    shadowOffset: { width: -8, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  animatedRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    width: '100%',
    height: '100%',
  },
  ring1: {},
  ring2: {},
  ring3: {},
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(102, 126, 234, 0.4)',
  },
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningContent: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 12,
  },
  scanningDots: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scanDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 2,
  },
  dot1: { opacity: 0.3 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 1 },
  scanningText: {
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 1,
  },
  scanningSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
    letterSpacing: 1,
  },
  connectContent: {
    alignItems: 'center',
  },
  bluetoothIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  bluetoothPulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  connectText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  connectSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
    letterSpacing: 1,
  },
  minimalistStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: getResponsiveSize(40, 45, 50),
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default ConnectBLELogo;