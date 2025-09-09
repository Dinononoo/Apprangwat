import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Dimensions, 
  Platform,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Responsive dimensions
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;

const getResponsiveSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const Header = ({ title, subtitle }) => {
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating animation for background elements
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    );

    // Pulse animation for status indicator
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    floating.start();
    rotation.start();
    pulse.start();

    return () => {
      floating.stop();
      rotation.stop();
      pulse.stop();
    };
  }, []);

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0.3],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerContainer, {
          paddingTop: Platform.OS === 'ios' ? (StatusBar.currentHeight || 44) + 10 : (StatusBar.currentHeight || 0) + 15,
          paddingBottom: getResponsiveSize(25, 30, 35),
          paddingHorizontal: getResponsiveSize(20, 25, 30),
        }]}
      >
        {/* Animated Background Elements */}
        <Animated.View
          style={[
            styles.backgroundPattern,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          <View style={[styles.geometricShape, styles.shape1, {
            width: getResponsiveSize(80, 100, 120),
            height: getResponsiveSize(80, 100, 120),
          }]} />
          <View style={[styles.geometricShape, styles.shape2, {
            width: getResponsiveSize(50, 60, 70),
            height: getResponsiveSize(50, 60, 70),
          }]} />
          <View style={[styles.geometricShape, styles.shape3, {
            width: getResponsiveSize(35, 40, 45),
            height: getResponsiveSize(35, 40, 45),
          }]} />
        </Animated.View>

        {/* Gradient Orbs */}
        <View style={styles.orbContainer}>
          <LinearGradient
            colors={['rgba(138, 43, 226, 0.2)', 'rgba(30, 144, 255, 0.1)']}
            style={[styles.orb, styles.orb1, {
              width: width * 0.3,
              height: width * 0.3,
            }]}
          />
          <LinearGradient
            colors={['rgba(255, 20, 147, 0.15)', 'rgba(255, 165, 0, 0.1)']}
            style={[styles.orb, styles.orb2, {
              width: width * 0.25,
              height: width * 0.25,
            }]}
          />
        </View>

        <Animated.View
          style={[
            styles.headerContent,
            { transform: [{ translateY: floatingTranslateY }] }
          ]}
        >
          {/* Glass Morphism App Icon */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
            style={[styles.appIconContainer, {
              width: getResponsiveSize(55, 60, 65),
              height: getResponsiveSize(55, 60, 65),
              borderRadius: getResponsiveSize(27.5, 30, 32.5),
            }]}
          >
            <View style={[styles.appIcon, {
              width: getResponsiveSize(45, 50, 55),
              height: getResponsiveSize(45, 50, 55),
              borderRadius: getResponsiveSize(22.5, 25, 27.5),
            }]}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.iconGradient}
              >
                <Ionicons 
                  name="pulse" 
                  size={getResponsiveSize(22, 25, 28)} 
                  color="#ffffff" 
                />
              </LinearGradient>
            </View>
          </LinearGradient>

          {/* Modern Title Section */}
          <View style={[styles.titleSection, {
            marginLeft: getResponsiveSize(16, 18, 20),
          }]}>
            <Text 
              style={[styles.title, {
                fontSize: getResponsiveSize(16, 18, 20),
              }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {title}
            </Text>
            {subtitle && (
              <View style={styles.subtitleContainer}>
                <View style={[styles.subtitleDot, {
                  width: getResponsiveSize(4, 5, 5),
                  height: getResponsiveSize(4, 5, 5),
                  borderRadius: getResponsiveSize(2, 2.5, 2.5),
                }]} />
                <Text style={[styles.subtitle, {
                  fontSize: getResponsiveSize(13, 14, 15),
                  marginLeft: getResponsiveSize(8, 9, 10),
                }]}>{subtitle}</Text>
              </View>
            )}
          </View>

          {/* Modern Status Indicator */}
          <View style={[styles.statusContainer, {
            width: getResponsiveSize(45, 50, 55),
            height: getResponsiveSize(45, 50, 55),
            borderRadius: getResponsiveSize(22.5, 25, 27.5),
          }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.statusGlass}
            >
              <View style={[styles.statusIndicator, {
                width: getResponsiveSize(12, 14, 16),
                height: getResponsiveSize(12, 14, 16),
                borderRadius: getResponsiveSize(6, 7, 8),
              }]}>
                <Animated.View
                  style={[
                    styles.statusPulse,
                    {
                      width: getResponsiveSize(20, 22, 24),
                      height: getResponsiveSize(20, 22, 24),
                      borderRadius: getResponsiveSize(10, 11, 12),
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity,
                    }
                  ]}
                />
                <View style={[styles.statusDot, {
                  width: getResponsiveSize(8, 9, 10),
                  height: getResponsiveSize(8, 9, 10),
                  borderRadius: getResponsiveSize(4, 4.5, 5),
                }]} />
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Tech Line Decoration */}
        <View style={[styles.techDecoration, {
          marginTop: getResponsiveSize(15, 18, 20),
        }]}>
          <View style={[styles.techLine, {
            height: getResponsiveSize(1, 1.5, 2),
          }]} />
          <View style={[styles.techDots, {
            marginHorizontal: getResponsiveSize(15, 18, 20),
          }]}>
            <View style={[styles.techDot, {
              width: getResponsiveSize(4, 5, 6),
              height: getResponsiveSize(4, 5, 6),
              borderRadius: getResponsiveSize(2, 2.5, 3),
            }]} />
            <View style={[styles.techDot, {
              width: getResponsiveSize(4, 5, 6),
              height: getResponsiveSize(4, 5, 6),
              borderRadius: getResponsiveSize(2, 2.5, 3),
              marginHorizontal: getResponsiveSize(6, 7, 8),
            }]} />
            <View style={[styles.techDot, {
              width: getResponsiveSize(4, 5, 6),
              height: getResponsiveSize(4, 5, 6),
              borderRadius: getResponsiveSize(2, 2.5, 3),
            }]} />
          </View>
          <View style={[styles.techLine, {
            height: getResponsiveSize(1, 1.5, 2),
          }]} />
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  shape1: {
    top: -20,
    right: -30,
    borderRadius: 15,
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    bottom: -15,
    left: -20,
    borderRadius: 50,
  },
  shape3: {
    top: '50%',
    right: 20,
    borderRadius: 8,
    transform: [{ rotate: '30deg' }],
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
  orb1: {
    top: -20,
    right: -50,
  },
  orb2: {
    bottom: -30,
    left: -40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  appIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleDot: {
    backgroundColor: '#667eea',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusGlass: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusIndicator: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPulse: {
    position: 'absolute',
    backgroundColor: 'rgba(39, 174, 96, 0.3)',
  },
  statusDot: {
    backgroundColor: '#27ae60',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  techDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  techLine: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  techDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  techDot: {
    backgroundColor: 'rgba(102, 126, 234, 0.8)',
  },
});

export default Header;