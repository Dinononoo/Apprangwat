# คำอธิบาย Source Code - React Native/Expo App สำหรับระบบตรวจวัดแผ่นดินถล่ม

## ภาพรวมของระบบ

แอปพลิเคชันนี้เป็น **แอปมือถือสำหรับระบบตรวจวัดแผ่นดินถล่ม** ที่เชื่อมต่อกับ ESP32 ผ่าน Bluetooth Low Energy (BLE) เพื่อรับข้อมูล:
- **มุมเงย/มุมก้ม** จาก MPU6050
- **ระยะทาง** จาก PTFS Distance Sensor
- **ข้อมูล GPS** และ **เข็มทิศ**

## โครงสร้างโปรเจ็กต์

### 1. **App Structure (Expo Router)**
```
app/
├── _layout.tsx          # Root layout - จัดการ Theme และ Context
├── +not-found.tsx       # หน้าจอ 404
└── (tabs)/              # Tab navigation
    ├── _layout.tsx      # Tab layout configuration
    ├── index.tsx        # Redirect ไปยัง main screen
    ├── main.tsx         # หน้าจอหลัก (MainScreen)
    └── measure.tsx      # หน้าจอตรวจวัด (MainScreen)
```

### 2. **Components Structure**
```
components/
├── screens/
│   └── MainScreen.js    # หน้าจอหลักของแอป
├── ui/                  # UI Components
│   ├── CompassView.js   # หน้าจอเข็มทิศ
│   ├── DataScreen.js    # หน้าจอแสดงข้อมูล
│   ├── TelescopeView.js # หน้าจอกล้อง
│   ├── ConnectBLELogo.js # หน้าจอเชื่อมต่อ BLE
│   ├── ConnectedStatus.js # สถานะการเชื่อมต่อ
│   └── ...              # Components อื่นๆ
└── __tests__/           # Unit tests
```

### 3. **Hooks (Custom Logic)**
```
hooks/
├── useBLE.js           # BLE connection logic (2,565 lines)
├── useColorScheme.ts   # Theme management
└── useThemeColor.ts    # Color utilities
```

## ไฟล์สำคัญและคำอธิบาย

### 1. **MainScreen.js** - หน้าจอหลัก
```javascript
// หน้าที่หลัก:
// - จัดการการแสดงผลตามสถานะการเชื่อมต่อ
// - แสดงหน้าจอเชื่อมต่อ BLE เมื่อยังไม่เชื่อมต่อ
// - แสดงหน้าจอข้อมูลเมื่อเชื่อมต่อแล้ว

const MainScreen = () => {
  const {
    device,           // อุปกรณ์ BLE ที่เชื่อมต่อ
    isScanning,       // สถานะการสแกน
    scanAndConnect,   // ฟังก์ชันสแกนและเชื่อมต่อ
    liveData,         // ข้อมูลแบบ real-time
    // ... และอื่นๆ
  } = useBLE();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <Header title="ระบบตรวจวัดแผ่นดินถล่ม" subtitle="ESP32 BLE Monitor" />
      
      <View style={styles.contentContainer}>
        {!device ? (
          <ConnectBLELogo />  // หน้าจอเชื่อมต่อ
        ) : !Object.keys(liveData).length ? (
          <ConnectedStatus /> // หน้าจอสถานะการเชื่อมต่อ
        ) : (
          <DataScreen />      // หน้าจอข้อมูล
        )}
      </View>
    </SafeAreaView>
  );
};
```

### 2. **useBLE.js** - Hook หลักสำหรับ BLE
```javascript
// หน้าที่หลัก:
// - จัดการการเชื่อมต่อ BLE
// - รับข้อมูลจาก ESP32
// - เก็บข้อมูลและจัดการสถานะ

export const useBLE = () => {
  // State variables
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState({});
  const [point1Data, setPoint1Data] = useState({});
  const [point2Data, setPoint2Data] = useState({});
  
  // BLE Functions
  const scanAndConnect = async () => {
    // สแกนหาอุปกรณ์ BLE
    // เชื่อมต่อกับ ESP32
  };
  
  const listenForData = (connectedDevice) => {
    // รับข้อมูลจาก ESP32
    // อัปเดต liveData
  };
  
  const saveCurrentPoint = async () => {
    // บันทึกข้อมูลจุดปัจจุบัน
  };
  
  // ... ฟังก์ชันอื่นๆ
  
  return {
    device,
    isConnected,
    liveData,
    scanAndConnect,
    // ... และอื่นๆ
  };
};
```

### 3. **CompassView.js** - หน้าจอเข็มทิศ
```javascript
// หน้าที่หลัก:
// - แสดงเข็มทิศและมุมเงย
// - คาลิเบรตเข็มทิศ
// - แสดงข้อมูล GPS

const CompassView = ({ latitude, longitude, altitude, location, onCompassUpdate }) => {
  const [heading, setHeading] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationData, setCalibrationData] = useState([]);
  
  // ฟังก์ชันคำนวณมุมเข็มทิศ
  const calculateHeading = (magnetometerData) => {
    // คำนวณมุมจากข้อมูล magnetometer
  };
  
  // ฟังก์ชันคาลิเบรต
  const startCalibration = () => {
    // เริ่มต้นการคาลิเบรต
  };
  
  return (
    <View style={styles.container}>
      {/* เข็มทิศ */}
      <View style={styles.compass}>
        {/* เข็มทิศหลัก */}
      </View>
      
      {/* ข้อมูล GPS */}
      <View style={styles.gpsInfo}>
        <Text>Latitude: {latitude}</Text>
        <Text>Longitude: {longitude}</Text>
        <Text>Altitude: {altitude}</Text>
      </View>
    </View>
  );
};
```

### 4. **DataScreen.js** - หน้าจอแสดงข้อมูล
```javascript
// หน้าที่หลัก:
// - แสดงข้อมูลที่เก็บได้
// - จัดการการบันทึกข้อมูล
// - แสดงรายการพื้นที่สำรวจ

const DataScreen = ({
  currentPoint,
  togglePoint,
  saveCurrentPoint,
  liveData,
  point1Data,
  point2Data,
  // ... props อื่นๆ
}) => {
  const [activeTab, setActiveTab] = useState('data');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'data':
        return <DataCardsView />;
      case 'measure':
        return <TelescopeView />;
      case 'compass':
        return <CompassView />;
      default:
        return <DataCardsView />;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('data')}>
          <Text>ข้อมูล</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('measure')}>
          <Text>ตรวจวัด</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('compass')}>
          <Text>เข็มทิศ</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
};
```

### 5. **TelescopeView.js** - หน้าจอกล้อง
```javascript
// หน้าที่หลัก:
// - แสดงกล้องสำหรับถ่ายรูป
// - แสดงข้อมูลมุมเงยและระยะทาง
// - บันทึกข้อมูลพร้อมรูปภาพ

const TelescopeView = ({
  liveData,
  location,
  onCompassUpdate,
  // ... props อื่นๆ
}) => {
  const [cameraRef, setCameraRef] = useState(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  
  // ฟังก์ชันถ่ายรูป
  const takePhoto = async () => {
    if (cameraRef) {
      setIsTakingPhoto(true);
      const photo = await cameraRef.takePictureAsync();
      // บันทึกข้อมูลพร้อมรูปภาพ
      setIsTakingPhoto(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* กล้อง */}
      <Camera
        ref={setCameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
      />
      
      {/* ข้อมูล overlay */}
      <View style={styles.overlay}>
        <Text>มุมเงย: {liveData.elevation}°</Text>
        <Text>ระยะทาง: {liveData.distance}m</Text>
        <Text>คุณภาพ: {liveData.quality}%</Text>
      </View>
      
      {/* ปุ่มถ่ายรูป */}
      <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
        <Text>ถ่ายรูป</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## การทำงานของระบบ

### 1. **การเชื่อมต่อ BLE**
```javascript
// 1. สแกนหาอุปกรณ์
const scanAndConnect = async () => {
  const devices = await manager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
    if (device && device.name === 'ESP32_LANDSLIDE_MOCK') {
      manager.stopDeviceScan();
      connectToDevice(device);
    }
  });
};

// 2. เชื่อมต่อกับอุปกรณ์
const connectToDevice = async (deviceToConnect) => {
  const connectedDevice = await deviceToConnect.connect();
  const services = await connectedDevice.discoverAllServicesAndCharacteristics();
  // เริ่มรับข้อมูล
  listenForData(connectedDevice);
};
```

### 2. **การรับข้อมูลจาก ESP32**
```javascript
// รับข้อมูลแบบ real-time
const listenForData = (connectedDevice) => {
  const characteristic = service.getCharacteristic(CHARACTERISTIC_UUID);
  
  characteristic.monitor((error, characteristic) => {
    if (characteristic && characteristic.value) {
      const data = characteristic.value;
      const dataString = data.toString();
      
      // แยกข้อมูล
      if (dataString.includes('elevation:')) {
        const elevation = parseFloat(dataString.split('elevation:')[1]);
        setLiveData(prev => ({ ...prev, elevation }));
      }
      
      if (dataString.includes('distance:')) {
        const distance = parseFloat(dataString.split('distance:')[1]);
        setLiveData(prev => ({ ...prev, distance }));
      }
    }
  });
};
```

### 3. **การเก็บข้อมูล**
```javascript
// บันทึกข้อมูลจุดปัจจุบัน
const saveCurrentPoint = async () => {
  const pointData = {
    ...liveData,
    location: location,
    timestamp: new Date().toISOString(),
    image: currentImage
  };
  
  if (currentPoint === 1) {
    setPoint1Data(pointData);
  } else {
    setPoint2Data(pointData);
  }
  
  // บันทึกลง storage
  await saveDataToStorage(currentPoint, pointData, currentImage);
};
```

## การตั้งค่า Android

### 1. **build.gradle** - การตั้งค่า Android App
```gradle
android {
    namespace 'com.pawee1919.dp.mynewbluetoothapp'
    defaultConfig {
        applicationId 'com.pawee1919.dp.mynewbluetoothapp'
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.debug
            minifyEnabled enableProguardInReleaseBuilds
        }
    }
}
```

### 2. **gradle.properties** - การตั้งค่า Gradle
```properties
# เปิดใช้ Hermes engine
hermesEnabled=true

# เปิดใช้ New Architecture
newArchEnabled=true

# เปิดใช้ GIF และ WebP
expo.gif.enabled=true
expo.webp.enabled=true
```

## ฟีเจอร์หลัก

### 1. **BLE Connection**
- สแกนและเชื่อมต่อกับ ESP32
- รับข้อมูลแบบ real-time
- จัดการการเชื่อมต่อใหม่

### 2. **Data Collection**
- เก็บข้อมูลจุดที่ 1 และจุดที่ 2
- บันทึกรูปภาพพร้อมข้อมูล
- จัดการพื้นที่สำรวจ

### 3. **Real-time Display**
- แสดงข้อมูลมุมเงย/มุมก้ม
- แสดงข้อมูลระยะทาง
- แสดงข้อมูล GPS และเข็มทิศ

### 4. **Data Management**
- บันทึกข้อมูลแบบ offline
- ส่งข้อมูลไปยัง server
- จัดการพื้นที่สำรวจหลายพื้นที่

## สรุป

แอปพลิเคชันนี้เป็นระบบที่ซับซ้อนสำหรับการตรวจวัดแผ่นดินถล่ม โดยมีฟีเจอร์หลัก:

1. **เชื่อมต่อ BLE** กับ ESP32
2. **รับข้อมูล** มุมเงย/มุมก้ม และระยะทาง
3. **เก็บข้อมูล** พร้อมรูปภาพ
4. **แสดงผล** ข้อมูลแบบ real-time
5. **จัดการข้อมูล** แบบ offline และ online

แอปนี้ใช้ Expo Router สำหรับ navigation และมี UI ที่สวยงามพร้อมฟีเจอร์ครบครันสำหรับการสำรวจและเก็บข้อมูลแผ่นดินถล่ม
