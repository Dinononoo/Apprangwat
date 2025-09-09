import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Platform
} from 'react-native';
import { useBLE } from '../../hooks/useBLE';
import ConnectBLELogo from '../ui/ConnectBLELogo';
import ConnectedStatus from '../ui/ConnectedStatus';
import Header from '../ui/Header';
import DataScreen from '../ui/DataScreen';
import CompassView from '../ui/CompassView';
import SuccessPopup from '../ui/SuccessPopup';
import URUFooter from '../ui/URUFooter';
import InternetStatusIndicator from '../ui/InternetStatusIndicator';

const MainScreen = () => {
  const {
    device,
    isScanning,
    scanAndConnect,
    scanAnim,
    liveData,
    pulseAnim,
    imagePoint1,
    imagePoint2,
    setImagePoint1,
    setImagePoint2,
    addImageToPoint,
    pickImage,
    submitPointsToServer,
    saveCurrentPoint,
    togglePoint,
    point1Data,
    point2Data,
    currentPoint,
    location,
    updateCompassData,
    isConnected,
    loadSavedData,
    saveDataToStorage,
    checkInternetConnection,
    disconnectDevice,
    savedPoints,
    savedImages,
    clearSurveyAreas,
    showSuccessPopup,
    setShowSuccessPopup,
    successPopupData,
    // Survey Areas Management
    surveyAreas,
    createNewSurveyArea,
    savePointsAsNewArea,
    submitSurveyArea,
    deleteSurveyArea,
    clearAllSurveyAreas,
    // New Area Creation
    showCreateAreaModal,
    setShowCreateAreaModal,
    openCreateAreaModal,
    isInSurveyMode,
    finishCurrentSurvey
  } = useBLE();

  const [activeTab, setActiveTab] = useState('data');
  const [dataScreenActiveTab, setDataScreenActiveTab] = useState('cards');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />

      {/* Internet Status Indicator - ปิดการแสดง popup */}
      {/* <InternetStatusIndicator 
        onRetry={() => {
          console.log('🔄 Manual internet retry requested');
        }}
      /> */}

      <Header title="ระบบตรวจวัดแผ่นดินถล่ม" subtitle="ESP32 BLE Monitor" />

      <View style={styles.contentContainer}>
        {!device ? (
          <ConnectBLELogo
            isScanning={isScanning}
            scanAndConnect={scanAndConnect}
            scanAnim={scanAnim}
          />
        ) : !Object.keys(liveData).length ? (
          <ConnectedStatus 
            device={device}
            disconnectDevice={disconnectDevice}
          />
        ) : (
          <DataScreen
            currentPoint={currentPoint}
            togglePoint={togglePoint}
            saveCurrentPoint={saveCurrentPoint}
            liveData={liveData}
            pulseAnim={pulseAnim}
            point1Data={point1Data}
            point2Data={point2Data}
            pickImage={pickImage}
            imagePoint1={imagePoint1}
            imagePoint2={imagePoint2}
            setImagePoint1={setImagePoint1}
            setImagePoint2={setImagePoint2}
            addImageToPoint={addImageToPoint}
            location={location}
            updateCompassData={updateCompassData}
            submitPointsToServer={submitPointsToServer}
            savedPoints={savedPoints}
            savedImages={savedImages}
            clearSurveyAreas={clearSurveyAreas}
            surveyAreas={surveyAreas}
            createNewSurveyArea={createNewSurveyArea}
            savePointsAsNewArea={savePointsAsNewArea}
            submitSurveyArea={submitSurveyArea}
            deleteSurveyArea={deleteSurveyArea}
            clearAllSurveyAreas={clearAllSurveyAreas}
            showCreateAreaModal={showCreateAreaModal}
            setShowCreateAreaModal={setShowCreateAreaModal}
            openCreateAreaModal={openCreateAreaModal}
            isInSurveyMode={isInSurveyMode}
            finishCurrentSurvey={finishCurrentSurvey}
            onActiveTabChange={setDataScreenActiveTab}
          />
        )}
      </View>

      {/* Modern Success Popup */}
      <SuccessPopup
        visible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        deviceName={successPopupData.deviceName}
        signalStrength={successPopupData.signalStrength}
        title={successPopupData.title}
        message={successPopupData.message}
      />

      {/* URU Footer - แสดงเฉพาะหน้ารายการข้อมูลสำรวจ */}
      {Object.keys(liveData).length > 0 && dataScreenActiveTab === 'cards' && <URUFooter />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  compassView: {
    flex: 1,
  }
});

export default MainScreen;