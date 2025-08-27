import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const LiveDataCard = ({ liveData, pulseAnim }) => {
  const translateKey = (key) => {
    const translations = {
      lat: 'ละติจูด',
      lon: 'ลองจิจูด',
      alt: 'ความสูง',
      slope: 'ความลาดเอียง',
      azimuth: 'มุมแอซิมัท',
      elevation: 'มุมเงย',
      slopeDistance: 'ระยะทางลาดเอียง',
      mode: 'โหมด'
    };
    return translations[key] || key;
  };

  const formatValue = (key, value) => {
    if (key === 'lat' || key === 'lon') return `${value.toFixed(6)}°`;
    if (key === 'alt' || key === 'slopeDistance') return `${value.toFixed(2)} m`;
    if (key === 'slope' || key === 'azimuth' || key === 'elevation') return `${value.toFixed(2)}°`;
    if (key === 'mode') {
      if (value === 1) return "โหมดปกติ";
      if (value === 2) return "โหมดแจ้งเตือน";
      return `โหมด: ${value}`;
    }
    return value;
  };

  const getIconForKey = (key) => {
    switch (key) {
      case 'alt': return '🏔️';
      case 'slope': return '📐';
      case 'azimuth': return '🧭';
      case 'elevation': return '📏';
      case 'slopeDistance': return '📏';
      case 'lat': return '🌐';
      case 'lon': return '🌐';
      case 'mode': return '🔔';
      default: return '📊';
    }
  };

  const modeValue = liveData.mode;
  const isAlertMode = modeValue === 2;

  return (
    <View style={[styles.container, isAlertMode ? styles.alert : styles.normal]}>
      <View style={styles.header}>
        <View style={styles.status}>
          <Animated.View
            style={[
              styles.indicator,
              isAlertMode ? styles.alertDot : styles.normalDot,
              { transform: [{ scale: pulseAnim }] }
            ]}
          />
          <Text style={styles.headerText}>ข้อมูลปัจจุบัน</Text>
        </View>
        {modeValue !== undefined && (
          <View style={[styles.modeTag, isAlertMode ? styles.alertTag : styles.normalTag]}>
            <Text style={styles.modeTagText}>{formatValue('mode', modeValue)}</Text>
          </View>
        )}
      </View>

      {Object.entries(liveData)
        .filter(([key]) => key !== 'mode')
        .map(([key, value]) => (
          <View key={key} style={styles.dataRow}>
            <View style={styles.label}>
              <Text style={styles.icon}>{getIconForKey(key)}</Text>
              <Text style={styles.key}>{translateKey(key)}</Text>
            </View>
            <Text style={[
              styles.value,
              key === 'alt' && value < 0 ? styles.alertText : null,
              key === 'slope' && value > 30 ? styles.alertText : null
            ]}>
              {formatValue(key, value)}
            </Text>
          </View>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
  },
  normal: {
    borderLeftWidth: 5,
    borderLeftColor: '#2ECC71',
  },
  alert: {
    borderLeftWidth: 5,
    borderLeftColor: '#E74C3C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  normalDot: { backgroundColor: '#2ECC71' },
  alertDot: { backgroundColor: '#E74C3C' },
  headerText: { fontWeight: 'bold', fontSize: 18, color: '#2C3E50' },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  key: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  alertText: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  modeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  normalTag: {
    backgroundColor: '#D5F5E3',
  },
  alertTag: {
    backgroundColor: '#FADBD8',
  },
  modeTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default LiveDataCard;
