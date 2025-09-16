# คำอธิบายแต่ละบรรทัดของ Source Code - แบบละเอียด

## ไฟล์: MainScreen.js

### บรรทัด 1-8: Import Statements
```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Platform
} from 'react-native';
```

**คำอธิบายแต่ละบรรทัด:**
- **บรรทัด 1**: `import React, { useState, useEffect } from 'react';` - Import React library และ hooks (useState, useEffect) สำหรับจัดการ state และ lifecycle
- **บรรทัด 2**: `import {` - เริ่มต้น import จาก react-native
- **บรรทัด 3**: `View,` - Import View component สำหรับสร้าง container
- **บรรทัด 4**: `StatusBar,` - Import StatusBar component สำหรับจัดการ status bar
- **บรรทัด 5**: `SafeAreaView,` - Import SafeAreaView component สำหรับจัดการ safe area
- **บรรทัด 6**: `StyleSheet,` - Import StyleSheet สำหรับสร้าง styles
- **บรรทัด 7**: `Platform` - Import Platform สำหรับตรวจสอบ platform (iOS/Android)
- **บรรทัด 8**: `} from 'react-native';` - ปิด import จาก react-native

### บรรทัด 9-17: Import Custom Components
```javascript
import { useBLE } from '../../hooks/useBLE';
import ConnectBLELogo from '../ui/ConnectBLELogo';
import ConnectedStatus from '../ui/ConnectedStatus';
import Header from '../ui/Header';
import DataScreen from '../ui/DataScreen';
import CompassView from '../ui/CompassView';
import SuccessPopup from '../ui/SuccessPopup';
import URUFooter from '../ui/URUFooter';
import InternetStatusIndicator from '../ui/InternetStatusIndicator';
```

**คำอธิบายแต่ละบรรทัด:**
- **บรรทัด 9**: `import { useBLE } from '../../hooks/useBLE';` - Import custom hook สำหรับจัดการ BLE
- **บรรทัด 10**: `import ConnectBLELogo from '../ui/ConnectBLELogo';` - Import component สำหรับแสดงหน้าจอเชื่อมต่อ BLE
- **บรรทัด 11**: `import ConnectedStatus from '../ui/ConnectedStatus';` - Import component สำหรับแสดงสถานะการเชื่อมต่อ
- **บรรทัด 12**: `import Header from '../ui/Header';` - Import component สำหรับแสดง header
- **บรรทัด 13**: `import DataScreen from '../ui/DataScreen';` - Import component สำหรับแสดงหน้าจอข้อมูล
- **บรรทัด 14**: `import CompassView from '../ui/CompassView';` - Import component สำหรับแสดงเข็มทิศ
- **บรรทัด 15**: `import SuccessPopup from '../ui/SuccessPopup';` - Import component สำหรับแสดง popup สำเร็จ
- **บรรทัด 16**: `import URUFooter from '../ui/URUFooter';` - Import component สำหรับแสดง footer
- **บรรทัด 17**: `import InternetStatusIndicator from '../ui/InternetStatusIndicator';` - Import component สำหรับแสดงสถานะอินเทอร์เน็ต

### บรรทัด 19-65: MainScreen Component และ useBLE Hook
```javascript
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
```

**คำอธิบายแต่ละบรรทัด:**
- **บรรทัด 19**: `const MainScreen = () => {` - สร้าง MainScreen component เป็น arrow function
- **บรรทัด 20**: `const {` - เริ่มต้น destructuring จาก useBLE hook
- **บรรทัด 21**: `device,` - ตัวแปรเก็บข้อมูลอุปกรณ์ BLE ที่เชื่อมต่อ
- **บรรทัด 22**: `isScanning,` - ตัวแปรบอกว่ากำลังสแกนหาอุปกรณ์หรือไม่
- **บรรทัด 23**: `scanAndConnect,` - ฟังก์ชันสำหรับสแกนและเชื่อมต่อ BLE
- **บรรทัด 24**: `scanAnim,` - ตัวแปรเก็บ animation สำหรับการสแกน
- **บรรทัด 25**: `liveData,` - ตัวแปรเก็บข้อมูลแบบ real-time จาก ESP32
- **บรรทัด 26**: `pulseAnim,` - ตัวแปรเก็บ animation สำหรับ pulse effect
- **บรรทัด 27**: `imagePoint1,` - ตัวแปรเก็บรูปภาพของจุดที่ 1
- **บรรทัด 28**: `imagePoint2,` - ตัวแปรเก็บรูปภาพของจุดที่ 2
- **บรรทัด 29**: `setImagePoint1,` - ฟังก์ชันสำหรับตั้งค่ารูปภาพจุดที่ 1
- **บรรทัด 30**: `setImagePoint2,` - ฟังก์ชันสำหรับตั้งค่ารูปภาพจุดที่ 2
- **บรรทัด 31**: `addImageToPoint,` - ฟังก์ชันสำหรับเพิ่มรูปภาพไปยังจุด
- **บรรทัด 32**: `pickImage,` - ฟังก์ชันสำหรับเลือกรูปภาพ
- **บรรทัด 33**: `submitPointsToServer,` - ฟังก์ชันสำหรับส่งข้อมูลไปยัง server
- **บรรทัด 34**: `saveCurrentPoint,` - ฟังก์ชันสำหรับบันทึกจุดปัจจุบัน
- **บรรทัด 35**: `togglePoint,` - ฟังก์ชันสำหรับสลับระหว่างจุดที่ 1 และ 2
- **บรรทัด 36**: `point1Data,` - ตัวแปรเก็บข้อมูลจุดที่ 1
- **บรรทัด 37**: `point2Data,` - ตัวแปรเก็บข้อมูลจุดที่ 2
- **บรรทัด 38**: `currentPoint,` - ตัวแปรบอกจุดปัจจุบัน (1 หรือ 2)
- **บรรทัด 39**: `location,` - ตัวแปรเก็บข้อมูล GPS
- **บรรทัด 40**: `updateCompassData,` - ฟังก์ชันสำหรับอัปเดตข้อมูลเข็มทิศ
- **บรรทัด 41**: `isConnected,` - ตัวแปรบอกว่ามีการเชื่อมต่อหรือไม่
- **บรรทัด 42**: `loadSavedData,` - ฟังก์ชันสำหรับโหลดข้อมูลที่บันทึกไว้
- **บรรทัด 43**: `saveDataToStorage,` - ฟังก์ชันสำหรับบันทึกข้อมูลลง storage
- **บรรทัด 44**: `checkInternetConnection,` - ฟังก์ชันสำหรับตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- **บรรทัด 45**: `disconnectDevice,` - ฟังก์ชันสำหรับตัดการเชื่อมต่อ
- **บรรทัด 46**: `savedPoints,` - ตัวแปรเก็บจุดที่บันทึกไว้
- **บรรทัด 47**: `savedImages,` - ตัวแปรเก็บรูปภาพที่บันทึกไว้
- **บรรทัด 48**: `clearSurveyAreas,` - ฟังก์ชันสำหรับล้างพื้นที่สำรวจ
- **บรรทัด 49**: `showSuccessPopup,` - ตัวแปรบอกว่าต้องแสดง popup สำเร็จหรือไม่
- **บรรทัด 50**: `setShowSuccessPopup,` - ฟังก์ชันสำหรับตั้งค่าแสดง popup สำเร็จ
- **บรรทัด 51**: `successPopupData,` - ตัวแปรเก็บข้อมูลสำหรับ popup สำเร็จ
- **บรรทัด 52**: `// Survey Areas Management` - คอมเมนต์อธิบายส่วนจัดการพื้นที่สำรวจ
- **บรรทัด 53**: `surveyAreas,` - ตัวแปรเก็บพื้นที่สำรวจ
- **บรรทัด 54**: `createNewSurveyArea,` - ฟังก์ชันสำหรับสร้างพื้นที่สำรวจใหม่
- **บรรทัด 55**: `savePointsAsNewArea,` - ฟังก์ชันสำหรับบันทึกจุดเป็นพื้นที่ใหม่
- **บรรทัด 56**: `submitSurveyArea,` - ฟังก์ชันสำหรับส่งพื้นที่สำรวจไปยัง server
- **บรรทัด 57**: `deleteSurveyArea,` - ฟังก์ชันสำหรับลบพื้นที่สำรวจ
- **บรรทัด 58**: `clearAllSurveyAreas,` - ฟังก์ชันสำหรับล้างพื้นที่สำรวจทั้งหมด
- **บรรทัด 59**: `// New Area Creation` - คอมเมนต์อธิบายส่วนสร้างพื้นที่ใหม่
- **บรรทัด 60**: `showCreateAreaModal,` - ตัวแปรบอกว่าต้องแสดง modal สร้างพื้นที่หรือไม่
- **บรรทัด 61**: `setShowCreateAreaModal,` - ฟังก์ชันสำหรับตั้งค่าแสดง modal สร้างพื้นที่
- **บรรทัด 62**: `openCreateAreaModal,` - ฟังก์ชันสำหรับเปิด modal สร้างพื้นที่
- **บรรทัด 63**: `isInSurveyMode,` - ตัวแปรบอกว่าอยู่ในโหมดสำรวจหรือไม่
- **บรรทัด 64**: `finishCurrentSurvey` - ฟังก์ชันสำหรับจบการสำรวจปัจจุบัน
- **บรรทัด 65**: `} = useBLE();` - ปิด destructuring และเรียกใช้ useBLE hook

### บรรทัด 67-68: Local State
```javascript
const [activeTab, setActiveTab] = useState('data');
const [dataScreenActiveTab, setDataScreenActiveTab] = useState('cards');
```

**คำอธิบายแต่ละบรรทัด:**
- **บรรทัด 67**: `const [activeTab, setActiveTab] = useState('data');` - สร้าง state สำหรับ tab ที่เปิดอยู่ เริ่มต้นด้วย 'data'
- **บรรทัด 68**: `const [dataScreenActiveTab, setDataScreenActiveTab] = useState('cards');` - สร้าง state สำหรับ tab ใน DataScreen เริ่มต้นด้วย 'cards'

### บรรทัด 70-145: JSX Return
```javascript
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
```

**คำอธิบายแต่ละบรรทัด:**
- **บรรทัด 70**: `return (` - เริ่มต้น return JSX
- **บรรทัด 71**: `<SafeAreaView style={styles.safeArea}>` - สร้าง SafeAreaView container
- **บรรทัด 72**: `<StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />` - ตั้งค่า status bar เป็นสีขาวบนพื้นหลังน้ำเงิน
- **บรรทัด 73**: คอมเมนต์ว่าง
- **บรรทัด 74**: `{/* Internet Status Indicator - ปิดการแสดง popup */}` - คอมเมนต์อธิบายส่วนที่ปิดไว้
- **บรรทัด 75-79**: คอมเมนต์ที่ปิด InternetStatusIndicator component
- **บรรทัด 80**: คอมเมนต์ว่าง
- **บรรทัด 81**: `<Header title="ระบบตรวจวัดแผ่นดินถล่ม" subtitle="ESP32 BLE Monitor" />` - แสดง header
- **บรรทัด 82**: คอมเมนต์ว่าง
- **บรรทัด 83**: `<View style={styles.contentContainer}>` - สร้าง container สำหรับเนื้อหาหลัก
- **บรรทัด 84**: `{!device ? (` - ตรวจสอบว่าไม่มีอุปกรณ์เชื่อมต่อ
- **บรรทัด 85-89**: แสดง ConnectBLELogo component เมื่อไม่มีอุปกรณ์
- **บรรทัด 90**: `) : !Object.keys(liveData).length ? (` - ตรวจสอบว่าไม่มีข้อมูล live
- **บรรทัด 91-95**: แสดง ConnectedStatus component เมื่อเชื่อมต่อแล้วแต่ไม่มีข้อมูล
- **บรรทัด 96**: `) : (` - กรณีอื่นๆ (มีอุปกรณ์และมีข้อมูล)
- **บรรทัด 97-128**: แสดง DataScreen component พร้อม props ทั้งหมด
- **บรรทัด 129**: `)}` - ปิด conditional rendering
- **บรรทัด 130**: `</View>` - ปิด contentContainer
- **บรรทัด 131**: คอมเมนต์ว่าง
- **บรรทัด 132**: `{/* Modern Success Popup */}` - คอมเมนต์อธิบาย SuccessPopup
- **บรรทัด 133-140**: แสดง SuccessPopup component
- **บรรทัด 141**: คอมเมนต์ว่าง
- **บรรทัด 142**: `{/* URU Footer - แสดงเฉพาะหน้ารายการข้อมูลสำรวจ */}` - คอมเมนต์อธิบาย URUFooter
- **บรรทัด 143**: `{Object.keys(liveData).length > 0 && dataScreenActiveTab === 'cards' && <URUFooter />}` - แสดง URUFooter เมื่อมีข้อมูลและอยู่ที่ tab cards
- **บรรทัด 144**: `</SafeAreaView>` - ปิด SafeAreaView
- **บรรทัด 145**: `);` - ปิด return statement

### บรรทัด 147-160: Styles
```javascript
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
```

**คำอธิบายแต่ละบรรทัด:**
- **บรรทัด 147**: `const styles = StyleSheet.create({` - สร้าง styles object
- **บรรทัด 148**: `safeArea: {` - กำหนด style สำหรับ safeArea
- **บรรทัด 149**: `flex: 1,` - ใช้ flex: 1 เพื่อให้เต็มพื้นที่
- **บรรทัด 150**: `backgroundColor: '#1e3a8a',` - ตั้งค่าสีพื้นหลังเป็นน้ำเงินเข้ม
- **บรรทัด 151**: `},` - ปิด safeArea style
- **บรรทัด 152**: `contentContainer: {` - กำหนด style สำหรับ contentContainer
- **บรรทัด 153**: `flex: 1,` - ใช้ flex: 1 เพื่อให้เต็มพื้นที่
- **บรรทัด 154**: `backgroundColor: '#f8fafc',` - ตั้งค่าสีพื้นหลังเป็นเทาอ่อน
- **บรรทัด 155**: `},` - ปิด contentContainer style
- **บรรทัด 156**: `compassView: {` - กำหนด style สำหรับ compassView
- **บรรทัด 157**: `flex: 1,` - ใช้ flex: 1 เพื่อให้เต็มพื้นที่
- **บรรทัด 158**: `}` - ปิด compassView style
- **บรรทัด 159**: `});` - ปิด StyleSheet.create

### บรรทัด 162: Export
```javascript
export default MainScreen;
```

**คำอธิบายแต่ละบรรทัด:**
- **บรรทัด 162**: `export default MainScreen;` - export MainScreen component เป็น default export

## สรุปการทำงานของ MainScreen

1. **Import dependencies** - นำเข้า React, React Native components และ custom components
2. **ใช้ useBLE hook** - ดึงข้อมูลและฟังก์ชันทั้งหมดจาก BLE hook
3. **จัดการ local state** - เก็บ state สำหรับ tab navigation
4. **Conditional rendering** - แสดงหน้าจอตามสถานะ:
   - ไม่มีอุปกรณ์ → แสดง ConnectBLELogo
   - มีอุปกรณ์แต่ไม่มีข้อมูล → แสดง ConnectedStatus
   - มีอุปกรณ์และมีข้อมูล → แสดง DataScreen
5. **แสดง components อื่นๆ** - SuccessPopup และ URUFooter
6. **กำหนด styles** - สร้าง styles สำหรับ layout

MainScreen เป็น component หลักที่จัดการการแสดงผลตามสถานะการเชื่อมต่อและข้อมูลที่ได้รับจาก ESP32 ผ่าน BLE
