import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const SaveOfflinePopup = ({ visible, onClose, areaName, areaData }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <Animated.View 
            style={[
              styles.popupContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(39, 174, 96, 0.95)', 'rgba(46, 204, 113, 0.95)']}
              style={styles.popupGradient}
            >
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="checkmark-circle" size={64} color="white" />
                </View>
              </View>

              {/* Title */}
              <Text style={styles.title}>บันทึกออฟไลน์สำเร็จ!</Text>

              {/* Area Name */}
              <Text style={styles.areaName}>"{areaName}"</Text>

              {/* Summary */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Ionicons name="location" size={20} color="white" />
                  <Text style={styles.summaryText}>
                    GPS: {areaData?.location?.latitude?.toFixed(6) || '--'}, {areaData?.location?.longitude?.toFixed(6) || '--'}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Ionicons name="compass" size={20} color="white" />
                  <Text style={styles.summaryText}>
                    อาซิมูท: {areaData?.azimuth || 0}°
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Ionicons name="analytics" size={20} color="white" />
                  <Text style={styles.summaryText}>
                    จุดวัด: 2 จุด | รูปภาพ: {((areaData?.points?.point1?.hasImage ? 1 : 0) + (areaData?.points?.point2?.hasImage ? 1 : 0))}/2
                  </Text>
                </View>
              </View>

              {/* Info */}
              <Text style={styles.infoText}>
                💾 ข้อมูลถูกบันทึกแบบออฟไลน์แล้ว{'\n'}
                🚀 สามารถส่งไปเซิร์ฟเวอร์ได้ในหน้ารายการพื้นที่
              </Text>

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>ตกลง</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  popupGradient: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  areaName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryContainer: {
    width: '100%',
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});

export default SaveOfflinePopup;