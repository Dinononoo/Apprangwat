import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const DataDetailModal = ({ visible, onClose, data, pointNumber, image, isAreaData = false }) => {
  const formatValue = (value, unit = '', decimals = 4) => {
    if (value === undefined || value === null || isNaN(value)) {
      return `--${unit}`;
    }
    return `${Number(value).toFixed(decimals)}${unit}`;
  };

  const formatCoordinate = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '--';
    }
    return Number(value).toFixed(3);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('th-TH')} ${date.toLocaleTimeString('th-TH')}`;
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={isAreaData 
            ? ['#10b981', '#059669'] 
            : pointNumber === 1 ? ['#3498DB', '#2980B9'] : ['#9B59B6', '#8E44AD']
          }
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Ionicons 
                name={isAreaData ? "map" : "location"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.headerTitle}>
                {isAreaData ? "พื้นที่สำรวจ" : `จุดที่ ${pointNumber}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            บันทึกเมื่อ: {formatDateTime(data.timestamp)}
          </Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Section */}
          {image?.uri && !isAreaData && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.fullImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.imageGradient}
              >
                <Text style={styles.imageLabel}>รูปภาพจุดที่ {pointNumber}</Text>
              </LinearGradient>
            </View>
          )}

          {/* Area Data Content */}
          {isAreaData ? (
            <View>
              {/* Observer Information */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={20} color="#667eea" />
                  <Text style={styles.sectionTitle}>ข้อมูลผู้สำรวจ</Text>
                </View>
                <View style={styles.dataGrid}>
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>ผู้สำรวจ</Text>
                    <Text style={styles.dataValue}>{data.observer || '--'}</Text>
                  </View>
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>สถานะ</Text>
                    <Text style={[styles.dataValue, { color: '#10b981' }]}>ส่งสำเร็จแล้ว</Text>
                  </View>
                </View>
              </View>

              {/* Location Information */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="location" size={20} color="#8b5cf6" />
                  <Text style={styles.sectionTitle}>ตำแหน่งพื้นที่สำรวจ</Text>
                </View>
                <View style={styles.dataGrid}>
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>ละติจูด</Text>
                    <Text style={styles.dataValue}>{data.location?.latitude?.toFixed(6) || '--'}</Text>
                    <Text style={styles.dataUnit}>องศา</Text>
                  </View>
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>ลองจิจูด</Text>
                    <Text style={styles.dataValue}>{data.location?.longitude?.toFixed(6) || '--'}</Text>
                    <Text style={styles.dataUnit}>องศา</Text>
                  </View>
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>ความสูง</Text>
                    <Text style={styles.dataValue}>{data.location?.altitude?.toFixed(2) || '--'}</Text>
                    <Text style={styles.dataUnit}>เมตร</Text>
                  </View>
                </View>
              </View>

              {/* Compass Data */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="compass" size={20} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>ข้อมูลทิศทาง</Text>
                </View>
                <View style={styles.dataGrid}>
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>อาซิมูท</Text>
                    <Text style={styles.dataValue}>{data.azimuth || '--'}</Text>
                    <Text style={styles.dataUnit}>องศา</Text>
                  </View>
                </View>
              </View>

              {/* Points Data */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="pin" size={20} color="#ef4444" />
                  <Text style={styles.sectionTitle}>ข้อมูลจุดสำรวจ</Text>
                </View>
                
                {data.points?.point1 && (
                  <View style={styles.pointSection}>
                    <Text style={styles.pointTitle}>📍 จุดที่ 1</Text>
                    <View style={styles.dataGrid}>
                      <View style={styles.dataCard}>
                        <Text style={styles.dataLabel}>ระยะทาง</Text>
                        <Text style={styles.dataValue}>{data.points.point1.distance?.toFixed(1) || '--'}</Text>
                        <Text style={styles.dataUnit}>เมตร</Text>
                      </View>
                      <View style={styles.dataCard}>
                        <Text style={styles.dataLabel}>มุมเงย</Text>
                        <Text style={styles.dataValue}>{data.points.point1.elevation?.toFixed(1) || '--'}</Text>
                        <Text style={styles.dataUnit}>องศา</Text>
                      </View>
                      <View style={styles.dataCard}>
                        <Text style={styles.dataLabel}>รูปภาพ</Text>
                        <Text style={[styles.dataValue, { 
                          color: data.points.point1.hasImage ? '#10b981' : '#ef4444' 
                        }]}>
                          {data.points.point1.hasImage ? '✅ มี' : '❌ ไม่มี'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {data.points?.point2 && (
                  <View style={styles.pointSection}>
                    <Text style={styles.pointTitle}>📍 จุดที่ 2</Text>
                    <View style={styles.dataGrid}>
                      <View style={styles.dataCard}>
                        <Text style={styles.dataLabel}>ระยะทาง</Text>
                        <Text style={styles.dataValue}>{data.points.point2.distance?.toFixed(1) || '--'}</Text>
                        <Text style={styles.dataUnit}>เมตร</Text>
                      </View>
                      <View style={styles.dataCard}>
                        <Text style={styles.dataLabel}>มุมเงย</Text>
                        <Text style={styles.dataValue}>{data.points.point2.elevation?.toFixed(1) || '--'}</Text>
                        <Text style={styles.dataUnit}>องศา</Text>
                      </View>
                      <View style={styles.dataCard}>
                        <Text style={styles.dataLabel}>รูปภาพ</Text>
                        <Text style={[styles.dataValue, { 
                          color: data.points.point2.hasImage ? '#10b981' : '#ef4444' 
                        }]}>
                          {data.points.point2.hasImage ? '✅ มี' : '❌ ไม่มี'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Server Response Summary */}
                {data.serverResponse && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="cloud-done" size={20} color="#10b981" />
                      <Text style={styles.sectionTitle}>การส่งข้อมูล</Text>
                    </View>
                    <View style={styles.serverInfo}>
                      <Text style={styles.serverText}>
                        ✅ ส่งข้อมูลไปเซิร์ฟเวอร์สำเร็จแล้ว
                      </Text>
                      <Text style={styles.serverSubtext}>
                        📅 {formatDateTime(data.timestamp)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View>
              {/* Original Point Data Content */}

          {/* Location Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="navigate" size={20} color="#3498db" />
              <Text style={styles.sectionTitle}>ข้อมูลตำแหน่ง</Text>
            </View>
            <View style={styles.dataGrid}>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>ละติจูด (Latitude)</Text>
                <Text style={styles.dataValue}>{formatCoordinate(data.lat)}</Text>
                <Text style={styles.dataUnit}>องศา</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>ลองจิจูด (Longitude)</Text>
                <Text style={styles.dataValue}>{formatCoordinate(data.lon)}</Text>
                <Text style={styles.dataUnit}>องศา</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>ความสูง (Altitude)</Text>
                <Text style={styles.dataValue}>{formatValue(data.altitude, '', 2)}</Text>
                <Text style={styles.dataUnit}>เมตร</Text>
              </View>
            </View>
          </View>

          {/* Measurement Data */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics" size={20} color="#e74c3c" />
              <Text style={styles.sectionTitle}>ข้อมูลการวัด</Text>
            </View>
            <View style={styles.dataGrid}>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>มุมเงย (Elevation)</Text>
                <Text style={styles.dataValue}>{formatValue(data.altitude, '', 2)}</Text>
                <Text style={styles.dataUnit}>องศา</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>อาซิมูท (Azimuth)</Text>
                <Text style={styles.dataValue}>{formatValue(data.azimuth, '', 0)}</Text>
                <Text style={styles.dataUnit}>องศา</Text>
              </View>
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>ระยะทางลาด</Text>
                <Text style={styles.dataValue}>{formatValue(data.slopeDistance)}</Text>
                <Text style={styles.dataUnit}>เมตร</Text>
              </View>
            </View>
          </View>

          {/* Additional Sensor Data */}
          {(data.temperature || data.humidity || data.pressure) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="thermometer" size={20} color="#f39c12" />
                <Text style={styles.sectionTitle}>ข้อมูลเซ็นเซอร์เพิ่มเติม</Text>
              </View>
              <View style={styles.dataGrid}>
                {data.temperature && (
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>อุณหภูมิ</Text>
                    <Text style={styles.dataValue}>{formatValue(data.temperature, '', 1)}</Text>
                    <Text style={styles.dataUnit}>°C</Text>
                  </View>
                )}
                {data.humidity && (
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>ความชื้น</Text>
                    <Text style={styles.dataValue}>{formatValue(data.humidity, '', 1)}</Text>
                    <Text style={styles.dataUnit}>%</Text>
                  </View>
                )}
                {data.pressure && (
                  <View style={styles.dataCard}>
                    <Text style={styles.dataLabel}>ความดัน</Text>
                    <Text style={styles.dataValue}>{formatValue(data.pressure, '', 1)}</Text>
                    <Text style={styles.dataUnit}>hPa</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Data Source Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={20} color="#95a5a6" />
              <Text style={styles.sectionTitle}>ข้อมูลเพิ่มเติม</Text>
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>รหัสจุด:</Text>
                <Text style={styles.infoValue}>POINT_{pointNumber}_{data.timestamp ? new Date(data.timestamp).getTime() : 'UNKNOWN'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>แหล่งข้อมูล GPS:</Text>
                <Text style={styles.infoValue}>โทรศัพท์มือถือ</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>แหล่งข้อมูลเซ็นเซอร์:</Text>
                <Text style={styles.infoValue}>ESP32 + โทรศัพท์</Text>
              </View>
            </View>
          </View>
          </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={onClose} style={styles.actionButton}>
            <LinearGradient
              colors={['#95a5a6', '#7f8c8d']}
              style={styles.actionGradient}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.actionText}>ปิด</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
    marginBottom: 20,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // ไม่ zoom เข้าไป
    borderRadius: 100, // กรอบวงกลม (ครึ่งหนึ่งของ imageContainer height: 200)
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 16,
  },
  imageLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 64) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dataUnit: {
    fontSize: 12,
    color: '#95a5a6',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  bottomPadding: {
    height: 20,
  },
  bottomActions: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  actionButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Styles for area data
  pointSection: {
    marginBottom: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 12,
  },
  serverInfo: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  serverText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  serverSubtext: {
    fontSize: 12,
    color: 'rgba(16, 185, 129, 0.8)',
  },
});

export default DataDetailModal; 