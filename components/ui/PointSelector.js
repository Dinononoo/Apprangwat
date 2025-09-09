import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const PointSelector = ({ currentPoint, togglePoint, saveCurrentPoint }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.innerContainer}
      >
        <View style={styles.pointBadgeWrapper}>
          <LinearGradient
            colors={currentPoint === 1 ? ['#3b82f6', '#1d4ed8'] : ['#8b5cf6', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pointBadge}
          >
            <Text style={styles.pointText}>จุดที่ {currentPoint}</Text>
            <FontAwesome5 name="map-marker-alt" size={14} color="white" style={styles.pointIcon} />
          </LinearGradient>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={togglePoint}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={currentPoint === 1 ? ['#8b5cf6', '#7c3aed'] : ['#3b82f6', '#1d4ed8']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="swap-horizontal" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>เปลี่ยนเป็นจุดที่ {currentPoint === 1 ? 2 : 1}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={saveCurrentPoint}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="save" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>บันทึกจุดปัจจุบัน</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'white',
  },
  innerContainer: {
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pointBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pointBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  pointText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
    letterSpacing: 0.5,
  },
  pointIcon: {
    marginTop: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderRadius: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default PointSelector;