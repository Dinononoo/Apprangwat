# Enhanced Compass View

## Overview
This is an advanced compass component that uses the phone's native compass API directly, providing the same accuracy as the built-in compass app.

## Features

### 🧭 Native Compass Integration
- Uses DeviceMotion API for native compass heading
- Fallback to Magnetometer for devices without native compass
- Platform-specific optimizations for iOS and Android
- Real-time heading updates at 20Hz (same as phone's compass app)

### 🎯 High Accuracy
- Direct access to phone's compass sensor
- Automatic calibration detection
- Magnetic interference detection
- Accuracy monitoring and reporting

### 🎨 Modern UI
- Smooth animations and transitions
- Responsive design for all screen sizes
- Glass morphism effects
- Real-time visual feedback

### ⚙️ Calibration System
- Automatic calibration popup when needed
- Figure-8 movement guidance
- Visual calibration progress
- Auto-close when calibration complete

## Usage

```jsx
import CompassView from './CompassView';

<CompassView
  onCompassUpdate={(compassData) => {
    console.log('Heading:', compassData.heading);
    console.log('Direction:', compassData.direction);
  }}
  style={styles.compass}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `onCompassUpdate` | Function | Callback when compass data updates |
| `style` | StyleSheet | Custom styles for the component |
| `latitude` | Number | GPS latitude for true north calculation |
| `longitude` | Number | GPS longitude for true north calculation |
| `altitude` | Number | GPS altitude for magnetic declination |
| `location` | Object | Location object with GPS data |

## Compass Data Format

```javascript
{
  heading: 45.2,        // Heading in degrees (0-360)
  direction: 'NE',      // Cardinal direction
  accuracy: 95,         // Accuracy percentage
  isCalibrated: true    // Calibration status
}
```

## Technical Details

### Sensor Priority
1. **Native Compass** - Uses `data.heading` from DeviceMotion
2. **Rotation Sensor** - Uses `data.rotation.alpha` as fallback
3. **Magnetometer** - Calculates heading from magnetic field data

### Platform Differences
- **iOS**: Usually provides native compass heading
- **Android**: May need rotation sensor or magnetometer calculation

### Calibration
- Automatically detects when calibration is needed
- Shows popup with figure-8 movement instructions
- Monitors magnetic field strength for interference
- Auto-closes when calibration is complete

## Dependencies

```json
{
  "expo-sensors": "~13.0.4",
  "expo-location": "~17.0.1",
  "expo-linear-gradient": "~13.0.2"
}
```

## Permissions Required

- Location permissions for true north calculation
- Motion sensor access (automatic on most devices)

## Troubleshooting

### Compass Not Working
1. Check device motion permissions
2. Ensure location services are enabled
3. Try calibrating the compass
4. Check for magnetic interference

### Low Accuracy
1. Move away from electronic devices
2. Perform figure-8 calibration
3. Ensure stable magnetic environment
4. Check device sensor status

## Performance Notes

- Updates at 20Hz for smooth animations
- Uses native driver for optimal performance
- Automatic cleanup on component unmount
- Memory efficient with proper ref management