import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;

const getResponsiveSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const SuccessPopup = ({ 
  visible, 
  onClose, 
  deviceName = 'ESP32', 
  signalStrength = '-50 dBm',
  title = '🎉 เชื่อมต่อสำเร็จ!',
  message = ''
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // เริ่ม animations เมื่อ popup แสดง
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous animations
      const rotation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );

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

      const floating = Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      rotation.start();
      pulse.start();
      floating.start();

      return () => {
        rotation.stop();
        pulse.stop();
        floating.stop();
      };
    } else {
      // รีเซ็ต animations เมื่อ popup ปิด
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const floatingTranslateY = floatingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.7)" />
      
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={styles.overlayGradient}
        />

        {/* Background Effects */}
        <Animated.View
          style={[
            styles.backgroundEffects,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          <View style={[styles.geometricShape, styles.shape1, {
            width: width * 0.3,
            height: width * 0.3,
          }]} />
          <View style={[styles.geometricShape, styles.shape2, {
            width: width * 0.2,
            height: width * 0.2,
          }]} />
          <View style={[styles.geometricShape, styles.shape3, {
            width: width * 0.15,
            height: width * 0.15,
          }]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.popupContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: floatingTranslateY }
              ],
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
            style={[styles.popup, {
              width: width * 0.85,
              maxWidth: getResponsiveSize(300, 350, 400),
            }]}
          >
            {/* Success Icon with Animation */}
            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconBackground,
                  {
                    transform: [{ scale: pulseScale }],
                    opacity: pulseOpacity,
                  }
                ]}
              />
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={[styles.iconGradient, {
                  width: getResponsiveSize(80, 90, 100),
                  height: getResponsiveSize(80, 90, 100),
                  borderRadius: getResponsiveSize(40, 45, 50),
                }]}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={getResponsiveSize(50, 55, 60)} 
                  color="#ffffff" 
                />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={[styles.title, {
              fontSize: getResponsiveSize(22, 24, 26),
              marginTop: getResponsiveSize(20, 25, 30),
            }]}>
              {title}
            </Text>

            {/* Device Info */}
            <View style={[styles.deviceInfo, {
              marginTop: getResponsiveSize(15, 18, 20),
              marginBottom: getResponsiveSize(20, 25, 30),
            }]}>
              <View style={styles.infoRow}>
                <Ionicons name="bluetooth" size={getResponsiveSize(18, 20, 22)} color="#667eea" />
                <Text style={[styles.infoText, {
                  fontSize: getResponsiveSize(16, 17, 18),
                  marginLeft: getResponsiveSize(8, 10, 12),
                }]}>
                  {deviceName}
                </Text>
              </View>
              
              <View style={[styles.infoRow, {
                marginTop: getResponsiveSize(8, 10, 12),
              }]}>
                                 <Text style={{
                   fontSize: getResponsiveSize(18, 20, 22),
                   color: "#10b981",
                 }}>
                   📡
                 </Text>
                <Text style={[styles.infoText, {
                  fontSize: getResponsiveSize(14, 15, 16),
                  marginLeft: getResponsiveSize(8, 10, 12),
                }]}>
                  Signal: {signalStrength}
                </Text>
              </View>
            </View>

            {/* Success Message */}
            {message && (
              <View style={[styles.messageContainer, {
                marginBottom: getResponsiveSize(25, 30, 35),
              }]}>
                <Text style={[styles.message, {
                  fontSize: getResponsiveSize(14, 15, 16),
                }]}>
                  {message}
                </Text>
              </View>
            )}

            {/* Features List */}
            <View style={[styles.featuresList, {
              marginBottom: getResponsiveSize(25, 30, 35),
            }]}>
              <View style={styles.featureItem}>
                                 <Text style={{
                   fontSize: getResponsiveSize(16, 18, 20),
                   color: "#10b981",
                 }}>
                   ✅
                 </Text>
                <Text style={[styles.featureText, {
                  fontSize: getResponsiveSize(13, 14, 15),
                  marginLeft: getResponsiveSize(8, 9, 10),
                }]}>
                  พบ Service และ Characteristic
                </Text>
              </View>
              
              <View style={[styles.featureItem, {
                marginTop: getResponsiveSize(6, 8, 10),
              }]}>
                                 <Text style={{
                   fontSize: getResponsiveSize(16, 18, 20),
                   color: "#667eea",
                 }}>
                   🧭
                 </Text>
                <Text style={[styles.featureText, {
                  fontSize: getResponsiveSize(13, 14, 15),
                  marginLeft: getResponsiveSize(8, 9, 10),
                }]}>
                  อาซิมูทมาจากเข็มทิศโทรศัพท์
                </Text>
              </View>
              
              <View style={[styles.featureItem, {
                marginTop: getResponsiveSize(6, 8, 10),
              }]}>
                                 <Text style={{
                   fontSize: getResponsiveSize(16, 18, 20),
                   color: "#f59e0b",
                 }}>
                   🔧
                 </Text>
                <Text style={[styles.featureText, {
                  fontSize: getResponsiveSize(13, 14, 15),
                  marginLeft: getResponsiveSize(8, 9, 10),
                }]}>
                  ข้อมูลอื่นมาจาก ESP32
                </Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeButton, {
                paddingVertical: getResponsiveSize(12, 14, 16),
                paddingHorizontal: getResponsiveSize(30, 35, 40),
                borderRadius: getResponsiveSize(25, 30, 35),
              }]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
              >
                <Text style={[styles.closeButtonText, {
                  fontSize: getResponsiveSize(16, 17, 18),
                }]}>
                  เริ่มใช้งาน
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundEffects: {
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shape1: {
    top: '20%',
    right: '10%',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    bottom: '25%',
    left: '15%',
    borderRadius: 50,
  },
  shape3: {
    top: '60%',
    right: '20%',
    borderRadius: 15,
    transform: [{ rotate: '30deg' }],
  },
  popupContainer: {
    alignItems: 'center',
  },
  popup: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  iconGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  deviceInfo: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  messageContainer: {
    alignSelf: 'stretch',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  closeButton: {
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default SuccessPopup; 