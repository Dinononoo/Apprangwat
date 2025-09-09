import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import PointSelector from './PointSelector';
import LiveDataCard from './LiveDataCard';
import SavedPointCard from './SavedPointCard';
import DataCardsView from './DataCardsView';
import TelescopeView from './TelescopeView';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

const getResponsiveSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const getSafeAreaTop = () => {
  if (Platform.OS === 'ios') {
    return height > 800 ? 44 : 20;
  }
  return StatusBar.currentHeight || 0;
};

const DataScreen = ({
  currentPoint,
  togglePoint,
  saveCurrentPoint,
  liveData,
  pulseAnim,
  point1Data,
  point2Data,
  pickImage,
  imagePoint1,
  imagePoint2,
  setImagePoint1,
  setImagePoint2,
  addImageToPoint,
  location,
  updateCompassData,
  submitPointsToServer,
  savedPoints,
  savedImages,
  // Survey Areas props
  surveyAreas,
  createNewSurveyArea,
  savePointsAsNewArea,
  submitSurveyArea,
  deleteSurveyArea,
  clearAllSurveyAreas,
  // New Area Creation props
  showCreateAreaModal,
  setShowCreateAreaModal,
  openCreateAreaModal,
  isInSurveyMode,
  finishCurrentSurvey,
  // Callback to send activeTab to parent
  onActiveTabChange
}) => {
  const [activeTab, setActiveTab] = useState('cards');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;

  // ส่ง activeTab กลับไปที่ parent component
  useEffect(() => {
    if (onActiveTabChange) {
      onActiveTabChange(activeTab);
    }
  }, [activeTab, onActiveTabChange]);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floatingAnimation.start();

    return () => floatingAnimation.stop();
  }, []);

  const renderTabContent = () => {
    if (activeTab === 'cards') {
      return (
        <Animated.View
          style={[
            styles.tabContentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <DataCardsView
            surveyAreas={surveyAreas}
            createNewSurveyArea={createNewSurveyArea}
            submitSurveyArea={submitSurveyArea}
            deleteSurveyArea={deleteSurveyArea}
            clearAllSurveyAreas={clearAllSurveyAreas}
            showCreateAreaModal={showCreateAreaModal}
            setShowCreateAreaModal={setShowCreateAreaModal}
            openCreateAreaModal={openCreateAreaModal}
            onSwitchToMeasure={() => setActiveTab('details')}
          />
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.detailsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Modern Header Section */}
        <View style={styles.modernHeaderContainer}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <BlurView intensity={20} style={styles.headerBlur}>
              <View style={styles.pointIndicator}>
                <Animated.View
                  style={[
                    styles.pulseRing,
                    {
                      opacity: floatingAnim,
                      transform: [
                        {
                          scale: floatingAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.2],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.activePointCircle}>
                  <Text style={styles.pointNumber}>{currentPoint}</Text>
                </View>
              </View>
              
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>จุดสำรวจที่ {currentPoint}</Text>
                <Text style={styles.headerSubtitle}>กำลังรวบรวมข้อมูล</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.modernButton}
                  onPress={togglePoint}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="swap-horizontal" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Content Section */}
        <ScrollView
          style={styles.modernScrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Telescope View Section */}
          <View style={styles.modernSection}>
            <TelescopeView 
              gpsData={location?.coords}
              bleData={liveData}
              location={location}
              updateCompassData={updateCompassData}
              saveCurrentPoint={saveCurrentPoint}
              currentPoint={currentPoint}
              setImagePoint1={setImagePoint1}
              setImagePoint2={setImagePoint2}
              addImageToPoint={addImageToPoint}
            />
          </View>

          {/* Saved Points Section */}
          <View style={styles.modernSection}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.sectionIconContainer}
              >
                <Ionicons name="bookmark" size={20} color="white" />
              </LinearGradient>
              <Text style={styles.modernSectionTitle}>จุดที่บันทึกแล้ว</Text>
            </View>

            <View style={styles.savedPointsContainer}>
              <View style={styles.pointCardWrapper}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                  style={styles.dataCard}
                >
                  <BlurView intensity={10} style={styles.cardBlur}>
                    <SavedPointCard
                      data={point1Data}
                      pointNumber={1}
                      image={imagePoint1}
                      pickImage={pickImage}
                    />
                  </BlurView>
                </LinearGradient>
              </View>

              <View style={styles.pointCardWrapper}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
                  style={styles.dataCard}
                >
                  <BlurView intensity={10} style={styles.cardBlur}>
                    <SavedPointCard
                      data={point2Data}
                      pointNumber={2}
                      image={imagePoint2}
                      pickImage={pickImage}
                    />
                  </BlurView>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Save Offline Section */}
          {(Object.keys(point1Data).length > 0 && Object.keys(point2Data).length > 0) && (
            <View style={styles.modernSection}>
              <TouchableOpacity
                style={styles.submitContainer}
                onPress={async () => {
                  try {
                    console.log('🎯 Save button pressed!');
                    console.log('📋 Current state check:', {
                      isInSurveyMode,
                      hasPoint1Data: Object.keys(point1Data || {}).length > 0,
                      hasPoint2Data: Object.keys(point2Data || {}).length > 0,
                      imagePoint1_uri: !!imagePoint1?.uri,
                      imagePoint2_uri: !!imagePoint2?.uri
                    });
                    
                    if (isInSurveyMode) {
                      // หากอยู่ในโหมดสำรวจ ให้บันทึกข้อมูลลงในพื้นที่ปัจจุบัน
                      console.log('🔄 In survey mode, calling finishCurrentSurvey...');
                      await finishCurrentSurvey();
                    } else {
                      // หากไม่ได้อยู่ในโหมดสำรวจ ให้สร้างพื้นที่ใหม่
                      const areaName = `พื้นที่ ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
                      console.log('🆕 Not in survey mode, calling savePointsAsNewArea with name:', areaName);
                      const result = await savePointsAsNewArea(areaName);
                      console.log('✅ savePointsAsNewArea result:', result);
                    }
                    
                    // เปลี่ยนไปหน้าข้อมูลจุดสำรวจ
                    setActiveTab('cards');
                  } catch (error) {
                    console.error('❌ Error saving survey area:', error);
                  }
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#27ae60', '#2ecc71']}
                  style={styles.submitButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <BlurView intensity={20} style={styles.submitBlur}>
                    <View style={styles.submitContent}>
                      <View style={styles.submitIconContainer}>
                        <Ionicons name="save" size={24} color="white" />
                      </View>
                      <View style={styles.submitTextContainer}>
                        <Text style={styles.submitTitle}>บันทึกออฟไลน์</Text>
                        <Text style={styles.submitSubtitle}>บันทึกข้อมูลและกลับไปหน้าจัดการพื้นที่</Text>
                      </View>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </View>
                  </BlurView>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Background */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.backgroundGradient}
      >
        {/* Floating Elements */}
        <Animated.View
          style={[
            styles.floatingOrb1,
            {
              transform: [
                {
                  translateY: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingOrb2,
            {
              transform: [
                {
                  translateY: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  }),
                },
              ],
            },
          ]}
        />
        


        {/* Content */}
        <View style={styles.contentContainer}>
          {renderTabContent()}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  // Floating elements
  floatingOrb1: {
    position: 'absolute',
    top: getResponsiveSize(100, 120, 140),
    right: getResponsiveSize(30, 40, 50),
    width: getResponsiveSize(80, 100, 120),
    height: getResponsiveSize(80, 100, 120),
    borderRadius: getResponsiveSize(40, 50, 60),
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingOrb2: {
    position: 'absolute',
    top: getResponsiveSize(300, 350, 400),
    left: getResponsiveSize(20, 30, 40),
    width: getResponsiveSize(60, 80, 100),
    height: getResponsiveSize(60, 80, 100),
    borderRadius: getResponsiveSize(30, 40, 50),
    backgroundColor: 'rgba(118, 75, 162, 0.3)',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  


  // Content
  contentContainer: {
    flex: 1,
    marginTop: getResponsiveSize(15, 20, 25),
  },
  tabContentContainer: {
    flex: 1,
  },
  
  // Details Tab Styles
  detailsContainer: {
    flex: 1,
  },
  modernHeaderContainer: {
    marginHorizontal: getResponsiveSize(15, 20, 25),
    marginBottom: getResponsiveSize(10, 12, 15),
    borderRadius: getResponsiveSize(15, 18, 20),
    overflow: 'hidden',
  },
  headerGradient: {
    borderRadius: getResponsiveSize(15, 18, 20),
  },
  headerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(15, 18, 20),
  },
  pointIndicator: {
    position: 'relative',
    marginRight: getResponsiveSize(10, 12, 15),
  },
  pulseRing: {
    position: 'absolute',
    top: -getResponsiveSize(6, 8, 10),
    left: -getResponsiveSize(6, 8, 10),
    width: getResponsiveSize(50, 56, 62),
    height: getResponsiveSize(50, 56, 62),
    borderRadius: getResponsiveSize(25, 28, 31),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activePointCircle: {
    width: getResponsiveSize(38, 42, 46),
    height: getResponsiveSize(38, 42, 46),
    borderRadius: getResponsiveSize(19, 21, 23),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  pointNumber: {
    fontSize: getResponsiveSize(16, 18, 20),
    fontWeight: '800',
    color: '#667eea',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: getResponsiveSize(16, 17, 18),
    fontWeight: '700',
    color: 'white',
    marginBottom: getResponsiveSize(3, 4, 5),
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: getResponsiveSize(12, 13, 14),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: getResponsiveSize(10, 12, 15),
  },
  modernButton: {
    borderRadius: getResponsiveSize(12, 15, 18),
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: getResponsiveSize(12, 15, 18),
    borderRadius: getResponsiveSize(12, 15, 18),
  },

  // Content Sections
  modernScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getResponsiveSize(80, 100, 120),
  },
  modernSection: {
    marginHorizontal: getResponsiveSize(5, 10, 15),
    marginBottom: getResponsiveSize(15, 20, 25),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSize(15, 18, 20),
  },
  sectionIconContainer: {
    width: getResponsiveSize(36, 40, 44),
    height: getResponsiveSize(36, 40, 44),
    borderRadius: getResponsiveSize(18, 20, 22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getResponsiveSize(12, 15, 18),
  },
  modernSectionTitle: {
    fontSize: getResponsiveSize(16, 18, 20),
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },

  // Data Cards
  liveDataContainer: {
    borderRadius: getResponsiveSize(18, 20, 22),
    overflow: 'hidden',
  },
  savedPointsContainer: {
    gap: getResponsiveSize(15, 18, 20),
  },
  pointCardWrapper: {
    borderRadius: getResponsiveSize(18, 20, 22),
    overflow: 'hidden',
  },
  dataCard: {
    borderRadius: getResponsiveSize(18, 20, 22),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  cardBlur: {
    borderRadius: getResponsiveSize(18, 20, 22),
  },

  // Submit Section
  submitContainer: {
    borderRadius: getResponsiveSize(20, 22, 25),
    overflow: 'hidden',
  },
  submitButton: {
    borderRadius: getResponsiveSize(20, 22, 25),
  },
  submitBlur: {
    borderRadius: getResponsiveSize(20, 22, 25),
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsiveSize(20, 25, 30),
  },
  submitIconContainer: {
    width: getResponsiveSize(50, 60, 70),
    height: getResponsiveSize(50, 60, 70),
    borderRadius: getResponsiveSize(25, 30, 35),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getResponsiveSize(15, 18, 20),
  },
  submitTextContainer: {
    flex: 1,
  },
  submitTitle: {
    fontSize: getResponsiveSize(16, 18, 20),
    fontWeight: '700',
    color: 'white',
    marginBottom: getResponsiveSize(2, 4, 6),
    letterSpacing: 0.5,
  },
  submitSubtitle: {
    fontSize: getResponsiveSize(13, 14, 15),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  bottomPadding: {
    height: getResponsiveSize(40, 50, 60),
  },
});

export default DataScreen;