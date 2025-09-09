import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CompassView from './CompassView';

const LiveDataCard = ({ 
  gpsData, 
  compassData, 
  accelerometerData, 
  gyroscopeData, 
  magnetometerData,
  bleData,
  pulseAnim,
  location,
  updateCompassData
}) => {
  // State สำหรับเก็บข้อมูลเข็มทิศจริง
  const [realCompassData, setRealCompassData] = useState({ heading: 0, direction: 'N' });

  // Fixed animation - use useRef properly to avoid React errors
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Debug: แสดงข้อมูลที่ได้รับ
  console.log('🖥️ LiveDataCard received data:', {
    gpsData,
    compassData,
    bleData,
    realCompassData
  });



  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseScale]);
  
  if (!bleData || Object.keys(bleData).length === 0) {
    return null;
  }

  const isNormalMode = bleData.mode === 1;

  // ใช้ค่า GPS จริงจากมือถือเป็นหลัก
  const latitude = gpsData?.latitude || location?.coords?.latitude || bleData.lat || 0;
  const longitude = gpsData?.longitude || location?.coords?.longitude || bleData.lon || 0;
  const altitude = gpsData?.altitude || location?.coords?.altitude || bleData.altitude || 0;

  // รวมข้อมูลจาก GPS จริงกับข้อมูลจาก ESP32 และเข็มทิศจริง
  const combinedSensorData = {
    ...bleData,
    // เขียนทับด้วยค่า GPS จริงจากมือถือ (แต่ไม่เขียนทับ elevation และ distance จาก ESP32)
    lat: latitude,
    lon: longitude,
    // เขียนทับด้วยค่าอาซิมูทจริงจากเข็มทิศ
    azimuth: realCompassData.heading
    // ไม่เขียนทับ elevation และ distance จาก ESP32
  };

  // แยกข้อมูลที่ต้องการแสดงเท่านั้น - 5 ค่าที่จำเป็น
  const requiredKeys = ['lat', 'lon', 'elevation', 'azimuth', 'distance'];
  const excludedKeys = ['roll', 'yaw', 'accuracy', 'deviceId', 'pointNumber']; // ข้อมูลที่ไม่ต้องการแสดง
  const otherSensorData = Object.entries(combinedSensorData)
    .filter(([key]) => requiredKeys.includes(key) && !excludedKeys.includes(key));

  // จัดเรียงลำดับการแสดงผล - ให้อาซิมูทอยู่ข้างมุมเงย
  const displayOrder = ['elevation', 'azimuth', 'distance', 'lat', 'lon'];
  const sortedSensorData = otherSensorData.sort(([keyA], [keyB]) => {
    const indexA = displayOrder.indexOf(keyA);
    const indexB = displayOrder.indexOf(keyB);
    
    // ถ้าไม่อยู่ใน displayOrder ให้ไปท้ายสุด
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    
    return indexA - indexB;
  });

  const getIcon = (key) => {
    switch(key) {
      case 'elevation':
        return <FontAwesome5 name="angle-up" size={18} color="#475569" />;
      case 'azimuth':
        return <MaterialCommunityIcons name="compass" size={18} color="#475569" />;
      case 'distance':
        return <MaterialCommunityIcons name="ruler" size={18} color="#475569" />;
      case 'lat':
        return <Ionicons name="location" size={18} color="#475569" />;
      case 'lon':
        return <Ionicons name="location" size={18} color="#475569" />;
      default:
        return <Ionicons name="analytics" size={18} color="#475569" />;
    }
  };

  const getLabel = (key) => {
    switch(key) {
      case 'elevation': return 'มุมเงย';
      case 'azimuth': return 'อาซิมูท';
      case 'distance': return 'ระยะทาง';
      case 'lat': return 'ละติจูด';
      case 'lon': return 'ลองจิจูด';
      default: return key;
    }
  };

  const getUnit = (key) => {
    switch(key) {
      case 'elevation':
      case 'azimuth':
        return '°';
      case 'distance':
        return 'm';
      case 'lat':
      case 'lon':
        return '';
      default:
        return '';
    }
  };

  const formatValue = (key, value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return `--${getUnit(key)}`;
    }
    
    switch(key) {
      case 'lat':
      case 'lon':
        return Number(value).toFixed(7); // 7 ทศนิยมสำหรับพิกัดตามที่กำหนด
      case 'azimuth':
        // แสดงทั้งค่าองศาและทิศทาง (ไม่มีทศนิยม)
        return `${Math.round(value)}° (${realCompassData.direction})`;
      case 'elevation':
        return `${Number(value).toFixed(1)}${getUnit(key)}`; // 1 ทศนิยมสำหรับมุมเงย
      case 'distance':
        return `${Number(value).toFixed(1)}${getUnit(key)}`; // 1 ทศนิยมสำหรับระยะทาง
      default:
        return `${Number(value).toFixed(1)}${getUnit(key)}`; // 1 ทศนิยมเป็นค่าเริ่มต้น
    }
  };

  // ฟังก์ชันรวมสำหรับอัพเดตข้อมูลเข็มทิศ
  const handleCompassUpdate = (compassInfo) => {
    console.log('🧭 LiveDataCard received compass update:', compassInfo);
    
    // อัพเดต state ภายใน LiveDataCard
    setRealCompassData(compassInfo);
    
    // ส่งข้อมูลไปยัง useBLE hook ด้วย
    if (updateCompassData) {
      updateCompassData(compassInfo);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={isNormalMode ? ['#f0fdf4', '#dcfce7'] : ['#fef2f2', '#fee2e2']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons
              name="pulse"
              size={18}
              color={isNormalMode ? '#16a34a' : '#dc2626'}
            />
            <Text style={[
              styles.title,
              {color: isNormalMode ? '#16a34a' : '#dc2626'}
            ]}>
              ข้อมูลปัจจุบัน
            </Text>
          </View>

          <View style={[
            styles.statusBadge,
            {backgroundColor: isNormalMode ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)'}
          ]}>
            <Animated.View style={[
              styles.statusDot,
              {backgroundColor: isNormalMode ? '#16a34a' : '#dc2626'},
              {
                transform: [{
                  scale: pulseScale.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [1, 1.3]
                  })
                }]
              }
            ]} />
            <Text style={[
              styles.statusText,
              {color: isNormalMode ? '#16a34a' : '#dc2626'}
            ]}>
              {isNormalMode ? 'โหมดปกติ' : 'โหมดแจ้งเตือน'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Compass View */}
      <CompassView
        latitude={latitude}
        longitude={longitude}
        altitude={altitude}
        location={{ coords: { latitude, longitude, altitude } }}
        onCompassUpdate={handleCompassUpdate}
      />

      {/* Other Sensor Data */}
      {otherSensorData.length > 0 && (
        <View style={styles.sensorDataContainer}>
          <View style={styles.sensorHeader}>
            <MaterialCommunityIcons name="chip" size={16} color="#64748b" />
            <Text style={styles.sensorHeaderText}>ข้อมูลเซ็นเซอร์อื่นๆ</Text>
          </View>
          
          <View style={styles.sensorGrid}>
            {sortedSensorData.map(([key, value]) => (
              <View key={key} style={styles.sensorItem}>
                <View style={styles.sensorIcon}>
                  {getIcon(key)}
                </View>
                <Text style={styles.sensorLabel}>{getLabel(key)}</Text>
                <Text style={styles.sensorValue}>
                  {formatValue(key, value)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.updateText}>
          🧭 เข็มทิศ: ความแม่นยำสูง | 📡 เซ็นเซอร์: จาก ESP32 | 📍 GPS: ความแม่นยำสูง
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sensorDataContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorItem: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  sensorIcon: {
    marginBottom: 6,
  },
  sensorLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  normalValue: {
    color: '#0f172a',
  },
  dangerValue: {
    color: '#dc2626',
  },
  footer: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  updateText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default LiveDataCard;