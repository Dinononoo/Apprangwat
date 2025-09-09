import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const AreaDetailModal = ({ 
  area, 
  visible, 
  onClose, 
  onSubmitToServer,
  onDeleteArea,
  onEditArea 
}) => {
  if (!visible || !area) return null;

  // Debug: ตรวจสอบข้อมูลที่ได้รับ
  console.log('🔍 AreaDetailModal received area data:', {
    name: area.name,
    location: area.location,
    points: area.points,
    azimuth: area.azimuth,
    observer: area.observer,
    timestamp: area.timestamp,
    isSubmitted: area.isSubmitted,
    images: {
      point1: area.images?.point1 ? {
        hasUri: !!area.images.point1.uri,
        uri: area.images.point1.uri?.substring(0, 50) + '...'
      } : null,
      point2: area.images?.point2 ? {
        hasUri: !!area.images.point2.uri,
        uri: area.images.point2.uri?.substring(0, 50) + '...'
      } : null
    }
  });

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return '--';
      const date = new Date(timestamp);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.log('Error formatting date:', error);
      return '--';
    }
  };

  const handleSubmitToServer = () => {
    const pointsData = area.points || {};
    Alert.alert(
      '🚀 ส่งข้อมูลไปเซิร์ฟเวอร์',
      `ต้องการส่งข้อมูลพื้นที่ "${area.name}" ไปเซิร์ฟเวอร์หรือไม่?\n\n` +
      `📊 ข้อมูลที่จะส่ง:\n` +
      `👤 ผู้สำรวจ: ${area.observer || 'Rangwat'}\n` +
      `📍 GPS: ${area.location?.latitude?.toFixed(6) || '--'}, ${area.location?.longitude?.toFixed(6) || '--'}\n` +
      `🧭 อาซิมูท: ${area.azimuth || 0}°\n` +
      `📏 จุดที่ 1: ${pointsData.point1?.distance?.toFixed(1) || '--'}m / ${pointsData.point1?.elevation?.toFixed(1) || '--'}°\n` +
      `📏 จุดที่ 2: ${pointsData.point2?.distance?.toFixed(1) || '--'}m / ${pointsData.point2?.elevation?.toFixed(1) || '--'}°\n` +
      `📸 รูปภาพ: ${(pointsData.point1?.hasImage ? 1 : 0) + (pointsData.point2?.hasImage ? 1 : 0)}/2`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ส่งข้อมูล', 
          style: 'default',
          onPress: async () => {
            await onSubmitToServer(area.id);
            onClose(); // ปิด modal หลังส่งข้อมูลเสร็จ
            setTimeout(() => {
              router.push('/'); // กลับไปหน้าแรกหลังส่งข้อมูลเสร็จ
            }, 500);
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      '🗑️ ลบพื้นที่สำรวจ',
      `ต้องการลบพื้นที่ "${area.name}" หรือไม่?\n\nข้อมูลที่ลบแล้วจะไม่สามารถกู้คืนได้`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: () => {
            onDeleteArea(area.id);
            onClose();
          }
        }
      ]
    );
  };

  console.log('🎨 AreaDetailModal: Starting to render modal components');

  return (
    <View style={styles.overlay}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(15,12,41,0.95)', 'rgba(48,43,99,0.95)', 'rgba(36,36,62,0.95)']}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.areaName}>{area.name || 'ไม่มีชื่อพื้นที่'}</Text>
              {/* Offline Status Badge */}
              <View style={styles.offlineStatusBadge}>
                <Ionicons name="save" size={12} color="#10b981" />
                <Text style={styles.offlineStatusText}>บันทึกออฟไลน์แล้ว</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
            {/* Basic Info */}
            <View style={styles.section}>
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>ผู้สำรวจ</Text>
                  <Text style={styles.infoValue}>{area.observer || 'Rangwat'}</Text>
                </View>
                
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>วันที่และเวลา</Text>
                  <Text style={styles.infoValue}>{area.timestamp ? formatDate(area.timestamp) : 'ไม่ระบุ'}</Text>
                </View>
              </View>
            </View>

            {/* Direction Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧭 ข้อมูลทิศทาง</Text>
              
              <View style={styles.compassCard}>
                <View style={styles.compassDisplay}>
                  <Text style={styles.compassValue}>{area.azimuth || 0}</Text>
                  <Text style={styles.compassUnit}>องศา</Text>
                </View>
                <Text style={styles.compassLabel}>อาซิมุท</Text>
              </View>
            </View>

            {/* Measurement Points */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📏 จุดวัด ({area.points ? Object.keys(area.points).filter(k => area.points[k]).length : 0}/2)</Text>
              
              {/* แสดงข้อความเมื่อไม่มีข้อมูลจุดวัด */}
              {(!area.points || (!area.points.point1 && !area.points.point2)) && (
                <View style={[styles.infoCard, { alignItems: 'center', padding: 20 }]}>
                  <Text style={[styles.infoValue, { textAlign: 'center', color: 'rgba(255,255,255,0.7)' }]}>
                    ยังไม่มีข้อมูลจุดวัด
                  </Text>
                  <Text style={[styles.infoLabel, { textAlign: 'center', marginTop: 5 }]}>
                    กรุณาเริ่มการสำรวจเพื่อบันทึกข้อมูล
                  </Text>
                </View>
              )}
              
              {/* Point 1 */}
              {area.points && area.points.point1 && (
                <View style={styles.pointCard}>
                  <View style={styles.pointHeader}>
                    <Text style={styles.pointTitle}>จุดที่ 1</Text>
                    {area.points.point1.hasImage && (
                      <Text style={styles.hasImageBadge}>📸</Text>
                    )}
                  </View>
                  
                  <View style={styles.pointData}>
                    <View style={styles.pointValue}>
                      <Text style={styles.pointLabel}>ระยะทาง</Text>
                      <Text style={styles.pointNumber}>
                        {area.points.point1.distance?.toFixed(1) || '--'}
                      </Text>
                      <Text style={styles.pointUnit}>เมตร</Text>
                    </View>
                    
                    <View style={styles.pointValue}>
                      <Text style={styles.pointLabel}>มุมเงย</Text>
                      <Text style={styles.pointNumber}>
                        {area.points.point1.elevation?.toFixed(1) || '--'}
                      </Text>
                      <Text style={styles.pointUnit}>องศา</Text>
                    </View>
                  </View>

                  {/* GPS Info for Point 1 */}
                  {(area.points.point1.lat || area.points.point1.lon) && (
                    <View style={styles.pointGPSSection}>
                      <Text style={styles.pointGPSTitle}>📍 พิกัด GPS จุดที่ 1</Text>
                      <Text style={styles.pointGPSText}>
                        ละติจูด: {area.points.point1.lat?.toFixed(7) || '--'}
                      </Text>
                      <Text style={styles.pointGPSText}>
                        ลองติจูด: {area.points.point1.lon?.toFixed(7) || '--'}
                      </Text>
                    </View>
                  )}

                  {/* Point 1 Image */}
                  {area.images?.point1?.uri && (
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ uri: area.images.point1.uri }} 
                        style={styles.pointImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                </View>
              )}

              {/* Point 2 */}
              {area.points && area.points.point2 && (
                <View style={styles.pointCard}>
                  <View style={styles.pointHeader}>
                    <Text style={styles.pointTitle}>จุดที่ 2</Text>
                    {area.points.point2.hasImage && (
                      <Text style={styles.hasImageBadge}>📸</Text>
                    )}
                  </View>
                  
                  <View style={styles.pointData}>
                    <View style={styles.pointValue}>
                      <Text style={styles.pointLabel}>ระยะทาง</Text>
                      <Text style={styles.pointNumber}>
                        {area.points.point2.distance?.toFixed(1) || '--'}
                      </Text>
                      <Text style={styles.pointUnit}>เมตร</Text>
                    </View>
                    
                    <View style={styles.pointValue}>
                      <Text style={styles.pointLabel}>มุมเงย</Text>
                      <Text style={styles.pointNumber}>
                        {area.points.point2.elevation?.toFixed(1) || '--'}
                      </Text>
                      <Text style={styles.pointUnit}>องศา</Text>
                    </View>
                  </View>

                  {/* GPS Info for Point 2 */}
                  {(area.points.point2.lat || area.points.point2.lon) && (
                    <View style={styles.pointGPSSection}>
                      <Text style={styles.pointGPSTitle}>📍 พิกัด GPS จุดที่ 2</Text>
                      <Text style={styles.pointGPSText}>
                        ละติจูด: {area.points.point2.lat?.toFixed(7) || '--'}
                      </Text>
                      <Text style={styles.pointGPSText}>
                        ลองติจูด: {area.points.point2.lon?.toFixed(7) || '--'}
                      </Text>
                    </View>
                  )}

                  {/* Point 2 Image */}
                  {area.images?.point2?.uri && (
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ uri: area.images.point2.uri }} 
                        style={styles.pointImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {/* Submit Button */}
              {area.isSubmitted ? (
                <View style={styles.submittedInfo}>
                  <LinearGradient
                    colors={['#27ae60', '#2ecc71']}
                    style={styles.submittedBadge}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.submittedText}>ส่งข้อมูลเรียบร้อยแล้ว</Text>
                  </LinearGradient>
                  {area.submittedAt && (
                    <Text style={styles.submittedTime}>
                      ส่งเมื่อ: {new Date(area.submittedAt).toLocaleDateString('th-TH')} {new Date(area.submittedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.submitButton} 
                  onPress={handleSubmitToServer}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#e67e22', '#d35400']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Ionicons name="cloud-upload-outline" size={22} color="white" style={{ marginRight: 10 }} />
                    <Text style={styles.submitButtonText}>ส่งข้อมูลไปเซิร์ฟเวอร์</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 10 }} />
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {/* Delete Button */}
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleDelete}
              >
                <View style={styles.deleteButtonContent}>
                  <Ionicons name="trash" size={width < 400 ? 20 : 22} color="#e74c3c" />
                  <Text style={styles.deleteButtonText}>ลบพื้นที่</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 0,
    paddingTop: 0,
  },
  modalContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: width < 400 ? 16 : 20,
    paddingTop: width < 400 ? 50 : 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  areaName: {
    fontSize: width < 350 ? 20 : width < 400 ? 22 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  offlineStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    alignSelf: 'flex-start',
  },
  offlineStatusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    width: width < 400 ? 44 : 48,
    height: width < 400 ? 44 : 48,
    borderRadius: width < 400 ? 22 : 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: width < 400 ? 20 : 22,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: width < 350 ? 12 : width < 400 ? 16 : 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: width < 400 ? 16 : 20,
  },
  statusBadge: {
    paddingHorizontal: width < 400 ? 24 : 28,
    paddingVertical: width < 400 ? 12 : 14,
    borderRadius: 30,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
  },
  section: {
    marginBottom: width < 350 ? 16 : width < 400 ? 20 : 24,
  },
  sectionTitle: {
    fontSize: width < 350 ? 20 : width < 400 ? 22 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: width < 400 ? 14 : 16,
  },
  infoGrid: {
    flexDirection: width < 500 ? 'column' : 'row',
    flexWrap: 'wrap',
    gap: width < 350 ? 10 : width < 400 ? 12 : 14,
  },
  infoCard: {
    flex: width < 500 ? 0 : 1,
    minWidth: width < 500 ? '100%' : '45%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: width < 350 ? 16 : width < 400 ? 18 : 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoLabel: {
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: width < 350 ? 20 : width < 400 ? 22 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoUnit: {
    fontSize: width < 350 ? 14 : width < 400 ? 16 : 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 3,
  },
  compassCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: width < 350 ? 20 : width < 400 ? 24 : 28,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  compassDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: width < 400 ? 6 : 8,
  },
  compassValue: {
    fontSize: width < 350 ? 36 : width < 400 ? 40 : 44,
    fontWeight: 'bold',
    color: '#667eea',
  },
  compassUnit: {
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
  compassLabel: {
    fontSize: width < 350 ? 14 : width < 400 ? 16 : 18,
    color: 'rgba(255,255,255,0.7)',
  },
  pointCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: width < 350 ? 16 : width < 400 ? 20 : 24,
    borderRadius: 16,
    marginBottom: width < 350 ? 16 : width < 400 ? 20 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width < 350 ? 12 : width < 400 ? 16 : 18,
  },
  pointTitle: {
    fontSize: width < 350 ? 20 : width < 400 ? 22 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  hasImageBadge: {
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
  },
  pointData: {
    flexDirection: width < 500 ? 'column' : 'row',
    gap: width < 350 ? 12 : width < 400 ? 14 : 16,
  },
  pointValue: {
    flex: 1,
    alignItems: width < 500 ? 'flex-start' : 'center',
    backgroundColor: width < 500 ? 'rgba(255,255,255,0.05)' : 'transparent',
    padding: width < 500 ? 12 : 0,
    borderRadius: width < 500 ? 10 : 0,
  },
  pointLabel: {
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  pointNumber: {
    fontSize: width < 350 ? 22 : width < 400 ? 26 : 30,
    fontWeight: 'bold',
    color: '#667eea',
  },
  pointUnit: {
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
    color: 'rgba(255,255,255,0.7)',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  pointImage: {
    width: width * 0.6, // ขนาดคงที่ 60% ของความกว้างหน้าจอ
    height: width * 0.6, // สี่เหลี่ยมจัตุรัส
    borderRadius: (width * 0.6) / 2, // กรอบวงกลมสมบูรณ์
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    resizeMode: 'cover', // ปรับให้เต็มกรอบวงกลม
    overflow: 'hidden',
  },
  pointGPSSection: {
    marginTop: width < 400 ? 14 : 16,
    padding: width < 350 ? 14 : width < 400 ? 16 : 18,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  pointGPSTitle: {
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  pointGPSData: {
    gap: 6,
  },
  pointGPSText: {
    fontSize: width < 350 ? 14 : width < 400 ? 16 : 18,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'monospace',
  },
  noPointsMessage: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(243, 156, 18, 0.3)',
    marginTop: 16,
  },
  noPointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 4,
  },
  noPointsSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  actions: {
    padding: width < 350 ? 16 : width < 400 ? 20 : 24,
    paddingBottom: width < 400 ? 24 : 32,
    gap: width < 400 ? 16 : 20,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#e67e22',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    alignSelf: 'center',
    width: '100%',
  },
  // Common Button Styles
  editButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  editButtonGradient: {
    padding: width < 350 ? 18 : width < 400 ? 22 : 26,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width < 350 ? 16 : width < 400 ? 18 : 20,
    paddingHorizontal: width < 350 ? 24 : width < 400 ? 28 : 32,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: width < 350 ? 18 : width < 400 ? 20 : 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonContent: {
    flexDirection: width < 500 ? 'column' : 'row',
    alignItems: 'center',
    gap: width < 400 ? 10 : 16,
  },
  buttonIconCircle: {
    width: width < 350 ? 44 : width < 400 ? 48 : 52,
    height: width < 350 ? 44 : width < 400 ? 48 : 52,
    borderRadius: width < 350 ? 22 : width < 400 ? 24 : 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextSection: {
    flex: width < 500 ? 0 : 1,
    alignItems: width < 500 ? 'center' : 'flex-start',
  },
  buttonTitle: {
    color: '#ffffff',
    fontSize: width < 350 ? 18 : width < 400 ? 20 : 22,
    fontWeight: 'bold',
    marginBottom: 3,
    textAlign: width < 500 ? 'center' : 'left',
  },
  buttonSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
    textAlign: width < 500 ? 'center' : 'left',
  },
  submittedInfo: {
    alignItems: 'center',
    gap: width < 400 ? 12 : 14,
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width < 350 ? 20 : width < 400 ? 24 : 28,
    paddingVertical: width < 350 ? 12 : width < 400 ? 14 : 16,
    borderRadius: 12,
    alignSelf: 'center',
    minWidth: width < 400 ? '90%' : '80%',
  },
  submittedText: {
    color: '#ffffff',
    fontSize: width < 350 ? 16 : width < 400 ? 17 : 18,
    fontWeight: '600',
  },
  submittedTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: width < 350 ? 14 : width < 400 ? 16 : 18,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    padding: width < 350 ? 16 : width < 400 ? 20 : 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: width < 350 ? 16 : width < 400 ? 18 : 20,
    fontWeight: '600',
  },
});

export default AreaDetailModal; 