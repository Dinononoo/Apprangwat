/**
 * Native Compass View - Uses Phone's Built-in Compass API Directly
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Platform, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DeviceMotion, Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.85, 320);

const CompassView = ({ style, latitude = 0, longitude = 0, altitude = 0, location, onCompassUpdate }) => {
  // State variables
  const [heading, setHeading] = useState(0);
  const [trueHeading, setTrueHeading] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [showCalibration, setShowCalibration] = useState(false);
  const [calibrationNeeded, setCalibrationNeeded] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [magneticFieldStrength, setMagneticFieldStrength] = useState(0);
  const [showInterferenceWarning, setShowInterferenceWarning] = useState(false);

  // Animation refs - Properly initialized to prevent React errors
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const figure8Anim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const infinityRotateAnim = useRef(new Animated.Value(0)).current;
  const lastValidHeadingRef = useRef(0);
  const mountedRef = useRef(true);
  const subscriptionRef = useRef(null);
  const accuracyCheckTimerRef = useRef(null);
  const calibrationDataRef = useRef([]);
  const calibrationTimerRef = useRef(null);

  // Calculate heading from magnetometer data
  const calculateHeading = (magnetometerData) => {
    if (!magnetometerData) return null;
    
    const { x, y, z } = magnetometerData;
    
    // Standard compass calculation
    let heading = Math.atan2(-x, y) * (180 / Math.PI);
    
    // Normalize to 0-360°
    heading = (heading + 360) % 360;
    
    return heading;
  };

  // Get native compass heading from DeviceMotion
  const getNativeHeading = (data) => {
    if (!data) return null;
    
    let heading = null;
    
    // Priority 1: Use native compass heading directly (same as phone's compass app)
    if (data.heading !== undefined && data.heading !== null) {
      heading = data.heading;
      console.log('📱 Using phone native compass:', heading);
    } 
    // Priority 2: Use rotation data (iOS/Android native)
    else if (data.rotation && data.rotation.alpha !== undefined && data.rotation.alpha !== null) {
      heading = data.rotation.alpha;
      console.log('📱 Using rotation.alpha:', heading);
    }
    // Priority 3: Calculate from magnetometer (fallback)
    else if (data.magnetometer) {
      heading = calculateHeading(data.magnetometer);
      console.log('🧮 Using magnetometer calculation:', heading);
    }
    
    if (heading !== null) {
      // Use EXACT same normalization as phone's compass app
      heading = ((heading % 360) + 360) % 360;
      
      // Platform-specific adjustments to match phone's compass exactly
      if (Platform.OS === 'android') {
        // Android compass adjustment - some devices need this
        heading = (360 - heading) % 360;
      } else if (Platform.OS === 'ios') {
        // iOS compass is usually correct, but sometimes needs inversion
        if (data.heading === undefined && data.rotation) {
          heading = (360 - heading) % 360;
        }
      }
      
      console.log('📱 Final phone compass heading:', heading);
    }
    
    return heading;
  };

  // Animate compass rotation
  const animateToHeading = (newHeading) => {
    if (!mountedRef.current || newHeading === null || newHeading === undefined) return;
    
    const currentHeading = lastValidHeadingRef.current;
    let targetHeading = newHeading;
    
    // Handle 360° wrap-around
    if (Math.abs(targetHeading - currentHeading) > 180) {
      if (targetHeading > currentHeading) {
        targetHeading -= 360;
      } else {
        targetHeading += 360;
      }
    }
    
    Animated.timing(rotateAnim, {
      toValue: targetHeading,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    lastValidHeadingRef.current = newHeading;
    setHeading(newHeading);
    
    // ส่งข้อมูลเข็มทิศกลับไปยัง parent component
    if (onCompassUpdate) {
      const direction = getDirectionText(newHeading);
      onCompassUpdate({
        heading: newHeading,
        direction: direction
      });
      console.log('🧭 Sending compass data to parent:', { heading: newHeading, direction });
    }
    
    // บันทึกข้อมูลสำหรับการคาลิเบรต
    if (isCalibrating) {
      collectCalibrationData(newHeading);
    }
  };

  // เก็บข้อมูลสำหรับการคาลิเบรต
  const collectCalibrationData = (heading) => {
    if (!isCalibrating) return;
    
    // เก็บข้อมูลทิศทางที่ได้รับ
    calibrationDataRef.current.push({
      heading,
      timestamp: Date.now()
    });
    
    // คำนวณความคืบหน้าของการคาลิเบรต
    const progress = calculateCalibrationProgress();
    setCalibrationProgress(progress);
    
    // อัพเดทแถบความคืบหน้า
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // ถ้าคาลิเบรตเสร็จแล้ว (ครบ 100%)
    if (progress >= 100) {
      finishCalibration();
    }
  };
  
  // คำนวณความคืบหน้าของการคาลิเบรต (ไม่ใช้แล้ว แต่เก็บไว้เพื่อความเข้ากันได้กับโค้ดส่วนอื่น)
  const calculateCalibrationProgress = () => {
    return 100; // ส่งค่าเป็น 100% เสมอ เนื่องจากไม่ได้แสดงแถบความคืบหน้าแล้ว
  };
  
  // จบการคาลิเบรต
  const finishCalibration = () => {
    setIsCalibrating(false);
    setCalibrationProgress(100);
    
    // คำนวณค่าปรับแต่งเข็มทิศ (ตัวอย่างเท่านั้น)
    console.log('🧭 Calibration complete with', calibrationDataRef.current.length, 'data points');
    
    // รีเซ็ตข้อมูลคาลิเบรต
    calibrationDataRef.current = [];
    
    // ปิดป๊อปอัพทันทีเมื่อคาลิเบรตเสร็จสิ้น โดยไม่สนใจค่าความแม่นยำ
    console.log('🧭 Closing calibration popup automatically');
    setShowCalibration(false);
    
    // เพิ่มค่าความแม่นยำให้สูงขึ้นหลังคาลิเบรต
    setAccuracy(95);
  };

  // เริ่มการคาลิเบรต
  const startCalibration = () => {
    // รีเซ็ตข้อมูลและสถานะ
    calibrationDataRef.current = [];
    setCalibrationProgress(0);
    progressAnim.setValue(0);
    setIsCalibrating(true);
    
    // ตั้งเวลาสำหรับการคาลิเบรตอัตโนมัติ (เร็วขึ้นสำหรับการทดสอบ)
    if (calibrationTimerRef.current) {
      clearTimeout(calibrationTimerRef.current);
    }
    
    // เพิ่มการจำลองการคาลิเบรตให้เสร็จเร็วขึ้นเพื่อการทดสอบ
    calibrationTimerRef.current = setTimeout(() => {
      if (isCalibrating && mountedRef.current) {
        console.log('🧭 Auto-completing calibration for testing');
        setCalibrationProgress(100);
        // เพิ่มค่าความแม่นยำให้สูงขึ้นหลังคาลิเบรต (เพื่อให้ป๊อปอัพปิดอัตโนมัติ)
        setAccuracy(95);
        finishCalibration();
      }
    }, 3000); // ลดเวลาลงเป็น 3 วินาทีเพื่อให้เร็วขึ้น
  };

  // Get direction text
  const getDirectionText = (heading) => {
    // Simplified directions - only main compass points
    if (heading >= 337.5 || heading < 22.5) return 'N';
    if (heading >= 22.5 && heading < 67.5) return 'NE';
    if (heading >= 67.5 && heading < 112.5) return 'E';
    if (heading >= 112.5 && heading < 157.5) return 'SE';
    if (heading >= 157.5 && heading < 202.5) return 'S';
    if (heading >= 202.5 && heading < 247.5) return 'SW';
    if (heading >= 247.5 && heading < 292.5) return 'W';
    if (heading >= 292.5 && heading < 337.5) return 'NW';
    return 'N';
  };

  // Check if compass needs calibration
  const checkCompassAccuracy = () => {
    // ตรวจสอบความแม่นยำของเข็มทิศ
    const needsCalibration = accuracy < 5; // ลดเกณฑ์ลงเป็น 5% เพื่อให้แสดงป๊อปอัพน้อยลง
    
    // ปิดการแสดง popup การปรับเทียบเข็มทิศอัตโนมัติ
    // if (needsCalibration && !showCalibration) {
    //   console.log('🧭 Compass accuracy is extremely low (' + accuracy + '%), showing calibration popup');
    //   setShowCalibration(true);
    //   // การเริ่มคาลิเบรตจะทำโดยอัตโนมัติเมื่อป๊อปอัพแสดง (ในอีเวนต์ onShow)
    // }
    
    // ถ้าความแม่นยำสูงและกำลังแสดงป๊อปอัพอยู่ ให้ปิดป๊อปอัพ
    if (accuracy >= 70 && showCalibration) {
      console.log('🧭 Compass accuracy is good now (' + accuracy + '%), hiding calibration popup');
      setShowCalibration(false);
    }
  };

  // Calculate magnetic field strength
  const calculateMagneticFieldStrength = (data) => {
    if (!data) return 0;
    // คำนวณความแรงของสนามแม่เหล็กจากค่า x, y, z (หน่วย μT - microtesla)
    const strength = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
    return strength;
  };

  // Check if magnetic interference is present
  const checkMagneticInterference = (fieldStrength) => {
    // ค่าปกติของสนามแม่เหล็กโลกอยู่ที่ประมาณ 25-65 μT
    // ถ้าค่าต่ำหรือสูงกว่านี้มาก อาจมีการรบกวนจากสนามแม่เหล็กภายนอก
    const isTooLow = fieldStrength < 20;
    const isTooHigh = fieldStrength > 70;
    const hasInterference = isTooLow || isTooHigh;
    
    if (hasInterference !== showInterferenceWarning) {
      console.log(`🧲 Magnetic field: ${fieldStrength.toFixed(1)} μT - ${hasInterference ? 'Interference detected!' : 'Normal'}`);
      setShowInterferenceWarning(hasInterference);
      
      // ปิดการแสดง popup การปรับเทียบเข็มทิศอัตโนมัติเมื่อมีการรบกวน
      // if (hasInterference && !showCalibration) {
      //   console.log('🧭 Magnetic interference detected, showing calibration popup automatically');
      //   setAccuracy(1); // ตั้งค่าความแม่นยำต่ำมาก
      //   setShowCalibration(true); // แสดงป๊อปอัพคาลิเบรทอัตโนมัติ
      // }
    }
    
    return hasInterference;
  };

  // Initialize compass sensors
  useEffect(() => {
    mountedRef.current = true;
    
    const initializeCompass = async () => {
      try {
        console.log('🚀 Initializing compass...');
        
        // Request permissions for native compass access
        try {
          const locationPermission = await Location.requestForegroundPermissionsAsync();
          console.log('📍 Location permission:', locationPermission.status);
          
          // For Android, also request device motion permissions
          if (Platform.OS === 'android') {
            console.log('📱 Android: Requesting motion sensor access...');
          }
        } catch (permError) {
          console.log('Permission error:', permError);
        }
        
        // Check sensor availability
        const [deviceMotionAvailable, magnetometerAvailable] = await Promise.all([
          DeviceMotion.isAvailableAsync().catch(() => false),
          Magnetometer.isAvailableAsync().catch(() => false)
        ]);
        
        console.log('Sensors available:', { deviceMotionAvailable, magnetometerAvailable });
        
        if (!deviceMotionAvailable && !magnetometerAvailable) {
          throw new Error('No compass sensors available');
        }
        
        // Try DeviceMotion first (native compass)
        if (deviceMotionAvailable) {
          console.log('✅ Using DeviceMotion (Native Compass)');
          
          // Use EXACT same settings as phone's compass app
          DeviceMotion.setUpdateInterval(50); // 20Hz - same as phone's compass
          
          subscriptionRef.current = DeviceMotion.addListener((data) => {
            if (!mountedRef.current) return;
            
            console.log('📱 Raw phone compass data:', {
              heading: data.heading,
              rotation: data.rotation ? data.rotation.alpha : 'none',
              magnetometer: data.magnetometer ? 'available' : 'none'
            });
            
            const nativeHeading = getNativeHeading(data);
            
            if (nativeHeading !== null) {
              animateToHeading(nativeHeading);
              
              // Determine source based on what data was used
              let source = 'Phone Native Compass';
              if (data.heading !== undefined && data.heading !== null) {
                source = 'Phone Native Compass';
                setAccuracy(98); // Higher accuracy for native heading
              } else if (data.rotation && data.rotation.alpha !== undefined) {
                source = 'Phone Rotation Sensor';
                setAccuracy(90);
              }
              
              // ตรวจสอบความผิดปกติของเซนเซอร์และแสดงป๊อปอัพทันที
              if (data.heading === undefined || data.heading < 0 || 
                  (data.magnetometer && (Math.abs(data.magnetometer.x) < 0.1 && 
                                        Math.abs(data.magnetometer.y) < 0.1 && 
                                        Math.abs(data.magnetometer.z) < 0.1))) {
                console.log('⚠️ Abnormal compass sensor detected!');
                setAccuracy(1); // ความแม่นยำต่ำมาก
                checkCompassAccuracy(); // ตรวจสอบทันที
              }
              
              // ตรวจสอบความแรงของสนามแม่เหล็ก (ถ้ามี)
              if (data.magnetometer) {
                const fieldStrength = calculateMagneticFieldStrength(data.magnetometer);
                setMagneticFieldStrength(fieldStrength);
                checkMagneticInterference(fieldStrength);
              }
            }
          });
          
        } else if (magnetometerAvailable) {
          console.log('✅ Using Magnetometer fallback');
          
          Magnetometer.setUpdateInterval(100); // 10Hz
          
          subscriptionRef.current = Magnetometer.addListener((data) => {
            if (!mountedRef.current) return;
            
            const heading = calculateHeading(data);
            setMagnetometerData(data);
            
            // คำนวณความแรงของสนามแม่เหล็ก
            const fieldStrength = calculateMagneticFieldStrength(data);
            setMagneticFieldStrength(fieldStrength);
            
            // ตรวจสอบการรบกวนของสนามแม่เหล็ก
            const hasInterference = checkMagneticInterference(fieldStrength);
            
            if (heading !== null) {
              animateToHeading(heading);
              
              // ปกติตั้งค่าความแม่นยำเป็น 85%
              let currentAccuracy = 85;
              
              // ถ้ามีการรบกวนสนามแม่เหล็ก ให้ลดความแม่นยำลง
              if (hasInterference) {
                currentAccuracy = 5; // ลดความแม่นยำลงเมื่อมีการรบกวน
              }
              
              setAccuracy(currentAccuracy);
              
              // ตรวจสอบความผิดปกติของเซนเซอร์แม่เหล็ก
              if (Math.abs(data.x) < 0.1 && Math.abs(data.y) < 0.1 && Math.abs(data.z) < 0.1) {
                // ถ้าค่าเซนเซอร์แม่เหล็กใกล้ศูนย์มาก แสดงว่าอาจมีการรบกวนหรือต้องการคาลิเบรต
                console.log('⚠️ Abnormal magnetometer readings detected!');
                setAccuracy(1); // ความแม่นยำต่ำมาก
                checkCompassAccuracy(); // ตรวจสอบทันที
              }
            }
          });
        }

        // ไม่ต้องตั้งเวลาตรวจสอบความแม่นยำอีก เพราะจะตรวจสอบทันทีเมื่อพบความผิดปกติ
        // accuracyCheckTimerRef.current = setInterval(checkCompassAccuracy, 10000);
        
      } catch (error) {
        console.log('❌ Compass initialization error:', error);
        
        if (mountedRef.current) {
          setAccuracy(0);
          // ปิดการแสดง popup การปรับเทียบเข็มทิศเมื่อมีข้อผิดพลาด
          // setShowCalibration(true);
        }
      }
    };
    
    initializeCompass();
    
    return () => {
      mountedRef.current = false;
      
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      if (accuracyCheckTimerRef.current) {
        clearInterval(accuracyCheckTimerRef.current);
      }
    };
  }, []);

  // Figure-8 animation for calibration popup
  useEffect(() => {
    if (showCalibration) {
      // Animation for hand movement along infinity path
      const figure8Animation = Animated.loop(
        Animated.timing(figure8Anim, {
          toValue: 1,
          duration: 6000, // ปรับให้ช้าลงเพื่อให้เห็นการเคลื่อนไหวชัดเจนขึ้น
          useNativeDriver: true,
        })
      );
      
      // Animation for infinity symbol rotation
      const infinityRotation = Animated.loop(
        Animated.timing(infinityRotateAnim, {
          toValue: 1,
          duration: 12000, // หมุนช้าๆ
          useNativeDriver: true,
        })
      );
      
      figure8Animation.start();
      infinityRotation.start();
      
      return () => {
        figure8Animation.stop();
        infinityRotation.stop();
      };
    }
  }, [showCalibration]);

  // Pulse animation
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
    
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

  // Create degree marks
  const createDegreeMarks = () => {
    const marks = [];
    for (let i = 0; i < 360; i += 10) {
      const isMainMark = i % 30 === 0;
      const angle = (i - 90) * (Math.PI / 180);
      const outerRadius = (COMPASS_SIZE / 2) - 15;
      const innerRadius = outerRadius - (isMainMark ? 10 : 5);
      
      const x1 = Math.cos(angle) * outerRadius + (COMPASS_SIZE / 2);
      const y1 = Math.sin(angle) * outerRadius + (COMPASS_SIZE / 2);
      const x2 = Math.cos(angle) * innerRadius + (COMPASS_SIZE / 2);
      const y2 = Math.sin(angle) * innerRadius + (COMPASS_SIZE / 2);
      
      marks.push(
        <View
          key={i}
          style={[
            styles.degreeMark,
            {
              position: 'absolute',
              left: Math.min(x1, x2),
              top: Math.min(y1, y2),
              width: Math.abs(x2 - x1) || 1,
              height: Math.abs(y2 - y1) || 1,
              backgroundColor: isMainMark ? '#374151' : '#9ca3af',
              transform: [{ rotate: `${i}deg` }]
            }
          ]}
        />
      );
    }
    return marks;
  };

  // Create cardinal directions
  const createCardinalDirections = () => {
    const directions = [
      { label: 'N', angle: 0, color: '#ef4444' },
      { label: 'E', angle: 90, color: '#3b82f6' },
      { label: 'S', angle: 180, color: '#6b7280' },
      { label: 'W', angle: 270, color: '#3b82f6' }
    ];
    
    return directions.map(({ label, angle, color }) => {
      const radian = (angle - 90) * (Math.PI / 180);
      const radius = (COMPASS_SIZE / 2) - 35;
      const x = Math.cos(radian) * radius + (COMPASS_SIZE / 2) - 16;
      const y = Math.sin(radian) * radius + (COMPASS_SIZE / 2) - 16;
      
      return (
        <View
          key={label}
          style={[
            styles.cardinalDirection,
            {
              position: 'absolute',
              left: x,
              top: y,
              borderColor: color,
            }
          ]}
        >
          <Text style={[styles.cardinalText, { color }]}>{label}</Text>
        </View>
      );
    });
  };

  // Create compass needle
  const createCompassNeedle = () => {
    return (
      <Animated.View
        style={[
          styles.needleContainer,
          {
            transform: [
              { 
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                })
              }
            ]
          }
        ]}
      >
        <View style={styles.needleNorth} />
        <View style={styles.needleSouth} />
      </Animated.View>
    );
  };

  // ตรวจสอบสถานะการคาลิเบรทและปิดป๊อปอัพอัตโนมัติเมื่อเสร็จสิ้น
  useEffect(() => {
    // เมื่อการคาลิเบรทเสร็จสิ้น (ความคืบหน้า 100%) ให้ปิดป๊อปอัพอัตโนมัติ
    if (calibrationProgress >= 100 && isCalibrating && showCalibration) {
      console.log('🧭 Calibration progress reached 100%, closing popup automatically');
      finishCalibration();
    }
  }, [calibrationProgress, isCalibrating, showCalibration]);

  // ตรวจสอบความแม่นยำและปิดป๊อปอัพอัตโนมัติเมื่อความแม่นยำสูงขึ้น
  useEffect(() => {
    if (accuracy >= 70 && showCalibration) {
      console.log('🧭 Accuracy increased to ' + accuracy + '%, closing calibration popup');
      setShowCalibration(false);
    }
  }, [accuracy, showCalibration]);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.directionText}>
            {getDirectionText(heading)} {Math.round(heading)}°
          </Text>
        </View>

        {/* Compass Circle */}
        <View style={styles.compassContainer}>
          <View style={[styles.compassCircle, { width: COMPASS_SIZE, height: COMPASS_SIZE }]}>
            <View style={[styles.compassBackground, { 
              width: COMPASS_SIZE - 6, 
              height: COMPASS_SIZE - 6,
              borderRadius: (COMPASS_SIZE - 6) / 2,
            }]} />
            
            <View style={[styles.marksContainer, { width: COMPASS_SIZE, height: COMPASS_SIZE }]}>
              {createDegreeMarks()}
            </View>

            <View style={[styles.cardinalContainer, { width: COMPASS_SIZE, height: COMPASS_SIZE }]}>
              {createCardinalDirections()}
            </View>

            <View style={[styles.needleWrapper, { width: COMPASS_SIZE, height: COMPASS_SIZE }]}>
              {createCompassNeedle()}
              
              <Animated.View style={[
                styles.centerDot,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: showInterferenceWarning ? '#ff6b6b' : '#ef4444'
                }
              ]} />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Calibration Button - ปิดการแสดงปุ่มปรับเทียบ */}
      {/* {calibrationNeeded && (
        <TouchableOpacity
          style={styles.calibrationButton}
          onPress={() => setShowCalibration(true)}
        >
          <Ionicons name="sync" size={18} color="#fff" />
          <Text style={styles.calibrationButtonText}>Calibrate</Text>
        </TouchableOpacity>
      )} */}

      {/* Calibration Popup - ปิดการแสดง popup การปรับเทียบเข็มทิศ */}
      {/* <Modal
        visible={showCalibration}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalibration(false)}
        onShow={() => {
          // เริ่มคาลิเบรตอัตโนมัติเมื่อป๊อปอัพแสดง
          startCalibration();
          
          // ตั้งเวลาปิดป๊อปอัพอัตโนมัติหลังจาก 5 วินาที (สำรองกรณีการคาลิเบรตไม่เสร็จสมบูรณ์)
          setTimeout(() => {
            if (showCalibration && mountedRef.current) {
              console.log('🧭 Auto-closing calibration popup after timeout');
              finishCalibration(); // เรียกใช้ finishCalibration แทนการตั้งค่าโดยตรง
            }
          }, 5000);
        }}
      > */}
      {/* <View style={styles.modalOverlay}>
          <View style={styles.calibrationModal}>
            <Text style={styles.calibrationTitle}>การปรับเทียบเข็มทิศ</Text>
            
            <Text style={styles.calibrationText}>
              โปรดเคลื่อนไหวอุปกรณ์เป็นรูปเลข 8
            </Text>
            
            <View style={styles.calibrationImageContainer}>
              <Image 
                source={require('../../assets/images/calibration-figure8.gif')} 
                style={styles.calibrationImage}
                resizeMode="contain"
              />
            </View>
            

          </View>
        </View>
      </Modal> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  directionText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 10,
  },
  fieldStrengthText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 5,
  },
  interferenceWarning: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.85)',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  interferenceText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  calibrateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  calibrateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  compassContainer: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  compassCircle: {
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassBackground: {
    position: 'absolute',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  marksContainer: {
    position: 'absolute',
  },
  degreeMark: {
    borderRadius: 0.5,
  },
  cardinalContainer: {
    position: 'absolute',
  },
  cardinalDirection: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardinalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  needleContainer: {
    position: 'absolute',
    width: 4,
    height: COMPASS_SIZE - 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needleNorth: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: (COMPASS_SIZE - 60) * 0.6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  needleSouth: {
    position: 'absolute',
    width: 0,
    height: 0,
    bottom: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: (COMPASS_SIZE - 60) * 0.4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#f3f4f6',
    borderWidth: 0.5,
    borderColor: '#9ca3af',
  },
  needleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },

  calibrationImageContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  calibrationImage: {
    width: '100%',
    height: '100%',
  },

  calibrationModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calibrationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  calibrationText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  calibrationButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  calibrationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default CompassView; 