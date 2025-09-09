import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ConnectedStatus = ({ device, disconnectDevice }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for connection indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Fade in animation
    const fadeAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });

    fadeAnimation.start();
    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const handleDisconnect = () => {
    Alert.alert(
      '🔌 ตัดการเชื่อมต่อ',
      `ต้องการตัดการเชื่อมต่อกับ ${device?.name || 'อุปกรณ์'} หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ตัดการเชื่อมต่อ', 
          onPress: disconnectDevice, 
          style: 'destructive' 
        }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Background Elements */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Success Header */}
        <View style={styles.headerSection}>
          <Animated.View 
            style={[
              styles.successIcon,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <LinearGradient
              colors={['#27ae60', '#2ecc71']}
              style={styles.successGradient}
            >
              <Ionicons name="checkmark" size={40} color="#ffffff" />
            </LinearGradient>
          </Animated.View>
          
          <Text style={styles.successTitle}>เชื่อมต่อสำเร็จ!</Text>
          <Text style={styles.successSubtitle}>พร้อมรับข้อมูลจากเซ็นเซอร์</Text>
        </View>

        {/* Device Info Card */}
        <View style={styles.deviceCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.cardGradient}
          >
            <View style={styles.deviceHeader}>
              <View style={styles.deviceIconContainer}>
                <Ionicons name="bluetooth" size={32} color="#3498db" />
                <View style={styles.connectedIndicator}>
                  <View style={styles.connectedDot} />
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={handleDisconnect} 
                style={styles.disconnectButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={28} color="#e74c3c" />
              </TouchableOpacity>
            </View>

            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>
                {device?.name || device?.localName || 'ESP32 Device'}
              </Text>
            </View>

            <View style={styles.connectionStats}>
              <View style={styles.statItem}>
                <Ionicons name="signal" size={20} color="#27ae60" />
                <Text style={styles.statLabel}>สัญญาณแรง</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="shield-checkmark" size={20} color="#3498db" />
                <Text style={styles.statLabel}>ปลอดภัย</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flash" size={20} color="#f39c12" />
                <Text style={styles.statLabel}>พลังงานต่ำ</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>คุณสมบัติที่เปิดใช้งาน</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="analytics" size={24} color="#e74c3c" />
              </View>
              <Text style={styles.featureText}>ข้อมูลเรียลไทม์</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="location" size={24} color="#9b59b6" />
              </View>
              <Text style={styles.featureText}>ตำแหน่ง GPS</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="compass" size={24} color="#3498db" />
              </View>
              <Text style={styles.featureText}>เข็มทิศ</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="camera" size={24} color="#27ae60" />
              </View>
              <Text style={styles.featureText}>ถ่ายภาพ</Text>
            </View>
          </View>
        </View>

        {/* Waiting Message */}
        <View style={styles.waitingSection}>
          <View style={styles.waitingCard}>
            <Ionicons name="hourglass" size={24} color="#f39c12" />
            <Text style={styles.waitingText}>
              กำลังรอข้อมูลจากเซ็นเซอร์...
            </Text>
          </View>
          <Text style={styles.instructionText}>
            ตรวจสอบให้แน่ใจว่า ESP32 กำลังส่งข้อมูล
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: 180,
    height: 180,
    top: -40,
    right: -40,
  },
  circle2: {
    width: 120,
    height: 120,
    bottom: -20,
    left: -20,
  },
  circle3: {
    width: 80,
    height: 80,
    top: '40%',
    left: '85%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  successGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  deviceCard: {
    marginVertical: 20,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deviceIconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  disconnectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfo: {
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'monospace',
  },
  connectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  featuresSection: {
    marginVertical: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  waitingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  waitingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 12,
  },
  waitingText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 12,
  },
  instructionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConnectedStatus; 