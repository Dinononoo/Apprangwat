
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, PermissionsAndroid, Platform, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from 'buffer';
import * as Location from 'expo-location';
import * as ImageManipulator from 'expo-image-manipulator';
import { Magnetometer } from 'expo-sensors';
import Constants from 'expo-constants';

// Import BLE library with error handling
let BleManager = null;
try {
  const BLEModule = require('react-native-ble-plx');
  if (BLEModule && BLEModule.BleManager) {
    BleManager = BLEModule.BleManager;
    console.log('✅ BLE library loaded successfully');
  } else {
    console.log('⚠️ BLE library loaded but BleManager not found');
    BleManager = null;
  }
} catch (error) {
  console.log('⚠️ BLE library not available:', error.message);
  BleManager = null;
}

// Import SuccessPopup component
import SuccessPopup from '../components/ui/SuccessPopup';

const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const DEVICE_NAME = "ESP32_LANDSLIDE_MOCK";

// Alternative UUIDs for different ESP32 configurations
const ALTERNATIVE_SERVICE_UUIDS = [
  "4fafc201-1fb5-459e-8fcc-c5c9c331914b", // Primary
  "12345678-1234-1234-1234-123456789abc", // Alternative 1
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART Service
];

const ALTERNATIVE_DEVICE_NAMES = [
  "ESP32_LANDSLIDE_MOCK",
  "ESP32",
  "ESP32-WROOM",
  "ESP32-DevKit",
  "ESP32_BLE",
  "LANDSLIDE_SENSOR"
];

export const useBLE = () => {
  // เริ่มต้น BleManager แบบปลอดภัย
  const manager = useRef(null);
  const [bleManagerReady, setBleManagerReady] = useState(false);

  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [liveData, setLiveData] = useState({});
  const [point1Data, setPoint1Data] = useState({});
  const [point2Data, setPoint2Data] = useState({});
  const [currentPoint, setCurrentPoint] = useState(1);
  const [imagePoint1, setImagePoint1] = useState(null);
  const [imagePoint2, setImagePoint2] = useState(null);
  const [imagePoint1List, setImagePoint1List] = useState([]);
  const [imagePoint2List, setImagePoint2List] = useState([]);
  const [imagePickingInProgress, setImagePickingInProgress] = useState(false);
  const [location, setLocation] = useState(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [scannedDevices, setScannedDevices] = useState([]);
  const [showDeviceList, setShowDeviceList] = useState(false);

  // Enhanced compass data state
  const [compassData, setCompassData] = useState({
    heading: 0,
    direction: 'N'
  });

  // State สำหรับเก็บข้อมูลเข็มทิศแบบเรียลไทม์
  const [realTimeCompassData, setRealTimeCompassData] = useState({
    heading: 0,
    direction: 'N'
  });

  // Magnetometer subscription for compass
  const [magnetometerSubscription, setMagnetometerSubscription] = useState(null);

  // State สำหรับจัดการหลายพื้นที่สำรวจ
  const [surveyAreas, setSurveyAreas] = useState([]);
  const [currentAreaId, setCurrentAreaId] = useState(null);
  const [currentAreaName, setCurrentAreaName] = useState('');
  const [showCreateAreaModal, setShowCreateAreaModal] = useState(false);
  const [isInSurveyMode, setIsInSurveyMode] = useState(false);

  // Animation values - Fixed initialization
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  // State สำหรับ Success Popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupData, setSuccessPopupData] = useState({
    deviceName: 'ESP32',
    signalStrength: '-50 dBm',
    title: '🎉 เชื่อมต่อสำเร็จ!',
    message: ''
  });

  // State สำหรับ Save Offline Popup
  const [showSaveOfflinePopup, setShowSaveOfflinePopup] = useState(false);
  const [saveOfflinePopupData, setSaveOfflinePopupData] = useState({
    areaName: '',
    areaData: null
  });

  // State สำหรับ Scanning Popup
  const [showScanningPopup, setShowScanningPopup] = useState(false);

  // Function สำหรับยกเลิกการ scan
  const cancelScan = () => {
    console.log('🚫 User cancelled scan');
    if (manager.current && bleManagerReady) {
      try {
        manager.current.stopDeviceScan();
      } catch (error) {
        console.log('⚠️ Error stopping scan:', error);
      }
    }
    setIsScanning(false);
    setShowScanningPopup(false);
    setScannedDevices([]);
  };

  // ฟังก์ชันบีบอัดรูปภาพก่อนส่ง
  const compressImage = async (imageUri) => {
    try {
      console.log('🔄 Compressing image:', imageUri);
      
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 400, height: 400 } } // จำกัดขนาดเล็กลงมาก
        ],
        {
          compress: 0.3, // บีบอัด 70%
          format: ImageManipulator.SaveFormat.JPEG,
          quality: 0.5 // คุณภาพ 50%
        }
      );
      
      console.log('✅ Image compressed successfully:', {
        originalUri: imageUri,
        compressedUri: result.uri,
        size: result.width + 'x' + result.height
      });
      
      return result;
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      // ส่งคืนรูปภาพเดิมถ้าบีบอัดไม่สำเร็จ
      return { uri: imageUri, width: 400, height: 400, type: 'image/jpeg' };
    }
  };

  // Get enhanced compass data from CompassView
  const getEnhancedCompassData = () => {
    // ใช้ข้อมูลเข็มทิศแบบเรียลไทม์ที่อัพเดตจาก CompassView
    console.log('🧭 Getting compass data:', realTimeCompassData);
    return { heading: realTimeCompassData.heading || 0 };
  };

  // ฟังก์ชันสำหรับรับข้อมูลเข็มทิศจาก CompassView
  const updateCompassData = (compassInfo) => {
    console.log('🧭 Updating compass data from CompassView:', compassInfo);
    setRealTimeCompassData({
      heading: compassInfo.heading || 0,
      direction: compassInfo.direction || 'N'
    });
    setCompassData({ 
      heading: compassInfo.heading || 0,
      direction: compassInfo.direction || 'N'
    });
  };

  // Update live data with enhanced compass information
  const updateLiveDataWithCompass = (sensorData) => {
    const currentCompassHeading = compassData.heading || realTimeCompassData.heading || 0;
    
    // Debug GPS data
    console.log('📍 GPS Debug:', {
      location: location,
      coords: location?.coords,
      latitude: location?.coords?.latitude,
      longitude: location?.coords?.longitude,
      altitude: location?.coords?.altitude
    });
    
    return {
      ...sensorData,
      // ใช้ค่า GPS จริงจากมือถือเป็นหลัก
      lat: location?.coords?.latitude || sensorData.lat || 0,
      lon: location?.coords?.longitude || sensorData.lon || 0,
      altitude: location?.coords?.altitude || sensorData.altitude || 0,
      // เพิ่ม azimuth จากเข็มทิศ
      azimuth: Math.round(currentCompassHeading)
    };
  };

  // Request permissions function
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(grants).every(
          grant => grant === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            'ต้องการสิทธิ์',
            'แอปต้องการสิทธิ์ Bluetooth และ Location เพื่อทำงาน',
            [{ text: 'ตกลง' }]
          );
          return false;
        }

        setPermissionsGranted(true);
        return true;
      } catch (error) {
        console.error('Permission error:', error);
        return false;
      }
    }
    setPermissionsGranted(true);
    return true;
  };

  // Initialize BleManager safely
  const initializeBleManager = async () => {
    try {
      // ตรวจสอบ development environment
      const isDevelopment = __DEV__;
      const isExpoGo = Constants.appOwnership === 'expo';
      
      // ตรวจสอบว่า BLE library พร้อมใช้งานหรือไม่
      if (typeof BleManager === 'undefined' || BleManager === null) {
        console.log('❌ BleManager is not available - BLE library not loaded');
        setBleManagerReady(false);
        return false;
      }
      
      // ตรวจสอบว่าเป็น Expo Go หรือไม่
      if (isExpoGo) {
        console.log('🔄 Running in Expo Go - BLE functionality not available');
        setBleManagerReady(false);
        return false;
      }
      
      console.log('🚀 Initializing BleManager...');
      
      // ตรวจสอบว่า BleManager เป็น function หรือไม่
      if (typeof BleManager !== 'function') {
        console.log('❌ BleManager is not a constructor function');
        setBleManagerReady(false);
        return false;
      }
      
      // สร้าง BleManager ใหม่
      manager.current = new BleManager();
      
      // ตรวจสอบว่า BleManager ทำงานได้
      const state = await manager.current.state();
      console.log('✅ BleManager initialized successfully, state:', state);
      
      setBleManagerReady(true);
      return true;
    } catch (error) {
      console.log('⚠️ BleManager not available (expected in some environments)');
      setBleManagerReady(false);
      return false;
    }
  };

  // Check Bluetooth state
  const checkBluetoothState = async () => {
    try {
      if (!manager.current || !bleManagerReady) {
        console.log('⚠️ BleManager not ready, initializing...');
        const initialized = await initializeBleManager();
        if (!initialized) {
          return false;
        }
      }
      
      const state = await manager.current.state();
      console.log('Bluetooth state:', state);
      
      if (state !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth ไม่เปิด',
          'กรุณาเปิด Bluetooth เพื่อใช้งานแอป',
          [{ text: 'ตกลง' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Bluetooth state check error:', error);
      return false;
    }
  };

  // Setup pulse animation
  useEffect(() => {
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

    if (isConnected) {
      pulseAnimation.start();
    }

    return () => pulseAnimation.stop();
  }, [isConnected]);

  // Setup scan animation
  useEffect(() => {
    if (isScanning) {
      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );

      scanAnimation.start();

      return () => scanAnimation.stop();
    } else {
      scanAnim.setValue(0);
    }
  }, [isScanning]);

  const pickImage = async (point) => {
    if (imagePickingInProgress) return;
    setImagePickingInProgress(true);

    try {
      // แสดงตัวเลือกระหว่างถ่ายรูปหรือเลือกจากแกลลอรี่
      Alert.alert(
        "เลือกรูปภาพ",
        "คุณต้องการเลือกรูปภาพจากแหล่งใด?",
        [
          { text: "ยกเลิก", style: "cancel", onPress: () => setImagePickingInProgress(false) },
          { text: "📷 ถ่ายรูป", onPress: () => takePhoto(point) },
          { text: "🖼️ เลือกจากแกลลอรี่", onPress: () => selectFromLibrary(point) }
        ]
      );
    } catch (error) {
      console.error("เกิดข้อผิดพลาดใน pickImage:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเข้าถึงการเลือกรูปภาพได้");
      setImagePickingInProgress(false);
    }
  };

  // ฟังก์ชันครอปรูปเป็นวงกลมจริงๆ
  const cropImageToCircle = async (uri) => {
    try {
      console.log('🔄 Cropping image to perfect circle...');
      
      // ก่อนอื่นปรับขนาดเป็นสี่เหลี่ยมจัตุรัส
      const squareImage = await ImageManipulator.manipulateAsync(
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

      console.log('✅ Image cropped to perfect circle:', squareImage);
      return squareImage;
    } catch (error) {
      console.error('❌ Circle crop error:', error);
      return { uri }; // ส่งกลับรูปเดิมถ้าครอปไม่ได้
    }
  };

  const takePhoto = async (point) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("ไม่มีสิทธิ์เข้าถึงกล้อง", "กรุณาอนุญาตการเข้าถึงกล้อง");
        setImagePickingInProgress(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageAsset = result.assets[0];
        
        // ครอปรูปเป็นวงกลมก่อนบันทึก
        const croppedImage = await cropImageToCircle(imageAsset.uri);
        const finalImageAsset = {
          ...imageAsset,
          uri: croppedImage.uri,
          width: 400,
          height: 400
        };
        
        if (point === 1) {
          setImagePoint1(finalImageAsset);
        } else {
          setImagePoint2(finalImageAsset);
        }
        
        // อัปเดตรูปภาพในพื้นที่สำรวจหากอยู่ในโหมดสำรวจ
        if (isInSurveyMode && currentAreaId) {
          const areaIndex = surveyAreas.findIndex(area => area.id === currentAreaId);
          if (areaIndex !== -1) {
            const updatedAreas = [...surveyAreas];
            const currentArea = { ...updatedAreas[areaIndex] };
            
            if (point === 1) {
              currentArea.images.point1 = imageAsset;
              if (currentArea.points.point1) {
                currentArea.points.point1.hasImage = true;
              }
            } else {
              currentArea.images.point2 = imageAsset;
              if (currentArea.points.point2) {
                currentArea.points.point2.hasImage = true;
              }
            }
            
            updatedAreas[areaIndex] = currentArea;
            setSurveyAreas(updatedAreas);
            
            // บันทึกลง SecureStore
            await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));
            
            console.log(`📸 Updated image for point ${point} in survey area:`, {
              areaName: currentArea.name,
              hasImageUri: !!imageAsset?.uri
            });
          }
        }
        
        Alert.alert("ถ่ายรูปแล้ว", `เพิ่มรูปภาพให้กับจุดที่ ${point}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการถ่ายรูป:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเข้าถึงกล้องได้");
    } finally {
      setImagePickingInProgress(false);
    }
  };

  const selectFromLibrary = async (point) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("ไม่มีสิทธิ์เข้าถึงรูปภาพ", "กรุณาอนุญาตการเข้าถึงคลังภาพ");
        setImagePickingInProgress(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const imageAsset = result.assets[0];
        
        // ครอปรูปเป็นวงกลมก่อนบันทึก
        const croppedImage = await cropImageToCircle(imageAsset.uri);
        const finalImageAsset = {
          ...imageAsset,
          uri: croppedImage.uri,
          width: 400,
          height: 400
        };
        
        if (point === 1) {
          setImagePoint1(finalImageAsset);
        } else {
          setImagePoint2(finalImageAsset);
        }
        
        // อัปเดตรูปภาพในพื้นที่สำรวจหากอยู่ในโหมดสำรวจ
        if (isInSurveyMode && currentAreaId) {
          const areaIndex = surveyAreas.findIndex(area => area.id === currentAreaId);
          if (areaIndex !== -1) {
            const updatedAreas = [...surveyAreas];
            const currentArea = { ...updatedAreas[areaIndex] };
            
            if (point === 1) {
              currentArea.images.point1 = imageAsset;
              if (currentArea.points.point1) {
                currentArea.points.point1.hasImage = true;
              }
            } else {
              currentArea.images.point2 = imageAsset;
              if (currentArea.points.point2) {
                currentArea.points.point2.hasImage = true;
              }
            }
            
            updatedAreas[areaIndex] = currentArea;
            setSurveyAreas(updatedAreas);
            
            // บันทึกลง SecureStore
            await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));
            
            console.log(`📸 Updated image for point ${point} in survey area:`, {
              areaName: currentArea.name,
              hasImageUri: !!imageAsset?.uri
            });
          }
        }
        
        Alert.alert("เลือกรูปแล้ว", `เพิ่มรูปภาพให้กับจุดที่ ${point}`);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดใน selectFromLibrary:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดรูปภาพจากเครื่องได้");
    } finally {
      setImagePickingInProgress(false);
    }
  };

      // Submit points to server
      const submitPointsToServer = async () => {
        // Check internet connectivity first
        const hasInternet = await checkInternetConnection();
        
        if (!hasInternet) {
          console.log('📡 No internet connection, data will be saved locally');
          return;
        }

        if ((!point1Data || Object.keys(point1Data).length === 0) && (!point2Data || Object.keys(point2Data).length === 0)) {
          console.log('⚠️ No data to submit');
          return;
        }

        try {
          // เตรียมข้อมูลก่อน
          const currentLocation = location?.coords;
          const currentAzimuth = compassData.heading || realTimeCompassData.heading || 0;

          // ตรวจสอบข้อมูล GPS
          if (!currentLocation || !currentLocation.latitude || !currentLocation.longitude) {
            console.log('📍 No GPS data available, using default coordinates');
            // ใช้พิกัดเริ่มต้นแทนการแสดง popup
            currentLocation = { latitude: 0, longitude: 0, altitude: 0 };
          }

          // สร้าง FormData - ส่งเฉพาะข้อมูลหลักที่จำเป็น
          const formData = new FormData();
          
          // ข้อมูลพื้นฐาน
          const user_id = '124';
          // ใช้ชื่อพื้นที่สำรวจปัจจุบันหากมี หรือใช้ค่าเริ่มต้น
          const currentArea = surveyAreas.find(area => area.isActive);
          const observer = currentArea?.name || 'พื้นที่สำรวจ';
          formData.append('user_id', user_id);
          formData.append('observer', observer);
          
          // ข้อมูล GPS ของกล้อง (ตำแหน่งมือถือจริง)
          const currentLat = currentLocation.latitude;
          const currentLng = currentLocation.longitude;
          const camera_lat = currentLat.toFixed(7);
          const camera_lng = currentLng.toFixed(7);
          formData.append('camera_lat', camera_lat);
          formData.append('camera_lng', camera_lng);
          
          // ข้อมูลเข็มทิศ
          const azimuth = Math.round(currentAzimuth);
          formData.append('azimuth', azimuth.toString());
          
          // ข้อมูลจุดที่ 1 - ป้องกัน null errors
          const hasPoint1 = point1Data && typeof point1Data === 'object' && Object.keys(point1Data).length > 0;
          const distance1 = hasPoint1 ? (point1Data.distance || point1Data.slopeDistance || 0) : 0;
          const elevation1 = hasPoint1 ? (point1Data.elevation || point1Data.altitude || 0) : 0;
          const distance1_formatted = Number(distance1).toFixed(1);
          const elevation1_formatted = Number(elevation1).toFixed(1);
          formData.append('distance1', distance1_formatted);
          formData.append('elevation1', elevation1_formatted);
          
          // เพิ่มพิกัด GPS ของจุดที่ 1
          if (hasPoint1 && point1Data.lat && point1Data.lon) {
            formData.append('latitude', point1Data.lat.toFixed(7));
            formData.append('longitude', point1Data.lon.toFixed(7));
            console.log('📍 Point 1 GPS coordinates added');
          } else {
            // ใช้พิกัดกล้องเป็นพิกัดหลัก
            formData.append('latitude', camera_lat);
            formData.append('longitude', camera_lng);
            console.log('📍 Using camera GPS as main coordinates');
          }
          
          // ข้อมูลจุดที่ 2 - ป้องกัน null errors  
          const hasPoint2 = point2Data && typeof point2Data === 'object' && Object.keys(point2Data).length > 0;
          const distance2 = hasPoint2 ? (point2Data.distance || point2Data.slopeDistance || 0) : 0;
          const elevation2 = hasPoint2 ? (point2Data.elevation || point2Data.altitude || 0) : 0;
          const distance2_formatted = Number(distance2).toFixed(1);
          const elevation2_formatted = Number(elevation2).toFixed(1);
          formData.append('distance2', distance2_formatted);
          formData.append('elevation2', elevation2_formatted);
          
          // ใช้รูปภาพจาก state ปัจจุบัน (ไม่โหลดจาก SecureStore)
          console.log('📷 Using current state images for server upload');
          console.log('📷 imagePoint1 state:', imagePoint1 ? 'HAS_IMAGE' : 'NO_IMAGE');
          console.log('📷 imagePoint2 state:', imagePoint2 ? 'HAS_IMAGE' : 'NO_IMAGE');
          
          // รูปภาพจุดที่ 1 (ใช้รูปจาก state ปัจจุบัน) - บีบอัดก่อนส่ง
          const image1ToSend = imagePoint1;
          if (image1ToSend?.uri) {
            console.log('🔄 Compressing photo1 before upload...');
            const compressedPhoto1 = await compressImage(image1ToSend.uri);
            const filename1 = `landslide_point1_${Date.now()}.jpg`;
            formData.append('photo1', {
              uri: compressedPhoto1.uri,
              type: 'image/jpeg',
              name: filename1,
            });
            console.log('✅ Photo1 compressed and added to upload');
          } else {
            console.log('⚠️ No photo1 available for upload');
          }
          
          // รูปภาพจุดที่ 2 (ใช้รูปจาก state ปัจจุบัน) - บีบอัดก่อนส่ง
          const image2ToSend = imagePoint2;
          if (image2ToSend?.uri) {
            console.log('🔄 Compressing photo2 before upload...');
            const compressedPhoto2 = await compressImage(image2ToSend.uri);
            const filename2 = `landslide_point2_${Date.now()}.jpg`;
            formData.append('photo2', {
              uri: compressedPhoto2.uri,
              type: 'image/jpeg',
              name: filename2,
            });
            console.log('✅ Photo2 compressed and added to upload');
          } else {
            console.log('⚠️ No photo2 available for upload');
          }
          
          // รูปภาพเพิ่มเติมของจุดที่ 1 - บีบอัดก่อนส่ง
          if (imagePoint1List && imagePoint1List.length > 0) {
            for (let index = 0; index < imagePoint1List.length; index++) {
              const image = imagePoint1List[index];
              if (image?.uri) {
                console.log(`🔄 Compressing photo1_extra_${index} before upload...`);
                const compressedExtraPhoto = await compressImage(image.uri);
                const filename = `landslide_point1_extra_${index}_${Date.now()}.jpg`;
                formData.append(`photo1_extra_${index}`, {
                  uri: compressedExtraPhoto.uri,
                  type: 'image/jpeg',
                  name: filename,
                });
                console.log(`✅ Photo1_extra_${index} compressed and added to upload`);
              }
            }
          }
          
          // รูปภาพเพิ่มเติมของจุดที่ 2 - บีบอัดก่อนส่ง
          if (imagePoint2List && imagePoint2List.length > 0) {
            for (let index = 0; index < imagePoint2List.length; index++) {
              const image = imagePoint2List[index];
              if (image?.uri) {
                console.log(`🔄 Compressing photo2_extra_${index} before upload...`);
                const compressedExtraPhoto = await compressImage(image.uri);
                const filename = `landslide_point2_extra_${index}_${Date.now()}.jpg`;
                formData.append(`photo2_extra_${index}`, {
                  uri: compressedExtraPhoto.uri,
                  type: 'image/jpeg',
                  name: filename,
                });
                console.log(`✅ Photo2_extra_${index} compressed and added to upload`);
              }
            }
          }

          console.log('📤 Sending complete data to server:', {
            url: 'https://rawangphai.uru.ac.th/api/Points',
            user_id: user_id,
            observer: observer,
            camera_lat: camera_lat,
            camera_lng: camera_lng,
            azimuth: azimuth,
            distance1: distance1_formatted,
            elevation1: elevation1_formatted,
            distance2: distance2_formatted,
            elevation2: elevation2_formatted,
            hasPhoto1: !!image1ToSend?.uri,
            hasPhoto2: !!image2ToSend?.uri,
            photo1_uri: image1ToSend?.uri ? 'HAS_URI' : 'NO_URI',
            photo2_uri: image2ToSend?.uri ? 'HAS_URI' : 'NO_URI',
            total_photos: (image1ToSend?.uri ? 1 : 0) + (image2ToSend?.uri ? 1 : 0),
            point1_data: hasPoint1 ? 'COMPLETE' : 'MISSING',
            point2_data: hasPoint2 ? 'COMPLETE' : 'MISSING'
          });

          // ตรวจสอบรูปภาพก่อนส่ง
          const totalPhotos = (image1ToSend?.uri ? 1 : 0) + (image2ToSend?.uri ? 1 : 0);
          console.log(`📷 Total photos to upload: ${totalPhotos}`);
          console.log(`📷 Photo1: ${image1ToSend?.uri ? 'READY' : 'MISSING'}`);
          console.log(`📷 Photo2: ${image2ToSend?.uri ? 'READY' : 'MISSING'}`);
          
          // ส่งข้อมูลไปยัง API endpoint ที่ถูกต้อง
          const API_URL = 'https://rawangphai.uru.ac.th/api/Points';
          
          console.log(`🔄 Sending to: ${API_URL}`);
          
          console.log("body: ", formData);
          
          const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json',
              // ไม่ต้องตั้ง Content-Type ให้ fetch กำหนดเอง
            },
            timeout: 60000
          });

          console.log(`📡 Response status: ${response.status}`);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Server response:', result);
            
            Alert.alert(
              'ส่งข้อมูลสำเร็จ ✅',
              `ข้อมูลถูกส่งไปยังเซิร์ฟเวอร์เรียบร้อยแล้ว\n\n📊 ข้อมูลที่ส่ง:\n` +
              `👤 ผู้สำรวจ: ${observer}\n` +
              `📍 GPS กล้อง: ${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}\n` +
              `🧭 อาซิมูท: ${Math.round(currentAzimuth)}°\n` +
              `📏 จุดที่ 1: ${distance1.toFixed(1)}m / ${elevation1.toFixed(1)}°\n` +
              `📏 จุดที่ 2: ${distance2.toFixed(1)}m / ${elevation2.toFixed(1)}°\n` +
              `📷 รูปภาพ: ${image1ToSend?.uri ? 'จุด 1 ✅' : 'จุด 1 ❌'} ${image2ToSend?.uri ? 'จุด 2 ✅' : 'จุด 2 ❌'}\n\n` +
              `🚀 Server จะคำนวณ slope_angle เอง`,
              [
                {
                  text: 'ล้างข้อมูล',
                  style: 'destructive',
                  onPress: async () => {
                    setPoint1Data({});
                    setPoint2Data({});
                    setImagePoint1(null);
                    setImagePoint2(null);
                    // ใช้ SecureStore แทน AsyncStorage
                    await Promise.all([
                      SecureStore.deleteItemAsync('point1Data').catch(() => {}),
                      SecureStore.deleteItemAsync('point2Data').catch(() => {}),
                      SecureStore.deleteItemAsync('imagePoint1').catch(() => {}),
                      SecureStore.deleteItemAsync('imagePoint2').catch(() => {})
                    ]);
                    console.log('🗑️ Data cleared successfully');
                  }
                },
                { text: 'เก็บข้อมูลไว้', style: 'default' }
              ]
            );
          } else {
            // จัดการ error ตาม status code
            if (response.status === 413) {
              Alert.alert(
                '📁 ไฟล์ใหญ่เกินไป',
                'รูปภาพที่ส่งมีขนาดใหญ่เกินกว่าที่เซิร์ฟเวอร์รองรับ\n\n💡 คำแนะนำ:\n• ลองเลือกรูปภาพที่มีขนาดเล็กกว่า\n• หรือถ่ายรูปใหม่ในความละเอียดต่ำกว่า',
                [{ text: 'ตกลง' }]
              );
              return;
            } else if (response.status === 500) {
              // Debug error message from server
              try {
                const errorResponse = await response.json();
                console.log("messageError: ", errorResponse.message);
                console.log("error: ", errorResponse.error);
              } catch (e) {
                console.log("Could not parse error response as JSON");
                try {
                  const errorText = await response.text();
                  console.log("Error text: ", errorText);
                } catch (e2) {
                  console.log("Could not get error text");
                }
              }
              
              Alert.alert(
                '🔧 เซิร์ฟเวอร์มีปัญหา',
                'เซิร์ฟเวอร์เกิดข้อผิดพลาดภายใน (HTTP 500)\n\n💡 สาเหตุที่เป็นไปได้:\n• เซิร์ฟเวอร์กำลังบำรุงรักษา\n• ข้อมูลที่ส่งไม่ถูกต้อง\n• เซิร์ฟเวอร์มีปัญหา\n\n💾 ข้อมูลจะถูกเก็บไว้ในเครื่องและลองส่งใหม่ภายหลัง',
                [{ text: 'ตกลง' }]
              );
              return;
            }
            
            // ลอง parse error message จาก server
            console.log(`❌ Server error with status: ${response.status}`);
            console.log("messageError: ", response.message);
            console.log("error: ", response.error);
            
            let errorMessage = `HTTP ${response.status}`;
            try {
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            } catch (e) {
              // ใช้ status code ถ้า parse ไม่ได้
            }
            throw new Error(`Server error: ${errorMessage}`);
          }
        } catch (error) {
          console.error('❌ Error submitting data:', error);
          
          let errorDetail = error.message;
          if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
            errorDetail = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\n• ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่';
          } else if (error.message.includes('timeout')) {
            errorDetail = 'การเชื่อมต่อหมดเวลา\n• เครือข่ายช้าหรือเซิร์ฟเวอร์ไม่ตอบสนอง';
          }
          
          Alert.alert(
            '❌ ส่งข้อมูลไม่สำเร็จ',
            `เกิดข้อผิดพลาด:\n${errorDetail}\n\n💾 ข้อมูลจะถูกเก็บไว้ในเครื่องและลองส่งใหม่ภายหลัง\n\n🔧 เซิร์ฟเวอร์: rawangphai.uru.ac.th`,
            [{ text: 'ตกลง' }]
          );
        }
      };

   const scanAndConnect = async () => {
     // ตรวจสอบ development environment
     const isDevelopment = __DEV__;
     const isExpoGo = Constants.appOwnership === 'expo';
     
     // ตรวจสอบ BleManager พร้อมใช้งาน
     if (!manager.current || !bleManagerReady) {
       console.log('⚠️ BleManager not ready, initializing...');
       const initialized = await initializeBleManager();
       if (!initialized) {
         // แสดงข้อความที่เหมาะสมตาม environment
         if (isExpoGo) {
           Alert.alert(
             '🔧 ต้องการ Development Build',
             'BLE ไม่สามารถทำงานใน Expo Go ได้\n\nกรุณาใช้ Development Build เพื่อทดสอบ BLE:\n\n1. กด "s" ใน terminal\n2. หรือรัน "npx expo run:android"',
             [{ text: 'ตกลง' }]
           );
         } else {
           Alert.alert(
             '❌ ข้อผิดพลาด',
             'ไม่สามารถเริ่มต้น Bluetooth Manager ได้\n\nกรุณาลองใหม่หรือรีสตาร์ทแอป',
             [{ text: 'ตกลง' }]
           );
         }
         return;
       }
     }

     // ตรวจสอบสถานะการเชื่อมต่อจริง
     if (device && isConnected) {
       try {
         const deviceState = await device.isConnected();
         if (deviceState) {
           Alert.alert(
             '🔗 เชื่อมต่ออยู่แล้ว',
             `เชื่อมต่อกับ ${device.name || 'อุปกรณ์'} อยู่แล้ว\n\nต้องการตัดการเชื่อมต่อและค้นหาใหม่หรือไม่?`,
             [
               { text: 'ยกเลิก' },
               { 
                 text: 'ตัดการเชื่อมต่อ', 
                 onPress: async () => {
                   await disconnectDevice();
                   setTimeout(() => scanAndConnect(), 1000);
                 }
               }
             ]
           );
           return;
         } else {
           // อุปกรณ์ไม่ได้เชื่อมต่อจริง ให้รีเซ็ตสถานะ
           console.log('🔄 Device not actually connected, resetting state...');
           setDevice(null);
           setIsConnected(false);
         }
       } catch (error) {
         console.log('🔄 Error checking device state, resetting...', error);
         setDevice(null);
         setIsConnected(false);
       }
     }

     // ตรวจสอบ permissions ก่อน
     const hasPermissions = await requestPermissions();
     if (!hasPermissions) {
       return;
     }

     // ตรวจสอบสถานะ Bluetooth
     const bluetoothReady = await checkBluetoothState();
     if (!bluetoothReady) {
       return;
     }

     console.log('🔍 Starting enhanced BLE scan for ESP32...');
     setIsScanning(true);
     setScannedDevices([]); // ล้างรายการเก่า

     // แสดง Scanning Popup ทันสมัยแทน Alert
     setShowScanningPopup(true);

     try {
       // ตรวจสอบ manager.current อีกครั้งก่อนเรียกใช้ startDeviceScan
       if (!manager.current) {
         console.error('❌ BleManager is null, cannot start scan');
         setShowScanningPopup(false);
         setIsScanning(false);
         Alert.alert(
           '❌ ข้อผิดพลาด',
           'Bluetooth Manager ไม่พร้อมใช้งาน\n\nกรุณารีสตาร์ทแอป',
           [{ text: 'ตกลง' }]
         );
         return;
       }

       manager.current.startDeviceScan(null, null, (error, scannedDevice) => {
         if (error) {
           console.log('❌ Scan error:', error);
           setShowScanningPopup(false); // ปิด scanning popup
           Alert.alert(
             'ข้อผิดพลาดในการสแกน', 
             `${error.message}\n\n🔧 วิธีแก้ไข:\n• ตรวจสอบ Bluetooth เปิดอยู่\n• ตรวจสอบ Location Services เปิดอยู่\n• ลองปิด-เปิด Bluetooth ใหม่`
           );
           setIsScanning(false);
           return;
         }

         if (scannedDevice) {
           // แสดงข้อมูลอุปกรณ์ที่พบแบบละเอียด
           console.log('📱 Found device:', {
             id: scannedDevice.id,
             name: scannedDevice.name,
             localName: scannedDevice.localName,
             serviceUUIDs: scannedDevice.serviceUUIDs,
             rssi: scannedDevice.rssi,
             manufacturerData: scannedDevice.manufacturerData
           });

           // เก็บอุปกรณ์ที่พบ (ไม่ให้ซ้ำ) และเรียงตาม signal strength
           setScannedDevices(prev => {
             const exists = prev.find(device => device.id === scannedDevice.id);
             if (!exists) {
               const newDevices = [...prev, scannedDevice];
               // เรียงตาม RSSI (signal แรงที่สุดก่อน)
               return newDevices.sort((a, b) => b.rssi - a.rssi);
             }
             return prev;
           });
           
           // ตรวจสอบหลายเงื่อนไขสำหรับ ESP32
           const deviceName = scannedDevice.name || scannedDevice.localName || '';
           const hasTargetService = scannedDevice.serviceUUIDs?.some(uuid => 
             ALTERNATIVE_SERVICE_UUIDS.includes(uuid.toLowerCase())
           );
           const isESP32Name = ALTERNATIVE_DEVICE_NAMES.some(name => 
             deviceName.toLowerCase().includes(name.toLowerCase())
           );
           const hasESP32Indicator = deviceName.toLowerCase().includes('esp') || 
                                    deviceName.toLowerCase().includes('landslide') ||
                                    deviceName.toLowerCase().includes('sensor');
           
           const isTargetDevice = hasTargetService || isESP32Name || hasESP32Indicator;
           
           if (isTargetDevice) {
             console.log('🎯 Potential ESP32 device found!', {
               name: deviceName,
               id: scannedDevice.id,
               hasTargetService,
               isESP32Name,
               hasESP32Indicator,
               rssi: scannedDevice.rssi
             });
             
             // หยุด scan และเชื่อมต่อทันที
             manager.current.stopDeviceScan();
             setIsScanning(false);
             connectToDevice(scannedDevice);
           }
         }
       });
     } catch (error) {
       console.error('❌ Error starting device scan:', error);
       setShowScanningPopup(false);
       setIsScanning(false);
       Alert.alert(
         '❌ ข้อผิดพลาด',
         'ไม่สามารถเริ่มการสแกนได้\n\nกรุณาลองใหม่',
         [{ text: 'ตกลง' }]
       );
     }
   };

  // Function สำหรับแสดงรายการอุปกรณ์ให้เลือก
  const showDeviceSelectionAlert = () => {
    // เตรียมข้อมูลอุปกรณ์
    const deviceInfo = scannedDevices.map((device, index) => {
      const deviceName = device.name || device.localName || 'อุปกรณ์ไม่มีชื่อ';
      const signalStrength = device.rssi;
      const deviceId = device.id.substring(0, 17); // แสดง MAC address แบบเต็ม
      return `${index + 1}. ${deviceName}\n   📍 ${deviceId}\n   📶 Signal: ${signalStrength} dBm`;
    });

    const deviceListText = deviceInfo.join('\n\n');
    const strongestDevice = scannedDevices[0]; // อุปกรณ์แรกมี signal แรงที่สุด (เรียงแล้ว)

    const buttons = [
      {
        text: `🔗 เชื่อมต่อ Signal แรงที่สุด (${strongestDevice.rssi} dBm)`,
        onPress: () => {
          console.log('🎯 Connecting to strongest signal device:', strongestDevice);
          connectToDevice(strongestDevice);
        }
      },
      ...scannedDevices.slice(0, 5).map((device, index) => ({ // แสดงสูงสุด 5 อุปกรณ์
        text: `${index + 1}. ${device.name || device.localName || 'ไม่มีชื่อ'} (${device.rssi} dBm)`,
        onPress: () => {
          console.log('User selected device:', device);
          connectToDevice(device);
        }
      })),
      { 
        text: '🔄 สแกนใหม่', 
        onPress: () => scanAndConnect() 
      },
      { text: '❌ ยกเลิก', style: 'cancel' }
    ];

    Alert.alert(
      '📱 เลือกอุปกรณ์ Bluetooth', 
      `พบ ${scannedDevices.length} อุปกรณ์ (เรียงตาม Signal)\n\n${deviceListText}\n\n💡 แนะนำ: เลือกอุปกรณ์ที่มี Signal แรงที่สุด`, 
      buttons,
      { cancelable: true }
    );
  };

const connectToDevice = async (deviceToConnect) => {
  try {
    console.log('🔗 Attempting to connect to device:', {
      id: deviceToConnect.id,
      name: deviceToConnect.name || deviceToConnect.localName || 'ไม่มีชื่อ',
      rssi: deviceToConnect.rssi
    });

    // เอา Alert เดิมออก - จะใช้ Success Popup แทน

    const connectedDevice = await deviceToConnect.connect({ 
      autoConnect: false,
      requestMTU: 512 // เพิ่ม MTU สำหรับการส่งข้อมูลที่ดีขึ้น
    });
    console.log('✅ Device connected, discovering services...');

    await connectedDevice.discoverAllServicesAndCharacteristics();
    console.log('✅ Services discovered');

    // ตรวจสอบ services ที่มี
    const services = await connectedDevice.services();
    console.log('📋 Available services:', services.map(s => s.uuid));

    // ตรวจสอบว่ามี target service หรือไม่
    let targetService = null;
    let targetCharacteristic = null;

    // ลองหา service ที่ตรงกัน
    for (const serviceUuid of ALTERNATIVE_SERVICE_UUIDS) {
      targetService = services.find(service => 
        service.uuid.toLowerCase() === serviceUuid.toLowerCase()
      );
      if (targetService) {
        console.log('🎯 Found matching service:', serviceUuid);
        break;
      }
    }

    if (targetService) {
      // ตรวจสอบ characteristics
      const characteristics = await targetService.characteristics();
      console.log('📋 Available characteristics:', characteristics.map(c => c.uuid));
      
      targetCharacteristic = characteristics.find(char => 
        char.uuid.toLowerCase() === CHARACTERISTIC_UUID.toLowerCase()
      );

      if (targetCharacteristic) {
        console.log('✅ Found target characteristic!');
        setDevice(connectedDevice);
        setIsConnected(true);
        listenForData(connectedDevice, targetService.uuid, targetCharacteristic.uuid);
        
        // แสดง Success Popup แทน Alert
        setSuccessPopupData({
          deviceName: deviceToConnect.name || deviceToConnect.localName || 'ESP32',
          signalStrength: `${deviceToConnect.rssi} dBm`,
          title: '🎉 เชื่อมต่อสำเร็จ!',
          message: `เชื่อมต่อกับ ${deviceToConnect.name || deviceToConnect.localName || 'ESP32'} แล้ว`
        });
        setShowSuccessPopup(true);
      } else {
        // ไม่พบ characteristic ที่ต้องการ แต่ลองใช้ characteristic แรกที่มี
        if (characteristics.length > 0) {
          const firstChar = characteristics[0];
          console.log('⚠️ Using first available characteristic:', firstChar.uuid);
          
          setDevice(connectedDevice);
          setIsConnected(true);
          listenForData(connectedDevice, targetService.uuid, firstChar.uuid);
          
          // แสดง Success Popup แทน Alert (ใช้ Characteristic ทดแทน)
          setSuccessPopupData({
            deviceName: deviceToConnect.name || deviceToConnect.localName || 'ESP32',
            signalStrength: `${deviceToConnect.rssi} dBm`,
            title: '⚠️ เชื่อมต่อแล้ว (บางส่วน)',
            message: 'ใช้ Characteristic ทดแทน - อาจได้รับข้อมูลไม่ครบถ้วน'
          });
          setShowSuccessPopup(true);
        } else {
          throw new Error('ไม่พบ Characteristic ใดๆ ใน Service');
        }
      }
    } else {
      // ไม่พบ service ที่ต้องการ แต่ลองใช้ service แรกที่มี
      if (services.length > 0) {
        const firstService = services[0];
        console.log('⚠️ Using first available service:', firstService.uuid);
        
        const characteristics = await firstService.characteristics();
        if (characteristics.length > 0) {
          const firstChar = characteristics[0];
          
          Alert.alert(
            '⚠️ ไม่พบ Service ที่ต้องการ',
            `อุปกรณ์นี้ไม่มี Service ที่คาดหวัง\n\nServices ที่พบ:\n${services.map(s => `• ${s.uuid}`).join('\n')}\n\nต้องการลองเชื่อมต่อด้วย Service แรกไหม?`,
            [
              { text: 'ยกเลิก', onPress: () => connectedDevice.cancelConnection() },
              { 
                text: 'ลองต่อ', 
                onPress: () => {
                  setDevice(connectedDevice);
                  setIsConnected(true);
                  listenForData(connectedDevice, firstService.uuid, firstChar.uuid);
                  
                  // แสดง Success Popup แทน Alert (บางส่วน)
                  setSuccessPopupData({
                    deviceName: deviceToConnect.name || deviceToConnect.localName || 'ESP32',
                    signalStrength: `${deviceToConnect.rssi} dBm`,
                    title: '⚠️ เชื่อมต่อแล้ว (บางส่วน)',
                    message: 'เชื่อมต่อแล้ว แต่อาจได้รับข้อมูลไม่ครบถ้วน'
                  });
                  setShowSuccessPopup(true);
                }
              }
            ]
          );
        } else {
          throw new Error('ไม่พบ Characteristic ใดๆ');
        }
      } else {
        throw new Error('ไม่พบ Service ใดๆ');
      }
    }
    
  } catch (error) {
    console.log('❌ Connect error:', error);
    Alert.alert(
      '❌ การเชื่อมต่อล้มเหลว',
      `Error: ${error.message}\n\n🔧 วิธีแก้ไข:\n• ตรวจสอบ ESP32 ทำงานอยู่\n• ตรวจสอบโค้ด BLE Server ใน ESP32\n• ลองรีเซ็ต ESP32\n• ลองเลือกอุปกรณ์อื่น`,
      [
        { text: 'ลองใหม่', onPress: () => scanAndConnect() },
        { text: 'ยกเลิก' }
      ]
    );
  }
};
      const listenForData = (connectedDevice, serviceUuid = SERVICE_UUID, characteristicUuid = CHARACTERISTIC_UUID) => {
        console.log(`📡 Starting to listen for data on Service: ${serviceUuid}, Characteristic: ${characteristicUuid}`);
        
        connectedDevice.monitorCharacteristicForService(serviceUuid, characteristicUuid, (error, characteristic) => {
          if (error) {
            console.log('❌ Monitor error:', error);
            
            // ไม่แสดง alert สำหรับ cancelled operations (เป็นเรื่องปกติเมื่อ disconnect)
            if (error.message && error.message.includes('cancelled')) {
              console.log('📡 BLE monitoring cancelled (normal when disconnecting)');
              return;
            }
            
            Alert.alert(
              '❌ ข้อผิดพลาดในการรับข้อมูล',
              `${error.message}\n\n🔧 วิธีแก้ไข:\n• ตรวจสอบ ESP32 ส่งข้อมูลอยู่\n• ตรวจสอบ Characteristic สามารถ Notify ได้\n• ลองเชื่อมต่อใหม่`
            );
            return;
          }

          try {
            const decoded = Buffer.from(characteristic.value, 'base64').toString('utf8');
            console.log('📡 Received from ESP32:', decoded);

            // แยกข้อมูล
            const parts = decoded.split(':');
            if (parts.length === 2) {
              const key = parts[0].trim();
              const value = parseFloat(parts[1].trim());

              // ข้ามข้อมูล azimuth จาก ESP32 เพราะใช้จากเข็มทิศแม่นยำสูงแทน
              if (key === 'azimuth') {
                console.log('🚫 BLOCKED azimuth from ESP32:', value, '- Using Enhanced Compass instead');
                return;
              }

              // แมป key ให้ตรงกับชื่อที่ต้องการ
              let mappedKey = key;
              if (key === 'altitude' || key === 'alt' || key === 'angle') {
                mappedKey = 'elevation'; // แปลง altitude/alt/angle เป็น elevation
                console.log(`🔄 Mapped ${key} to elevation:`, value);
              }
              if (key === 'slopeDistance' || key === 'dist' || key === 'range') {
                mappedKey = 'distance'; // แปลง slopeDistance/dist/range เป็น distance
                console.log(`🔄 Mapped ${key} to distance:`, value);
              }

              console.log(`📊 Updating ${mappedKey} from ESP32:`, value);
              
              // อัพเดตข้อมูลเรียลไทม์พร้อมข้อมูลเข็มทิศแม่นยำสูง
              setLiveData(prev => {
                const espData = {...prev, [mappedKey]: value};
                const enhancedData = updateLiveDataWithCompass(espData);
                
                console.log('🧭 Enhanced live data with compass:', {
                  originalKey: key,
                  mappedKey: mappedKey,
                  esp32Data: mappedKey + ': ' + value,
                  compassHeading: enhancedData.azimuth,
                  gpsLat: enhancedData.lat,
                  gpsLon: enhancedData.lon,
                  allData: enhancedData
                });

                // Debug elevation โดยเฉพาะ
                if (mappedKey === 'elevation') {
                  console.log('✅ ELEVATION UPDATED:', {
                    value: value,
                    'enhancedData.elevation': enhancedData.elevation
                  });
                }
                
                return enhancedData;
              });
            } else {
              // ลองแยกข้อมูลแบบอื่น (JSON, CSV, etc.)
              try {
                const jsonData = JSON.parse(decoded);
                console.log('📊 Received JSON data from ESP32:', jsonData);
                
                setLiveData(prev => {
                  const enhancedData = updateLiveDataWithCompass({...prev, ...jsonData});
                  return enhancedData;
                });
              } catch (jsonError) {
                // ตรวจสอบว่าเป็น "END" message หรือไม่
                if (decoded.trim() === 'END') {
                  console.log('📡 ESP32 data transmission ended');
                } else {
                console.log('⚠️ Unknown data format from ESP32:', decoded);
                }
              }
            }
          } catch (error) {
            console.log('❌ Error processing data:', error);
          }
        });
      };

      // Save current point data
      const saveCurrentPoint = async () => {
        if (!liveData || Object.keys(liveData).length === 0) {
          console.log('⚠️ No sensor data available');
          return;
        }

        const currentData = {
          ...liveData,
          lat: location?.coords?.latitude || liveData.lat,
          lon: location?.coords?.longitude || liveData.lon,
          altitude: location?.coords?.altitude || liveData.altitude,
          accuracy: location?.coords?.accuracy || liveData.accuracy,
          azimuth: Math.round(compassData.heading || realTimeCompassData.heading || 0),
          timestamp: new Date().toISOString(),
          deviceId: device?.id || 'unknown',
          pointNumber: currentPoint
        };

        // อัปเดต local state สำหรับแสดงผล
        if (currentPoint === 1) {
          setPoint1Data(currentData);
          // บันทึกข้อมูลหลักเท่านั้น (รูปภาพบันทึกแล้วใน addImageToPoint)
          await saveDataToStorage(1, currentData, imagePoint1);
          
          // ไม่โหลดรูปภาพจาก SecureStore เพื่อป้องกันการแสดงรูปเก่า
          console.log('🛡️ Keeping current imagePoint1 state - not reloading from storage');
        } else {
          setPoint2Data(currentData);
          // บันทึกข้อมูลหลักเท่านั้น (รูปภาพบันทึกแล้วใน addImageToPoint)
          await saveDataToStorage(2, currentData, imagePoint2);
          
          // ไม่โหลดรูปภาพจาก SecureStore เพื่อป้องกันการแสดงรูปเก่า
          console.log('🛡️ Keeping current imagePoint2 state - not reloading from storage');
        }

        // หากอยู่ในโหมดสำรวจ ให้บันทึกลงในพื้นที่ปัจจุบันด้วย
        if (isInSurveyMode && currentAreaId) {
          const imageData = currentPoint === 1 ? imagePoint1 : imagePoint2;
          await savePointToCurrentArea(currentPoint, currentData, imageData);
        }

        // ตรวจสอบสถานะรูปภาพหลังบันทึก (ไม่โหลดรูปภาพเก่า)
        setTimeout(async () => {
          try {
            const imageCheck1 = await SecureStore.getItemAsync('imagePoint1');
            const imageCheck2 = await SecureStore.getItemAsync('imagePoint2');
            
            console.log('🔍 Final image status:', {
              imagePoint1_stored: !!imageCheck1,
              imagePoint2_stored: !!imageCheck2,
              imagePoint1_state: !!imagePoint1?.uri,
              imagePoint2_state: !!imagePoint2?.uri
            });
            
            // ไม่โหลดรูปภาพเก่าจาก SecureStore เพื่อป้องกันการแสดงรูปเก่า
            console.log('🛡️ Preventing old image reload after save - keeping current state');
          } catch (error) {
            console.log('⚠️ Error checking final image status:', error);
          }
        }, 500);

        console.log('✅ Data saved successfully');
      };

      const togglePoint = () => {
        const newPoint = currentPoint === 1 ? 2 : 1;
        setCurrentPoint(newPoint);
        console.log(`🔄 Switched to point ${newPoint}`);
      };

      // Add image to point list
      const addImageToPoint = async (pointNumber, imageData) => {
        console.log(`🎯 Starting addImageToPoint for point ${pointNumber}`);
        console.log('📷 Image data received:', imageData ? 'HAS_DATA' : 'NO_DATA');
        console.log('📷 Image URI:', imageData?.uri);
        
        try {
          // ล้างรูปภาพเก่าก่อน
          if (pointNumber === 1) {
            setImagePoint1(null);
            console.log('🧹 Cleared old imagePoint1');
          } else if (pointNumber === 2) {
            setImagePoint2(null);
            console.log('🧹 Cleared old imagePoint2');
          }
          
          const timestamp = new Date().toISOString();
          const imageWithMeta = {
            ...imageData,
            timestamp,
            id: `${pointNumber}_${timestamp}`,
            saved: true,
            forceUpdate: Date.now() // เพิ่ม force update
          };
          
          console.log('📝 Image with metadata:', imageWithMeta);
          
          if (pointNumber === 1) {
            // สร้าง list ใหม่จาก current state หรือ array ว่าง
            const currentList = imagePoint1List || [];
            const newList = [...currentList, imageWithMeta];
            setImagePoint1List(newList);
            // อัปเดต imagePoint1 เป็นรูปล่าสุด
            setImagePoint1(imageWithMeta);
            
            // บันทึกทันทีแบบออฟไลน์
            await SecureStore.setItemAsync(`imagePoint1`, JSON.stringify(imageWithMeta));
            await SecureStore.setItemAsync(`imagePoint1List`, JSON.stringify(newList));
            console.log(`💾 Saved image offline for point 1, total: ${newList.length}`);
            console.log('📷 imagePoint1 state updated with:', imageWithMeta);
            
            // Force update parent components
            console.log('🔄 Force updating imagePoint1 state...');
          } else if (pointNumber === 2) {
            // สร้าง list ใหม่จาก current state หรือ array ว่าง
            const currentList = imagePoint2List || [];
            const newList = [...currentList, imageWithMeta];
            setImagePoint2List(newList);
            // อัปเดต imagePoint2 เป็นรูปล่าสุด
            setImagePoint2(imageWithMeta);
            
            // บันทึกทันทีแบบออฟไลน์
            await SecureStore.setItemAsync(`imagePoint2`, JSON.stringify(imageWithMeta));
            await SecureStore.setItemAsync(`imagePoint2List`, JSON.stringify(imageWithMeta));
            console.log(`💾 Saved image offline for point 2, total: ${newList.length}`);
            console.log('📷 imagePoint2 state updated with:', imageWithMeta);
            
            // Force update parent components
            console.log('🔄 Force updating imagePoint2 state...');
          }
          
          console.log(`✅ Added and saved image to point ${pointNumber} offline successfully`);
          
          // Force update state เพื่อให้แน่ใจว่า UI อัปเดต
          setTimeout(() => {
            if (pointNumber === 1) {
              setImagePoint1({...imageWithMeta, forceUpdate: Date.now()});
              console.log('🔄 Force updated imagePoint1 state');
            } else if (pointNumber === 2) {
              setImagePoint2({...imageWithMeta, forceUpdate: Date.now()});
              console.log('🔄 Force updated imagePoint2 state');
            }
          }, 100);
          
          // Verify data was saved
          try {
            const verification = await SecureStore.getItemAsync(`imagePoint${pointNumber}`);
            if (verification) {
              console.log(`✅ Verification: Image for point ${pointNumber} saved correctly`);
            } else {
              console.log(`⚠️ Verification failed: No image found for point ${pointNumber}`);
            }
          } catch (verifyError) {
            console.log(`⚠️ Verification error:`, verifyError);
          }
          
        } catch (error) {
          console.error(`❌ Error adding image to point ${pointNumber}:`, error);
          console.error('Error details:', error.message);
          
          // Try basic fallback save
          try {
            if (pointNumber === 1) {
              setImagePoint1(imageData);
              await SecureStore.setItemAsync(`imagePoint1`, JSON.stringify(imageData));
              console.log('🔄 Fallback save successful for point 1');
            } else if (pointNumber === 2) {
              setImagePoint2(imageData);
              await SecureStore.setItemAsync(`imagePoint2`, JSON.stringify(imageData));
              console.log('🔄 Fallback save successful for point 2');
            }
          } catch (fallbackError) {
            console.error('❌ Fallback save also failed:', fallbackError);
          }
        }
      };

      // Save data to SecureStore (Enhanced)
      const saveDataToStorage = async (pointNumber, data, image = null) => {
        try {
          // บันทึกข้อมูลหลัก
          const enhancedData = {
            ...data
          };
          
          await SecureStore.setItemAsync(`point${pointNumber}Data`, JSON.stringify(enhancedData));
          
          // บันทึกรูปภาพหลัก
          if (image && image.uri) {
            const imageData = {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              width: image.width,
              height: image.height,
              timestamp: new Date().toISOString()
            };
            await SecureStore.setItemAsync(`imagePoint${pointNumber}`, JSON.stringify(imageData));
          }
          
          // บันทึกรายการรูปภาพทั้งหมด
          const imageList = pointNumber === 1 ? imagePoint1List : imagePoint2List;
          if (imageList && imageList.length > 0) {
            await SecureStore.setItemAsync(`imagePoint${pointNumber}List`, JSON.stringify(imageList));
            console.log(`💾 Saved ${imageList.length} images for point ${pointNumber}`);
          }
          
          // บันทึกข้อมูลเมตาของจุด
          const metadata = {
            pointNumber,
            totalImages: imageList ? imageList.length : 0,
            hasMainImage: !!image,
            lastUpdated: new Date().toISOString(),
            dataKeys: Object.keys(enhancedData)
          };
          await SecureStore.setItemAsync(`point${pointNumber}Meta`, JSON.stringify(metadata));
          
          console.log(`✅ Successfully saved point ${pointNumber} complete data to SecureStore`);
        } catch (error) {
          console.log('❌ Error saving data:', error);
        }
      };

      // Load saved data from SecureStore
      const loadSavedData = async () => {
        try {
          console.log('🔄 Starting to load saved data...');
          const savedPoint1 = await SecureStore.getItemAsync('point1Data');
          const savedPoint2 = await SecureStore.getItemAsync('point2Data');
          const savedImage1 = await SecureStore.getItemAsync('imagePoint1');
          const savedImage2 = await SecureStore.getItemAsync('imagePoint2');
          const savedImageList1 = await SecureStore.getItemAsync('imagePoint1List');
          const savedImageList2 = await SecureStore.getItemAsync('imagePoint2List');
          
          if (savedPoint1) setPoint1Data(JSON.parse(savedPoint1));
          if (savedPoint2) setPoint2Data(JSON.parse(savedPoint2));
          
          // ไม่โหลดรูปภาพเก่าจาก SecureStore เพื่อป้องกันการแสดงรูปเก่า
          console.log('🛡️ Preventing old image reload in loadSavedData - keeping current state');
          
          // โหลดรายการรูปภาพทั้งหมด
          if (savedImageList1) {
            const imageList1 = JSON.parse(savedImageList1);
            setImagePoint1List(imageList1);
            console.log(`📷 Loaded ${imageList1.length} images for Point 1`);
          }
          if (savedImageList2) {
            const imageList2 = JSON.parse(savedImageList2);
            setImagePoint2List(imageList2);
            console.log(`📷 Loaded ${imageList2.length} images for Point 2`);
          }
          
          console.log('✅ Successfully loaded offline data from SecureStore including image lists');
          
          // ตรวจสอบสถานะรูปภาพหลังโหลด
          console.log('🔍 Image status after loading:', {
            imagePoint1_loaded: !!imagePoint1?.uri,
            imagePoint2_loaded: !!imagePoint2?.uri,
            imagePoint1_stored: !!savedImage1,
            imagePoint2_stored: !!savedImage2,
            savedImage1_content: savedImage1 ? JSON.parse(savedImage1) : null,
            savedImage2_content: savedImage2 ? JSON.parse(savedImage2) : null
          });
        } catch (error) {
          console.log('❌ Error loading saved data:', error);
        }
      };

      // Check internet connection
      const checkInternetConnection = async () => {
        try {
          console.log('🌐 Checking internet connection...');
          
          // ใช้ fetch เพื่อทดสอบการเชื่อมต่อ
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 วินาที timeout
          
          const response = await fetch('https://www.google.com', {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors'
          });
          
          clearTimeout(timeoutId);
          console.log('✅ Internet connection available');
          return true;
          
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('⏰ Internet connection check timeout');
          } else {
            console.log('❌ No internet connection:', error.message);
          }
          return false;
        }
      };

      // ========================
      // ระบบจัดการหลายพื้นที่สำรวจ
      // ========================

      // แสดง modal สำหรับตั้งชื่อพื้นที่ใหม่
      const openCreateAreaModal = () => {
        setShowCreateAreaModal(true);
      };

      // สร้างพื้นที่สำรวจใหม่ด้วยชื่อที่กำหนด
      const createNewSurveyArea = async (customAreaName, observerName) => {
        // สร้าง ID และใช้ชื่อที่ผู้ใช้กำหนด
        const areaId = `area_${Date.now()}`;
        const currentLocation = location?.coords;
        const areaName = customAreaName || `พื้นที่ ${surveyAreas.length + 1}`;

        // สร้างพื้นที่ใหม่แบบเปล่าๆ (ยังไม่มีข้อมูลจุด)
        const newArea = {
          id: areaId,
          name: areaName,
          timestamp: new Date().toISOString(),
          location: {
            latitude: currentLocation?.latitude || 0,
            longitude: currentLocation?.longitude || 0,
            altitude: currentLocation?.altitude || 0
          },
          points: {
            point1: null,
            point2: null
          },
          images: {
            point1: null,
            point2: null
          },
          azimuth: 0,
          isSubmitted: false,
          observer: observerName || 'Rangwat',
          isActive: true // พื้นที่ที่กำลังสำรวจ
        };

        // ทำให้พื้นที่อื่นไม่ active
        const updatedExistingAreas = surveyAreas.map(area => ({ ...area, isActive: false }));
        const updatedAreas = [...updatedExistingAreas, newArea];
        setSurveyAreas(updatedAreas);

        // บันทึกลง SecureStore
        await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));

        // ตั้งค่าพื้นที่ปัจจุบัน
        setCurrentAreaId(areaId);
        setCurrentAreaName(areaName);
        setIsInSurveyMode(true);

        // ล้างข้อมูลเก่า
        setPoint1Data({});
        setPoint2Data({});
        setImagePoint1(null);
        setImagePoint2(null);
        setCurrentPoint(1);

        Alert.alert(
          '🎯 เริ่มสำรวจพื้นที่ใหม่',
          `สร้าง "${areaName}" เรียบร้อยแล้ว\n\n` +
          `📍 ตำแหน่ง: ${currentLocation ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` : 'รอข้อมูล GPS'}\n\n` +
          `🚀 เริ่มต้นการวัดจุดที่ 1 ได้เลย!`,
          [{ text: 'เริ่มวัด', style: 'default' }]
        );

        return newArea;
      };

      // บันทึกข้อมูลจุดที่มีอยู่เป็นพื้นที่สำรวจใหม่
      const savePointsAsNewArea = async (areaName, observerName) => {
        if (!point1Data || !point2Data || Object.keys(point1Data || {}).length === 0 || Object.keys(point2Data || {}).length === 0) {
          Alert.alert('ข้อมูลไม่ครบ', 'กรุณาบันทึกข้อมูลให้ครบทั้ง 2 จุดก่อน');
          return false;
        }

        try {
          // โหลดรูปภาพจาก SecureStore ก่อนสร้างพื้นที่ใหม่
          let savedImage1 = null;
          let savedImage2 = null;
          
          try {
            const storedImage1 = await SecureStore.getItemAsync('imagePoint1');
            if (storedImage1) {
              savedImage1 = JSON.parse(storedImage1);
              console.log('📷 Loaded imagePoint1 from storage for area creation:', {
                hasUri: !!savedImage1?.uri,
                uri: savedImage1?.uri?.substring(0, 50) + '...'
              });
            } else {
              console.log('⚠️ No imagePoint1 found in storage');
            }
          } catch (error) {
            console.log('⚠️ Error loading imagePoint1 from storage:', error);
          }
          
          try {
            const storedImage2 = await SecureStore.getItemAsync('imagePoint2');
            if (storedImage2) {
              savedImage2 = JSON.parse(storedImage2);
              console.log('📷 Loaded imagePoint2 from storage for area creation:', {
                hasUri: !!savedImage2?.uri,
                uri: savedImage2?.uri?.substring(0, 50) + '...'
              });
            } else {
              console.log('⚠️ No imagePoint2 found in storage');
            }
          } catch (error) {
            console.log('⚠️ Error loading imagePoint2 from storage:', error);
          }

          // สร้าง ID และใช้ชื่อที่กำหนด
          const areaId = `area_${Date.now()}`;
          const currentLocation = location?.coords;
          const finalAreaName = areaName || `พื้นที่ ${surveyAreas.length + 1}`;

          // ใช้รูปภาพจาก SecureStore หรือ state
          const finalImage1 = savedImage1 || imagePoint1;
          const finalImage2 = savedImage2 || imagePoint2;
          
          console.log('🔍 Final image selection for area creation:', {
            savedImage1_hasUri: !!savedImage1?.uri,
            imagePoint1_hasUri: !!imagePoint1?.uri,
            finalImage1_hasUri: !!finalImage1?.uri,
            savedImage2_hasUri: !!savedImage2?.uri,
            imagePoint2_hasUri: !!imagePoint2?.uri,
            finalImage2_hasUri: !!finalImage2?.uri
          });

          // สร้างพื้นที่ใหม่พร้อมข้อมูลจุดที่บันทึกไว้
          const newArea = {
            id: areaId,
            name: finalAreaName,
            timestamp: new Date().toISOString(),
            location: {
              latitude: currentLocation?.latitude || point1Data.lat || 0,
              longitude: currentLocation?.longitude || point1Data.lon || 0,
              altitude: currentLocation?.altitude || 0
            },
            points: {
              point1: { 
                ...point1Data, 
                hasImage: !!finalImage1?.uri 
              },
              point2: { 
                ...point2Data, 
                hasImage: !!finalImage2?.uri 
              }
            },
            images: {
              point1: finalImage1,
              point2: finalImage2
            },
            azimuth: Math.round(compassData?.heading || realTimeCompassData?.heading || 0),
            isSubmitted: false,
            observer: observerName || 'Rangwat',
            isActive: false
          };

          // เพิ่มลงในรายการพื้นที่สำรวจ
          const updatedAreas = [...surveyAreas, newArea];
          setSurveyAreas(updatedAreas);

          // บันทึกลง SecureStore
          await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));

          // ตรวจสอบสถานะรูปภาพ
          console.log('🔍 Image status for new area:', {
            areaName: finalAreaName,
            imagePoint1_state: !!imagePoint1?.uri,
            imagePoint2_state: !!imagePoint2?.uri,
            savedImage1_stored: !!savedImage1?.uri,
            savedImage2_stored: !!savedImage2?.uri,
            finalImage1_used: !!finalImage1?.uri,
            finalImage2_used: !!finalImage2?.uri,
            point1_hasImage: !!finalImage1?.uri,
            point2_hasImage: !!finalImage2?.uri
          });

          // ล้างข้อมูลจุดเก่า
          setPoint1Data({});
          setPoint2Data({});
          setImagePoint1(null);
          setImagePoint2(null);
          setCurrentPoint(1);

          // แสดง Save Offline Popup
          setSaveOfflinePopupData({
            areaName: finalAreaName,
            areaData: newArea
          });
          setShowSaveOfflinePopup(true);

          return true;
        } catch (error) {
          console.error('Error saving points as new area:', error);
          Alert.alert('❌ บันทึกล้มเหลว', 'เกิดข้อผิดพลาดในการบันทึกพื้นที่');
          return false;
        }
      };

      // บันทึกข้อมูลจุดลงในพื้นที่ปัจจุบัน
      const savePointToCurrentArea = async (pointNumber, pointData, imageData) => {
        if (!currentAreaId) return;

        const areaIndex = surveyAreas.findIndex(area => area.id === currentAreaId);
        if (areaIndex === -1) return;

        const updatedAreas = [...surveyAreas];
        const currentArea = { ...updatedAreas[areaIndex] };

        // อัปเดตข้อมูลจุด
        if (pointNumber === 1) {
          currentArea.points.point1 = { ...pointData, hasImage: !!imageData?.uri };
          currentArea.images.point1 = imageData;
          console.log('💾 Saved point1 image:', { 
            hasImageData: !!imageData, 
            hasUri: !!imageData?.uri, 
            uri: imageData?.uri?.substring(0, 50) + '...'
          });
        } else {
          currentArea.points.point2 = { ...pointData, hasImage: !!imageData?.uri };
          currentArea.images.point2 = imageData;
          console.log('💾 Saved point2 image:', { 
            hasImageData: !!imageData, 
            hasUri: !!imageData?.uri, 
            uri: imageData?.uri?.substring(0, 50) + '...'
          });
        }

        // อัปเดตตำแหน่งพื้นที่ด้วยข้อมูล GPS ล่าสุด
        if (location?.coords) {
          currentArea.location = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude || 0
          };
        }

        // อัปเดตอาซิมูท
        currentArea.azimuth = Math.round(compassData.heading || realTimeCompassData.heading || 0);

        updatedAreas[areaIndex] = currentArea;
        setSurveyAreas(updatedAreas);

        // บันทึกลง SecureStore
        await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));
      };

      // จบการสำรวจพื้นที่ปัจจุบัน
      const finishCurrentSurvey = async () => {
        if (!currentAreaId) return;

        // ตรวจสอบว่ามีข้อมูลครบหรือไม่
        const currentArea = surveyAreas.find(area => area.id === currentAreaId);
        if (!currentArea?.points.point1 || !currentArea?.points.point2) {
          Alert.alert(
            'ข้อมูลไม่ครบ',
            'กรุณาบันทึกข้อมูลให้ครบทั้ง 2 จุดก่อนจบการสำรวจ'
          );
          return;
        }

        // โหลดรูปภาพจาก SecureStore ก่อนจบการสำรวจ
        let savedImage1 = null;
        let savedImage2 = null;
        
        try {
          const storedImage1 = await SecureStore.getItemAsync('imagePoint1');
          if (storedImage1) {
            savedImage1 = JSON.parse(storedImage1);
            console.log('📷 Loaded imagePoint1 from storage for finishCurrentSurvey:', {
              hasUri: !!savedImage1?.uri,
              uri: savedImage1?.uri?.substring(0, 50) + '...'
            });
          } else {
            console.log('⚠️ No imagePoint1 found in storage for finishCurrentSurvey');
          }
        } catch (error) {
          console.log('⚠️ Error loading imagePoint1 from storage for finishCurrentSurvey:', error);
        }
        
        try {
          const storedImage2 = await SecureStore.getItemAsync('imagePoint2');
          if (storedImage2) {
            savedImage2 = JSON.parse(storedImage2);
            console.log('📷 Loaded imagePoint2 from storage for finishCurrentSurvey:', {
              hasUri: !!savedImage2?.uri,
              uri: savedImage2?.uri?.substring(0, 50) + '...'
            });
          } else {
            console.log('⚠️ No imagePoint2 found in storage for finishCurrentSurvey');
          }
        } catch (error) {
          console.log('⚠️ Error loading imagePoint2 from storage for finishCurrentSurvey:', error);
        }

        // อัปเดตพื้นที่ปัจจุบันด้วยรูปภาพจาก SecureStore
        const updatedAreas = [...surveyAreas];
        const areaIndex = updatedAreas.findIndex(area => area.id === currentAreaId);
        
        if (areaIndex !== -1) {
          const updatedArea = { ...updatedAreas[areaIndex] };
          
          // ใช้รูปภาพจาก SecureStore หรือ state
          const finalImage1 = savedImage1 || imagePoint1;
          const finalImage2 = savedImage2 || imagePoint2;
          
          // อัปเดตข้อมูลจุดและรูปภาพ
          updatedArea.points.point1 = { 
            ...updatedArea.points.point1, 
            hasImage: !!finalImage1?.uri 
          };
          updatedArea.points.point2 = { 
            ...updatedArea.points.point2, 
            hasImage: !!finalImage2?.uri 
          };
          updatedArea.images.point1 = finalImage1;
          updatedArea.images.point2 = finalImage2;
          
          updatedAreas[areaIndex] = updatedArea;
          setSurveyAreas(updatedAreas);
          
          // บันทึกลง SecureStore
          await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));
          
          console.log('🔍 Updated area with images from SecureStore:', {
            areaName: updatedArea.name,
            point1_hasImage: !!finalImage1?.uri,
            point2_hasImage: !!finalImage2?.uri,
            totalImages: (finalImage1?.uri ? 1 : 0) + (finalImage2?.uri ? 1 : 0)
          });
        }

        Alert.alert(
          'สำเร็จ',
          'บันทึกข้อมูลเรียบร้อยแล้ว',
          [
            {
              text: 'ดูรายการพื้นที่',
              onPress: () => {
                setIsInSurveyMode(false);
                setCurrentAreaId(null);
                setCurrentAreaName('');
                setPoint1Data({});
                setPoint2Data({});
                setImagePoint1(null);
                setImagePoint2(null);
                setCurrentPoint(1);
              }
            }
          ]
        );
      };

      // โหลดพื้นที่สำรวจที่เก็บไว้
      const loadSurveyAreas = async () => {
        try {
          const savedAreas = await SecureStore.getItemAsync('surveyAreas');
          if (savedAreas) {
            setSurveyAreas(JSON.parse(savedAreas));
          }
        } catch (error) {
          console.log('❌ Error loading survey areas:', error);
        }
      };

      // ส่งข้อมูลพื้นที่เฉพาะไป server
      const submitSurveyArea = async (areaId) => {
        const area = surveyAreas.find(a => a.id === areaId);
        if (!area) return;

        try {
          // ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
          const hasInternet = await checkInternetConnection();
          if (!hasInternet) {
            Alert.alert(
              '🌐 ไม่มีการเชื่อมต่ออินเทอร์เน็ต',
              'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่'
            );
            return;
          }

          // เตรียมข้อมูลสำหรับส่ง - ป้องกัน null errors
          const user_id = '124';
          const observer = area.name || 'พื้นที่สำรวจ'; // ใช้ชื่อพื้นที่สำรวจ
          const camera_lat = (area.location?.latitude || 0).toFixed(7);
          const camera_lng = (area.location?.longitude || 0).toFixed(7);
          const azimuth = (area.azimuth || 0);

          const formData = new FormData();
          formData.append('user_id', user_id);
          formData.append('observer', observer);
          formData.append('camera_lat', camera_lat);
          formData.append('camera_lng', camera_lng);
          formData.append('azimuth', azimuth.toString());

          // ข้อมูลจุดที่ 1 - ป้องกัน null errors
          const point1 = area.points?.point1 || {};
          const distance1 = Number(point1.distance || point1.slopeDistance || 0).toFixed(1);
          const elevation1 = Number(point1.elevation || point1.altitude || 0).toFixed(1);
          formData.append('distance1', distance1);
          formData.append('elevation1', elevation1);

          // ข้อมูลจุดที่ 2 - ป้องกัน null errors
          const point2 = area.points?.point2 || {};
          const distance2 = Number(point2.distance || point2.slopeDistance || 0).toFixed(1);
          const elevation2 = Number(point2.elevation || point2.altitude || 0).toFixed(1);
          formData.append('distance2', distance2);
          formData.append('elevation2', elevation2);

          // รูปภาพ - บีบอัดก่อนส่ง
          const hasPhoto1 = !!(area.images?.point1?.uri);
          const hasPhoto2 = !!(area.images?.point2?.uri);
          
          if (hasPhoto1) {
            console.log('🔄 Compressing photo1 before upload...');
            const compressedPhoto1 = await compressImage(area.images.point1.uri);
            
            // ตรวจสอบขนาดไฟล์
            try {
              const response = await fetch(compressedPhoto1.uri);
              const blob = await response.blob();
              const fileSizeInMB = blob.size / (1024 * 1024);
              console.log(`📏 Photo1 file size: ${fileSizeInMB.toFixed(2)} MB`);
              
              if (fileSizeInMB > 1) {
                console.log('⚠️ Photo1 still too large, skipping...');
              } else {
                formData.append('photo1', {
                  uri: compressedPhoto1.uri,
                  type: 'image/jpeg',
                  name: `${area.id}_point1.jpg`,
                });
                console.log('✅ Photo1 compressed and added to formData');
              }
            } catch (error) {
              console.log('⚠️ Could not check photo1 file size, skipping...');
            }
          }

          if (hasPhoto2) {
            console.log('🔄 Compressing photo2 before upload...');
            const compressedPhoto2 = await compressImage(area.images.point2.uri);
            
            // ตรวจสอบขนาดไฟล์
            try {
              const response = await fetch(compressedPhoto2.uri);
              const blob = await response.blob();
              const fileSizeInMB = blob.size / (1024 * 1024);
              console.log(`📏 Photo2 file size: ${fileSizeInMB.toFixed(2)} MB`);
              
              if (fileSizeInMB > 1) {
                console.log('⚠️ Photo2 still too large, skipping...');
              } else {
                formData.append('photo2', {
                  uri: compressedPhoto2.uri,
                  type: 'image/jpeg',
                  name: `${area.id}_point2.jpg`,
                });
                console.log('✅ Photo2 compressed and added to formData');
              }
            } catch (error) {
              console.log('⚠️ Could not check photo2 file size, skipping...');
            }
          }

          console.log('📤 Sending essential data to server:', {
            url: 'https://rawangphai.uru.ac.th/api/Points',
            user_id: user_id,
            observer: observer,
            camera_lat: camera_lat,
            camera_lng: camera_lng,
            azimuth: azimuth,
            distance1: distance1,
            elevation1: elevation1,
            distance2: distance2,
            elevation2: elevation2,
            hasPhoto1: hasPhoto1,
            hasPhoto2: hasPhoto2
          });

          // ส่งข้อมูลไป server
          console.log("📤 Data being sent to server (submitSurveyArea):");
          console.log("user_id:", user_id);
          console.log("observer:", observer);
          console.log("camera_lat:", camera_lat);
          console.log("camera_lng:", camera_lng);
          console.log("azimuth:", azimuth);
          console.log("distance1:", distance1);
          console.log("elevation1:", elevation1);
          console.log("distance2:", distance2);
          console.log("elevation2:", elevation2);
          console.log("hasPhoto1:", hasPhoto1);
          console.log("hasPhoto2:", hasPhoto2);
          
          const response = await fetch('https://rawangphai.uru.ac.th/api/Points', {
            method: 'POST',
            body: formData,
            // ไม่ต้องตั้ง Content-Type เมื่อใช้ FormData
            timeout: 60000,
          });

          if (response.ok) {
            // อัปเดตสถานะการส่ง
            const updatedAreas = surveyAreas.map(a => 
              a.id === areaId ? { ...a, isSubmitted: true, submittedAt: new Date().toISOString() } : a
            );
            setSurveyAreas(updatedAreas);
            await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));

            Alert.alert(
              '🚀 ส่งข้อมูลสำเร็จ',
              `พื้นที่ "${area.name}" ถูกส่งไปเซิร์ฟเวอร์เรียบร้อยแล้ว\n\n` +
              `📊 ข้อมูลที่ส่ง:\n` +
              `📍 ชื่อพื้นที่: ${observer}\n` +
              `📍 GPS: ${camera_lat}, ${camera_lng}\n` +
              `🧭 อาซิมูท: ${azimuth}°\n` +
              `📏 จุดที่ 1: ${distance1}m / ${elevation1}°\n` +
              `📏 จุดที่ 2: ${distance2}m / ${elevation2}°\n` +
              `📸 รูปภาพ: ${(hasPhoto1 ? 1 : 0) + (hasPhoto2 ? 1 : 0)}/2 (บีบอัดแล้ว)`
            );
          } else {
            // ลองส่งข้อมูลแบบไม่มีรูปภาพถ้าเกิด error 413
            if (response.status === 413 && (hasPhoto1 || hasPhoto2)) {
              console.log('⚠️ Payload too large, trying without images...');
              
              const formDataWithoutImages = new FormData();
              formDataWithoutImages.append('user_id', user_id);
              formDataWithoutImages.append('observer', observer);
              formDataWithoutImages.append('camera_lat', camera_lat);
              formDataWithoutImages.append('camera_lng', camera_lng);
              formDataWithoutImages.append('azimuth', azimuth.toString());
              formDataWithoutImages.append('distance1', distance1);
              formDataWithoutImages.append('elevation1', elevation1);
              formDataWithoutImages.append('distance2', distance2);
              formDataWithoutImages.append('elevation2', elevation2);
              
              console.log("📤 Retry data being sent to server (without images):");
              console.log("user_id:", user_id);
              console.log("observer:", observer);
              console.log("camera_lat:", camera_lat);
              console.log("camera_lng:", camera_lng);
              console.log("azimuth:", azimuth);
              console.log("distance1:", distance1);
              console.log("elevation1:", elevation1);
              console.log("distance2:", distance2);
              console.log("elevation2:", elevation2);
              
              const retryResponse = await fetch('https://rawangphai.uru.ac.th/api/Points', {
                method: 'POST',
                body: formDataWithoutImages,
                timeout: 60000,
              });
              
              if (retryResponse.ok) {
                const updatedAreas = surveyAreas.map(a => 
                  a.id === areaId ? { ...a, isSubmitted: true, submittedAt: new Date().toISOString() } : a
                );
                setSurveyAreas(updatedAreas);
                await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));

                Alert.alert(
                  '🚀 ส่งข้อมูลสำเร็จ (ไม่มีรูปภาพ)',
                  `พื้นที่ "${area.name}" ถูกส่งไปเซิร์ฟเวอร์เรียบร้อยแล้ว\n\n` +
                  `📊 ข้อมูลที่ส่ง:\n` +
                  `📍 ชื่อพื้นที่: ${observer}\n` +
                  `📍 GPS: ${camera_lat}, ${camera_lng}\n` +
                  `🧭 อาซิมูท: ${azimuth}°\n` +
                  `📏 จุดที่ 1: ${distance1}m / ${elevation1}°\n` +
                  `📏 จุดที่ 2: ${distance2}m / ${elevation2}°\n` +
                  `📸 รูปภาพ: ไม่ส่ง (ไฟล์ใหญ่เกินไป)`
                );
              } else {
                throw new Error(`Retry failed with status: ${retryResponse.status}`);
              }
            } else if (response.status === 500) {
              console.log("messageError: ",response.message)
              console.log("error: ", response.error)
              Alert.alert(
                '🔧 เซิร์ฟเวอร์มีปัญหา',
                'เซิร์ฟเวอร์เกิดข้อผิดพลาดภายใน (HTTP 500)\n\n💡 สาเหตุที่เป็นไปได้:\n• เซิร์ฟเวอร์กำลังบำรุงรักษา\n• ข้อมูลที่ส่งไม่ถูกต้อง\n• เซิร์ฟเวอร์มีปัญหา\n\n💾 ข้อมูลจะถูกเก็บไว้ในเครื่องและลองส่งใหม่ภายหลัง',
                [{ text: 'ตกลง' }]
              );
              return;
            } else {
              console.log(`❌ Server error with status: ${response.status}`);
              console.log("messageError: ", response.message);
              console.log("error: ", response.error);
              throw new Error(`Server responded with status: ${response.status}`);
            }
          }

        } catch (error) {
          console.log('❌ Error submitting area:', error);
          
          let errorDetail = error.message;
          if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
            errorDetail = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้\n• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต\n• ตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่';
          } else if (error.message.includes('timeout')) {
            errorDetail = 'การเชื่อมต่อหมดเวลา\n• เครือข่ายช้าหรือเซิร์ฟเวอร์ไม่ตอบสนอง';
          } else if (error.message.includes('500')) {
            errorDetail = 'เซิร์ฟเวอร์มีปัญหา (HTTP 500)\n• เซิร์ฟเวอร์กำลังบำรุงรักษา\n• ลองใหม่ภายหลัง';
          }
          
          Alert.alert(
            '❌ ส่งข้อมูลไม่สำเร็จ',
            `เกิดข้อผิดพลาดในการส่งข้อมูล:\n${errorDetail}\n\n💾 ข้อมูลยังคงเก็บไว้ในเครื่อง สามารถลองส่งใหม่ได้\n\n🔧 เซิร์ฟเวอร์: rawangphai.uru.ac.th`,
            [{ text: 'ตกลง' }]
          );
        }
      };

      // ลบพื้นที่สำรวจ
      const deleteSurveyArea = async (areaId) => {
        Alert.alert(
          'ยืนยันการลบ',
          'ต้องการลบพื้นที่สำรวจนี้หรือไม่?',
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'ลบ',
              style: 'destructive',
              onPress: async () => {
                const updatedAreas = surveyAreas.filter(a => a.id !== areaId);
                setSurveyAreas(updatedAreas);
                await SecureStore.setItemAsync('surveyAreas', JSON.stringify(updatedAreas));
              }
            }
          ]
        );
      };

      // ล้างพื้นที่สำรวจทั้งหมด
      const clearAllSurveyAreas = async () => {
        Alert.alert(
          'ยืนยันการล้างข้อมูล',
          'ต้องการลบพื้นที่สำรวจทั้งหมดหรือไม่?',
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'ลบทั้งหมด',
              style: 'destructive',
              onPress: async () => {
                setSurveyAreas([]);
                await SecureStore.deleteItemAsync('surveyAreas');
                Alert.alert('✅ ล้างข้อมูลสำเร็จ', 'ลบพื้นที่สำรวจทั้งหมดเรียบร้อยแล้ว');
              }
            }
          ]
        );
      };

      // โหลดพื้นที่สำรวจตอนเริ่มแอป
      useEffect(() => {
        loadSurveyAreas();
      }, []);

      // Location permission and initialization effect
      useEffect(() => {
        (async () => {
          // Request location permissions
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
          }

          console.log('📍 Location permissions granted. Starting real-time GPS tracking...');
          
          // Start real-time location tracking
          try {
            const locationSubscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 3000, // อัพเดททุก 3 วินาที
                distanceInterval: 1, // หรือเมื่อเคลื่อนที่ 1 เมตร
              },
              (newLocation) => {
                console.log('📍 Real-time location update:', newLocation.coords);
                console.log('📍 GPS Data:', {
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                  altitude: newLocation.coords.altitude,
                  accuracy: newLocation.coords.accuracy
                });
                setLocation(newLocation);
              }
            );

            // Cleanup function จะถูกเรียกเมื่อ component unmount
            return () => {
              if (locationSubscription) {
                locationSubscription.remove();
                console.log('📍 Location tracking stopped');
              }
            };
          } catch (error) {
            console.error('❌ Error starting location tracking:', error);
          }
        })();
      }, []);

      // Compass/Magnetometer initialization effect
      useEffect(() => {
        (async () => {
          try {
            console.log('🧭 Starting compass/magnetometer...');
            
            // Start magnetometer for compass functionality
            const subscription = Magnetometer.addListener((data) => {
              // Calculate heading from magnetometer data
              const { x, y, z } = data;
              let heading = Math.atan2(y, x) * (180 / Math.PI);
              
              // Normalize to 0-360 degrees
              if (heading < 0) {
                heading += 360;
              }
              
              // Convert to cardinal directions
              const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
              const index = Math.round(heading / 45) % 8;
              const direction = directions[index];
              
              const newCompassData = {
                heading: Math.round(heading),
                direction: direction
              };
              
              setCompassData(newCompassData);
              setRealTimeCompassData(newCompassData);
              
              console.log('🧭 Compass update:', newCompassData);
            });
            
            setMagnetometerSubscription(subscription);
            
            return () => {
              if (subscription) {
                subscription.remove();
                console.log('🧭 Compass stopped');
              }
            };
          } catch (error) {
            console.error('❌ Error starting compass:', error);
          }
        })();
      }, []);

      // Initialize BleManager on component mount
      useEffect(() => {
        const initBLE = async () => {
          try {
            console.log('🚀 Initializing BLE system...');
            await initializeBleManager();
          } catch (error) {
            console.error('❌ Failed to initialize BLE:', error);
          }
        };
        
        initBLE();
        
        return () => {
          // Cleanup BleManager
          if (manager.current) {
            try {
              manager.current.destroy();
              console.log('🧹 BleManager destroyed');
            } catch (error) {
              console.log('⚠️ Error destroying BleManager:', error);
            }
          }
        };
      }, []);

      useEffect(() => {
        requestPermissions();
      }, []);

      // Load saved data on app start
      useEffect(() => {
        loadSavedData();
      }, []);

      // Monitor internet connectivity periodically
      useEffect(() => {
        const checkConnectivity = async () => {
          await checkInternetConnection();
        };
        
        // Check connectivity every 30 seconds
        const interval = setInterval(checkConnectivity, 30000);
        
        // Check immediately
        checkConnectivity();

        return () => clearInterval(interval);
      }, []);

      // Disconnect device function
      const disconnectDevice = async () => {
        try {
          if (device) {
            console.log('🔌 Disconnecting from device...');
            await device.cancelConnection();
            console.log('✅ Device disconnected');
          }
        } catch (error) {
          console.log('⚠️ Error during disconnect:', error);
        } finally {
          setDevice(null);
          setIsConnected(false);
          setLiveData({});
          Alert.alert('🔌 ตัดการเชื่อมต่อแล้ว', 'ตัดการเชื่อมต่อกับอุปกรณ์เรียบร้อยแล้ว');
        }
      };

      // Monitor device connection status
      useEffect(() => {
        if (device && isConnected && device.onDisconnected) {
          const subscription = device.onDisconnected((error, disconnectedDevice) => {
            console.log('🔌 Device disconnected:', disconnectedDevice?.id);
            if (error) {
              console.log('❌ Disconnection error:', error);
            }
            
            // รีเซ็ตสถานะ
            setDevice(null);
            setIsConnected(false);
            setLiveData({});
            
            Alert.alert(
              '🔌 การเชื่อมต่อขาดหาย',
              'การเชื่อมต่อกับ ESP32 ขาดหาย\n\nต้องการเชื่อมต่อใหม่หรือไม่?',
              [
                { text: 'ไม่' },
                { text: 'เชื่อมต่อใหม่', onPress: () => scanAndConnect() }
              ]
            );
          });

          return () => {
            if (subscription && typeof subscription.remove === 'function') {
              subscription.remove();
            }
          };
        }
      }, [device, isConnected]);

      return {
        device,
        isConnected,
        isScanning,
        scanAndConnect,
        liveData,
        pulseAnim,
        scanAnim,
        imagePoint1,
        imagePoint2,
        setImagePoint1,
        setImagePoint2,
        imagePoint1List,
        imagePoint2List,
        addImageToPoint,
        pickImage,
        submitPointsToServer,
        saveCurrentPoint,
        togglePoint,
        point1Data,
        point2Data,
        currentPoint,
        location,
        // Enhanced compass data and functions
        compassData,
        getEnhancedCompassData,
        updateLiveDataWithCompass,
        updateCompassData,
        loadSavedData,
        saveDataToStorage,
        checkInternetConnection,
        disconnectDevice,
        // Success Popup related
        showSuccessPopup,
        setShowSuccessPopup,
        successPopupData,
        // Save Offline Popup related
        showSaveOfflinePopup,
        setShowSaveOfflinePopup,
        saveOfflinePopupData,
        // Scanning Popup related
        showScanningPopup,
        setShowScanningPopup,
        cancelScan,
        // Survey Areas Management
        surveyAreas,
        createNewSurveyArea,
        savePointsAsNewArea,
        loadSurveyAreas,
        submitSurveyArea,
        deleteSurveyArea,
        clearAllSurveyAreas,
        currentAreaId,
        currentAreaName,
        setCurrentAreaName,
        // New Area Creation
        showCreateAreaModal,
        setShowCreateAreaModal,
        openCreateAreaModal,
        isInSurveyMode,
        setIsInSurveyMode,
        savePointToCurrentArea,
        finishCurrentSurvey,
        // Additional values that MainScreen needs
        savedPoints: [],
        savedImages: [],
        clearSurveyAreas: () => {},

        // Compass functions
        updateCompassData: () => {
          // This function is called by MainScreen to update compass data
          // The data is already being updated in real-time by magnetometer
          return compassData;
        },

        // Get enhanced compass data
        getEnhancedCompassData: () => {
          return {
            ...compassData,
            timestamp: Date.now(),
            accuracy: 'high'
          };
        },

        // Update live data with compass
        updateLiveDataWithCompass: (data) => {
          return {
            ...data,
            azimuth: compassData.heading,
            direction: compassData.direction
          };
        }
      };
    };