import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LocationView = ({ location }) => {
  // Debug: แสดงข้อมูลตำแหน่งที่ได้รับ
  console.log('LocationView received location:', location);
  
  if (!location) return null;

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#f1f5f9', '#e0f2fe']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialIcons name="location-on" size={18} color="#0284c7" />
            <Text style={styles.title}>พิกัดปัจจุบัน</Text>
          </View>
          <View style={styles.statusChip}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>กำลังติดตาม</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>📍 ละติจูด</Text>
            <Text style={styles.value}>
              {(location?.coords?.latitude !== undefined && location?.coords?.latitude !== null) 
                ? location.coords.latitude.toFixed(6) 
                : '--'
              }
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>📍 ลองจิจูด</Text>
            <Text style={styles.value}>
              {(location?.coords?.longitude !== undefined && location?.coords?.longitude !== null) 
                ? location.coords.longitude.toFixed(6) 
                : '--'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 18,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: 'white',
  },
  container: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14, 165, 233, 0.15)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0284c7',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284c7',
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  labelTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
});

export default LocationView;