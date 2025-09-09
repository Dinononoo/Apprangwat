import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import CompassView from './CompassView';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const TELESCOPE_SIZE = Math.min(width * 0.9, height * 0.55);

const TelescopeView = React.forwardRef(({
  gpsData,
  bleData,
  location,
  updateCompassData,
  saveCurrentPoint,
  currentPoint,
  setImagePoint1,
  setImagePoint2,
  addImageToPoint,
}, ref) => {
  const [realCompassData, setRealCompassData] = useState({ heading: 0, direction: 'N' });
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState('back');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const crosshairAnim = useRef(new Animated.Value(1)).current;
  const cameraRef = useRef(null);

  useEffect(() => {
    checkCameraPermission();
    startAnimations();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const { Camera } = require('expo-camera');
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      setIsLoading(false);
    } catch (error) {
      console.log('❌ Camera permission error:', error);
      setHasPermission(false);
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Crosshair animation
    const crosshairAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(crosshairAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(crosshairAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    crosshairAnimation.start();
  };

  const handleCompassUpdate = (compassData) => {
    setRealCompassData(compassData);
    if (updateCompassData) {
      updateCompassData(compassData);
    }
  };

  // ฟังก์ชันครอปรูปเป็นวงกลมจริงๆ
  const cropImageToCircle = async (uri) => {
    try {
      console.log('🔄 Cropping telescope image to perfect circle...');
      
      // ปรับขนาดเป็นสี่เหลี่ยมจัตุรัส
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: 400,
              height: 400
            }
          }
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.PNG, // ใช้ PNG เพื่อรองรับ transparency
        }
      );

      console.log('✅ Telescope image cropped to perfect circle:', result);
      return result;
    } catch (error) {
      console.error('❌ Telescope circle crop error:', error);
      return { uri }; // ส่งกลับรูปเดิมถ้าครอปไม่ได้
    }
  };

  // ฟังก์ชันถ่ายภาพอัตโนมัติจากกล้องวงกลม
  const takePhotoFromCamera = async () => {
    if (!cameraRef.current || !hasPermission) {
      console.log('❌ Camera not ready for photo capture');
      return null;
    }

    try {
      console.log('📸 Taking photo from telescope camera...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        maxWidth: 500,
        maxHeight: 500
      });

      if (photo?.uri) {
        // ใช้รูปภาพโดยตรง (ไม่มีการ flip)
        let processed = { uri: photo.uri };

        // ครอปรูปเป็นวงกลมก่อนส่งกลับ
        const croppedPhoto = await cropImageToCircle(processed.uri);
        const capturedImage = {
          uri: croppedPhoto.uri,
          width: 400,
          height: 400,
          type: 'image/png'
        };
        console.log('✅ Photo captured and cropped to circle from telescope camera:', capturedImage);
        return capturedImage;
      }
    } catch (error) {
      console.error('❌ Photo capture error:', error);
    }
    return null;
  };

  // Expose takePhotoFromCamera function to parent
  React.useImperativeHandle(ref, () => ({
    takePhotoFromCamera
  }), [takePhotoFromCamera]);

  // ข้อมูลที่จะแสดง
  const latitude = location?.coords?.latitude || gpsData?.latitude || 0;
  const longitude = location?.coords?.longitude || gpsData?.longitude || 0;
  const distance = bleData?.distance || 0;
  const elevation = bleData?.elevation || 0;
  const azimuth = realCompassData.heading || 0;

  const formatValue = (value, decimals = 1) => {
    return typeof value === 'number' ? value.toFixed(decimals) : '--';
  };

  const formatCoordinate = (value) => {
    return typeof value === 'number' ? value.toFixed(6) : '--';
  };

  const getDirectionFromAzimuth = (azimuth) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(azimuth / 45) % 8;
    return directions[index];
  };

  const renderCameraContent = () => {
    const effectiveIsFlipped = cameraType === 'front';
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>กำลังโหลดกล้อง...</Text>
        </View>
      );
    }

    if (!hasPermission) {
      return (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>ไม่มีสิทธิ์เข้าถึงกล้อง</Text>
          <Text style={styles.fallbackSubText}>กรุณาอนุญาตการเข้าถึงกล้องในตั้งค่า</Text>
          <TouchableOpacity style={styles.retryButton} onPress={checkCameraPermission}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      );
    }

    try {
      // ลอง CameraView ก่อน (SDK 50+)
      const { CameraView } = require('expo-camera');
      if (CameraView) {
        return (
          <View
            style={[
              styles.flipWrapper,
              { borderRadius: (TELESCOPE_SIZE - 20) / 2 },
              effectiveIsFlipped && styles.flipWrapperFlipped,
            ]}
          >
            {React.createElement(CameraView, {
              ref: cameraRef,
              style: [
                styles.cameraInner,
                effectiveIsFlipped ? styles.cameraFlipped : null,
              ],
              facing: cameraType,
              onCameraReady: () => {
                console.log('📸 Camera ready!');
              },
              onMountError: (error) => {
                console.log('❌ CameraView mount error:', error);
                setHasPermission(false);
              },
            })}
          </View>
        );
      }
      
      // ลอง Camera แบบเก่า
      const { Camera } = require('expo-camera');
      if (Camera) {
        return (
          <View
            style={[
              styles.flipWrapper,
              { borderRadius: (TELESCOPE_SIZE - 20) / 2 },
              effectiveIsFlipped && styles.flipWrapperFlipped,
            ]}
          >
            {React.createElement(Camera, {
              ref: cameraRef,
              style: [
                styles.cameraInner,
                effectiveIsFlipped ? styles.cameraFlipped : null,
              ],
              type: cameraType === 'back' ? 'back' : 'front',
              ratio: "1:1",
              onCameraReady: () => {
                console.log('📸 Camera ready!');
              },
              onMountError: (error) => {
                console.log('❌ Camera mount error:', error);
                setHasPermission(false);
              },
            })}
          </View>
        );
      }
    } catch (error) {
      console.log('❌ Camera import error:', error);
    }

    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>ไม่สามารถโหลดกล้องได้</Text>
        <Text style={styles.fallbackSubText}>กรุณาตรวจสอบการติดตั้ง expo-camera</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.mainFrame}
      >
        <View style={styles.centerSection}>
          {/* กล้องวงกลม */}
          <View style={[styles.cameraCircle, { width: TELESCOPE_SIZE, height: TELESCOPE_SIZE, borderRadius: TELESCOPE_SIZE / 2 }]}>
            <View style={[
              styles.cameraContainer,
              {
                width: TELESCOPE_SIZE - 20,
                height: TELESCOPE_SIZE - 20,
                borderRadius: (TELESCOPE_SIZE - 20) / 2,
                // flip container for front camera compatibility
                transform: [{ scaleX: cameraType === 'front' ? -1 : 1 }]
              }
            ]}>
              {renderCameraContent()}
            </View>
            
            {/* Sensor Data Overlay */}
            <View style={styles.sensorOverlayContainer}>
              <View style={styles.sensorOverlayLeft}>
                <Text style={styles.sensorOverlayLabel}>ระยะทาง</Text>
                <Text style={styles.sensorOverlayValue}>{formatValue(distance)} m</Text>
              </View>
              <View style={styles.sensorOverlayRight}>
                <Text style={styles.sensorOverlayLabel}>มุมเงย</Text>
                <Text style={styles.sensorOverlayValue}>{formatValue(elevation)}°</Text>
              </View>
            </View>

            {/* Crosshair */}
            <Animated.View 
              style={[
                styles.crosshair,
                {
                  transform: [{ scale: crosshairAnim }]
                }
              ]}
            >
              <View style={styles.crosshairHorizontal} />
              <View style={styles.crosshairVertical} />
              <View style={styles.crosshairCenter} />
            </Animated.View>

            {/* Short Marks on Crosshair */}
            <View style={styles.crosshairMarksContainer}>
              {/* ขีดบนเส้นแนวนอน (ซ้าย-ขวา) - ขยับขึ้น */}
              <View style={[styles.crosshairMark, styles.crosshairMarkVertical, { left: '25%', top: '45%' }]} />
              <View style={[styles.crosshairMark, styles.crosshairMarkVertical, { right: '25%', top: '45%' }]} />
              
              {/* ขีดบนเส้นแนวตั้ง (บน-ล่าง) - ขยับไปซ้าย */}
              <View style={[styles.crosshairMark, styles.crosshairMarkHorizontal, { top: '25%', left: '45%' }]} />
              <View style={[styles.crosshairMark, styles.crosshairMarkHorizontal, { bottom: '25%', left: '45%' }]} />
            </View>

            {/* Pulse ring */}
            <Animated.View 
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0.3, 0]
                  })
                }
              ]}
            />
          </View>

          {/* ข้อมูลเซ็นเซอร์ */}
          <View style={styles.modernBottomContainer}>
            <View style={styles.topDataRow}>
              <View style={styles.coordCardsContainer}>
                <View style={styles.modernCoordCard}>
                  <Text style={styles.modernCoordLabel}>LAT</Text>
                  <Text style={styles.modernCoordValue}>{formatCoordinate(latitude)}</Text>
                </View>
                <View style={styles.modernCoordCard}>
                  <Text style={styles.modernCoordLabel}>LONG</Text>
                  <Text style={styles.modernCoordValue}>{formatCoordinate(longitude)}</Text>
                </View>
              </View>
              
              <View style={styles.modernAzimuthContainer}>
                <View style={styles.modernAzimuthCard}>
                  <Text style={styles.modernAzimuthLabel}>AZIMUTH</Text>
                  <View style={styles.azimuthDataRow}>
                    <Text style={styles.modernAzimuthDirection}>
                      {getDirectionFromAzimuth(azimuth)}
                    </Text>
                    <Text style={styles.modernAzimuthValue}>
                      {formatValue(azimuth, 0)}°
                    </Text>
                  </View>
                </View>

                {/* ปุ่มสลับย้ายขึ้นไปอยู่บนกรอบวงกลมแล้ว */}
              </View>
            </View>
          </View>
        </View>

        {/* เข็มทิศซ่อน */}
        <View style={styles.hiddenCompass}>
          <CompassView
            latitude={latitude}
            longitude={longitude}
            location={{ coords: { latitude, longitude } }}
            onCompassUpdate={handleCompassUpdate}
          />
        </View>
      </LinearGradient>

      {/* Modern OK Button - แยกออกมา */}
      <View style={styles.okButtonContainer}>
        <TouchableOpacity 
          style={[styles.modernOkButton, isSaving && styles.savingButton]}
          onPress={async () => {
            if (isSaving) return;
            
            try {
              setIsSaving(true);
              console.log('🎯 Starting save process...');
              console.log('📋 Props check:', {
                addImageToPoint: !!addImageToPoint,
                setImagePoint1: !!setImagePoint1,
                setImagePoint2: !!setImagePoint2,
                saveCurrentPoint: !!saveCurrentPoint,
                currentPoint
              });
              
              console.log('📸 About to take photo...');
              const photo = await takePhotoFromCamera();
              console.log('📸 Photo result:', photo ? 'SUCCESS' : 'FAILED');
              
              if (photo) {
                console.log('📸 Photo captured successfully:', photo);
                console.log('🎯 Current point:', currentPoint);
                console.log('🔧 addImageToPoint available:', !!addImageToPoint);
                
                // บันทึกรูปภาพทั้งแบบใหม่และเก่า
                let imageSaved = false;
                
                // ลองใช้ addImageToPoint ก่อน
                if (addImageToPoint && typeof addImageToPoint === 'function') {
                  try {
                    console.log('🚀 Calling addImageToPoint...');
                    await addImageToPoint(currentPoint, photo);
                    console.log(`✅ Image saved via addImageToPoint for point ${currentPoint}`);
                    imageSaved = true;
                  } catch (error) {
                    console.error('❌ Error in addImageToPoint:', error);
                  }
                }
                
                // ใช้ setImagePoint เสมอเพื่อให้แน่ใจ
                if (currentPoint === 1 && setImagePoint1) {
                  setImagePoint1(photo);
                  console.log('📷 Image set for point 1 via setImagePoint1');
                  imageSaved = true;
                } else if (currentPoint === 2 && setImagePoint2) {
                  setImagePoint2(photo);
                  console.log('📷 Image set for point 2 via setImagePoint2');
                  imageSaved = true;
                }
                
                // Direct save to SecureStore as backup
                try {
                  const imageKey = `imagePoint${currentPoint}`;
                  const imageDataToSave = {
                    uri: photo.uri,
                    width: photo.width,
                    height: photo.height,
                    type: photo.type,
                    timestamp: new Date().toISOString(),
                    pointNumber: currentPoint
                  };
                  
                  await SecureStore.setItemAsync(imageKey, JSON.stringify(imageDataToSave));
                  console.log(`💾 Direct SecureStore save for ${imageKey} - SUCCESS`);
                  
                  // ตรวจสอบว่าบันทึกสำเร็จหรือไม่
                  const savedData = await SecureStore.getItemAsync(imageKey);
                  if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    console.log(`✅ Verification: ${imageKey} saved successfully with URI: ${parsedData.uri ? 'YES' : 'NO'}`);
                    imageSaved = true;
                    
                    // อัปเดต state ทันที
                    if (currentPoint === 1 && setImagePoint1) {
                      setImagePoint1(imageDataToSave);
                      console.log('🔄 Updated imagePoint1 state');
                    } else if (currentPoint === 2 && setImagePoint2) {
                      setImagePoint2(imageDataToSave);
                      console.log('🔄 Updated imagePoint2 state');
                    }
                  } else {
                    console.log(`❌ Verification: ${imageKey} not found after save`);
                  }
                } catch (directSaveError) {
                  console.error('❌ Direct SecureStore save failed:', directSaveError);
                }
                
                if (!imageSaved) {
                  console.error('❌ Failed to save image via standard methods');
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (saveCurrentPoint) {
                  await saveCurrentPoint();
                  
                  // ไม่แสดง Alert ที่นี่ ให้แสดงแค่ตอนจบการสำรวจ
                  console.log(`✅ Point ${currentPoint} saved successfully with image: ${imageSaved ? 'YES' : 'NO'}`);
                }
              } else {
                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถถ่ายภาพได้');
              }
            } catch (error) {
              console.error('❌ Save process error:', error);
              Alert.alert('ข้อผิดพลาด', `ไม่สามารถบันทึกข้อมูลได้: ${error.message}`);
            } finally {
              setIsSaving(false);
            }
          }}
        >
          <Text style={styles.okButtonText} numberOfLines={1}>
            {isSaving ? 'กำลังบันทึก...' : 'OK'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  mainFrame: {
    width: width * 0.95,
    height: height * 0.7,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4a4a7a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'space-between',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 30,
    position: 'relative',
    paddingBottom: 20,
  },
  cameraCircle: {
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 30,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  cameraContainer: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#000',
  },
  cameraViewInner: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 150, // Will be overridden inline
    overflow: 'hidden',
  },
  // wrapper ที่ใช้ flip ทั้งภาพกล้อง (รองรับ CameraView/Camera)
  flipWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  flipWrapperFlipped: {
    transform: [{ scaleX: -1 }],
  },
  cameraInner: {
    flex: 1,
  },
  cameraFlipped: {
    // เผื่อบางอุปกรณ์ไม่รับ transform ที่ wrapper ให้เพิ่ม layer ซ้ำลงที่ตัวกล้อง
    transform: [{ scaleX: -1 }],
  },
  blackCircleContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 150,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
  },
  loadingText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
  },
  fallbackText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  fallbackSubText: {
    color: '#95a5a6',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.5)',
  },
  crosshair: {
    position: 'absolute',
    zIndex: 2,
    width: TELESCOPE_SIZE - 40, // ใหญ่ขึ้นให้เต็มวงกลมมากขึ้น
    height: TELESCOPE_SIZE - 40,
  },
  crosshairHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 6, // หนาขึ้นจาก 4 เป็น 6
    backgroundColor: '#fff',
    transform: [{ translateY: -3 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  crosshairVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 6, // หนาขึ้นจาก 4 เป็น 6
    backgroundColor: '#fff',
    transform: [{ translateX: -3 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  crosshairCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 12, // ใหญ่ขึ้นจาก 8 เป็น 12
    height: 12,
    backgroundColor: '#ff4444',
    borderRadius: 6,
    transform: [{ translateX: -6 }, { translateY: -6 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  // Short Marks on Crosshair
  crosshairMarksContainer: {
    position: 'absolute',
    width: TELESCOPE_SIZE,
    height: TELESCOPE_SIZE,
    borderRadius: TELESCOPE_SIZE / 2,
    zIndex: 2,
  },
  crosshairMark: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  crosshairMarkVertical: {
    width: 3,
    height: 32, // ยาวขึ้นจาก 18 เป็น 32
    transform: [{ translateX: -1.5 }],
  },
  crosshairMarkHorizontal: {
    width: 32, // ยาวขึ้นจาก 18 เป็น 32
    height: 3,
    transform: [{ translateY: -1.5 }],
  },
  pulseRing: {
    position: 'absolute',
    width: TELESCOPE_SIZE,
    height: TELESCOPE_SIZE,
    borderRadius: TELESCOPE_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.6)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
  },
  loadingText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.9)',
  },
  fallbackText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  fallbackSubText: {
    color: '#95a5a6',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.5)',
  },
  modernBottomContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 140,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  topDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
    gap: 20,
  },
  coordCardsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modernCoordCard: {
    backgroundColor: 'rgba(52, 152, 219, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    minWidth: 70,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  modernCoordLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  modernCoordValue: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  modernAzimuthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 'auto',
  },

  modernAzimuthCard: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  modernAzimuthLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  azimuthDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modernAzimuthDirection: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  modernAzimuthValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  sensorDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  sensorCard: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  sensorLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  sensorValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  hiddenCompass: {
    position: 'absolute',
    left: -1000,
    top: -1000,
    opacity: 0,
  },
  okButtonContainer: {
    position: 'absolute',
    right: 15,
    bottom: 25,
    zIndex: 15,
    width: 80,
  },
  modernOkButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 70,
  },
  savingButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.95)',
    shadowColor: '#3498db',
  },
  okButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sensorOverlayContainer: {
    position: 'absolute',
    bottom: 50,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 8,
  },
  sensorOverlayLeft: {
    alignItems: 'flex-start',
  },
  sensorOverlayRight: {
    alignItems: 'flex-end',
  },
  sensorOverlayLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  sensorOverlayValue: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default TelescopeView; 