import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Platform,
  Animated,
  TouchableOpacity,
  Linking,
  Alert
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

const URUFooter = () => {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Scale animation
    const scale = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    glow.start();
    scale.start();

    return () => {
      glow.stop();
      scale.stop();
    };
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const scaleValue = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const handleURULink = async () => {
    const url = 'https://rawangphai.uru.ac.th/';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'ไม่สามารถเปิดลิงก์ได้',
          'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
          [{ text: 'ตกลง', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถเปิดลิงก์ได้ กรุณาลองใหม่อีกครั้ง',
        [{ text: 'ตกลง', style: 'default' }]
      );
    }
  };

  return (
    <View style={styles.footerContainer}>
      <Animated.View
        style={[
          styles.footerWrapper,
          {
            transform: [{ scale: scaleValue }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleURULink}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4f46e5', '#3b82f6', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.footerGradient}
          >
            {/* Glow Effect */}
            <Animated.View
              style={[
                styles.glowEffect,
                { opacity: glowOpacity }
              ]}
            />
            
            <View style={styles.footerContent}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={getResponsiveSize(18, 20, 22)} 
                  color="#ffffff" 
                />
              </View>
              
              <Text style={[styles.compactTitle, {
                fontSize: getResponsiveSize(11, 12, 13),
              }]} numberOfLines={2} adjustsFontSizeToFit>
                ระบบบริหารจัดการภัยพิบัติ{'\n'}มหาวิทยาลัยราชภัฏอุตรดิตถ์
              </Text>
              
              <View style={styles.arrowContainer}>
                <Ionicons 
                  name="arrow-forward" 
                  size={getResponsiveSize(16, 18, 20)} 
                  color="rgba(255, 255, 255, 0.9)" 
                />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingBottom: Platform.OS === 'ios' ? getResponsiveSize(25, 28, 32) : getResponsiveSize(16, 20, 24),
    paddingTop: getResponsiveSize(8, 10, 12),
    backgroundColor: 'transparent',
  },
  footerWrapper: {
    borderRadius: getResponsiveSize(20, 22, 24),
    overflow: 'hidden',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  footerButton: {
    borderRadius: getResponsiveSize(20, 22, 24),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerGradient: {
    paddingHorizontal: getResponsiveSize(18, 20, 24),
    paddingVertical: getResponsiveSize(14, 16, 18),
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: getResponsiveSize(20, 22, 24),
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  iconContainer: {
    width: getResponsiveSize(32, 36, 40),
    height: getResponsiveSize(32, 36, 40),
    borderRadius: getResponsiveSize(16, 18, 20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  compactTitle: {
    flex: 1,
    marginHorizontal: getResponsiveSize(10, 12, 14),
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
    lineHeight: getResponsiveSize(14, 16, 18),
  },
  textContainer: {
    flex: 1,
    marginHorizontal: getResponsiveSize(18, 20, 22),
  },
  title: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 2,
  },
  arrowContainer: {
    width: getResponsiveSize(28, 32, 36),
    height: getResponsiveSize(28, 32, 36),
    borderRadius: getResponsiveSize(14, 16, 18),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default URUFooter; 