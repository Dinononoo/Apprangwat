import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const PremiumHeader = ({ 
  title, 
  subtitle, 
  onBackPress, 
  onMenuPress, 
  showBack = false, 
  showMenu = false,
  isConnected = false,
  pulseAnim = new Animated.Value(1)
}) => {
  return (
    <BlurView intensity={30} style={styles.container}>
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Background Pattern */}
        <Animated.View 
          style={[
            styles.backgroundPattern,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
          <View style={styles.patternCircle3} />
        </Animated.View>

        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBack && (
              <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
                <BlurView intensity={20} style={styles.iconButtonBlur}>
                  <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </BlurView>
              </TouchableOpacity>
            )}
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
              )}
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {/* Connection Status with Animation */}
            <Animated.View 
              style={[
                styles.statusContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={[
                styles.statusDot,
                { backgroundColor: isConnected ? '#16a34a' : '#dc2626' }
              ]} />
              <Text style={styles.statusText}>
                {isConnected ? 'เชื่อมต่อ' : 'ไม่เชื่อมต่อ'}
              </Text>
            </Animated.View>

            {/* Menu Button */}
            {showMenu && (
              <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
                <BlurView intensity={20} style={styles.iconButtonBlur}>
                  <Ionicons name="menu" size={24} color="#ffffff" />
                </BlurView>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom Border Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(102, 126, 234, 0.2)', 'transparent']}
          style={styles.bottomBorder}
        />
      </LinearGradient>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    paddingTop: 50,
    paddingBottom: 20,
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
  },
  patternCircle3: {
    position: 'absolute',
    top: '50%',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    marginRight: 12,
  },
  iconButtonBlur: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  bottomBorder: {
    height: 2,
    marginHorizontal: 20,
  },
});

export default PremiumHeader;
