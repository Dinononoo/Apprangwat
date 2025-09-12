import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

import { getIconForKey, translateKey, formatValue } from '../../utils/dataFormatUtils';

const { width, height } = Dimensions.get('window');

const SavedPointCard = ({ data, pointNumber, image, pickImage }) => {
  if (Object.keys(data).length === 0) {
    return (
      <View style={styles.emptyPointContainer}>
        <Text style={styles.emptyPointText}>ยังไม่มีข้อมูลจุดที่ {pointNumber}</Text>
      </View>
    );
  }

  const modeValue = data.mode;
  const isAlertMode = modeValue === 2;

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.pointContainer, isAlertMode ? styles.alertContainer : styles.normalContainer]}>
        <View style={styles.pointHeader}>
          <View style={styles.pointTitleContainer}>
            <Text style={styles.pointNumber}>{pointNumber}</Text>
            <Text style={styles.pointHeaderText}>ข้อมูลจุดที่ {pointNumber}</Text>
          </View>

          <View style={styles.pointActionContainer}>
            {modeValue !== undefined && (
              <View style={[styles.modeTag, isAlertMode ? styles.alertModeTag : styles.normalModeTag]}>
                <Text style={styles.modeTagText}>{formatValue('mode', modeValue)}</Text>
              </View>
            )}
          </View>
        </View>

        {data && typeof data === 'object' && Object.entries(data)
          .filter(([key]) => !['mode', 'timestamp', 'slope', 'altitude', 'roll', 'yaw', 'accuracy', 'deviceId', 'pointNumber', 'quality', 'savedAt', 'version', 'offlineMode'].includes(key))
          .map(([key, value]) => (
            <View key={key} style={styles.dataRow}>
              <View style={styles.dataKeyContainer}>
                <Text style={styles.dataIcon}>{getIconForKey(key)}</Text>
                <Text style={styles.dataKey}>{translateKey(key)}</Text>
              </View>
              <Text style={[
                styles.dataValue,
                key === 'alt' && value < 0 ? styles.alertValue : null,
                key === 'slope' && value > 30 ? styles.alertValue : null
              ]}>
                {formatValue(key, value)}
              </Text>
            </View>
          ))}

        {/* แสดงสถานะรูปภาพ */}
        <View style={styles.photoStatusContainer}>
          {image?.uri ? (
            <View style={styles.photoSavedContainer}>
              <Text style={styles.photoSavedIcon}>✅</Text>
              <Text style={styles.photoSavedText}>บันทึกรูปภาพแล้ว</Text>
            </View>
          ) : (
        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => pickImage(pointNumber)}
        >
          <Text style={styles.photoButtonText}>📷 ถ่าย/เลือกรูปจุดนี้</Text>
        </TouchableOpacity>
          )}
        </View>
      </View>

      {image?.uri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image.uri }}
            style={styles.pointImage}
            resizeMode="cover"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
  },
  // Point container styles
  pointContainer: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  normalContainer: {
    borderLeftWidth: 5,
    borderLeftColor: '#2ECC71',
  },
  alertContainer: {
    borderLeftWidth: 5,
    borderLeftColor: '#E74C3C',
  },
  pointHeader: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pointTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3498DB',
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
    marginRight: 10,
  },
  pointHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  pointActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  photoStatusContainer: {
    margin: 15,
  },
  photoButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  photoSavedContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  photoSavedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  photoSavedText: {
    color: '#27AE60',
    fontSize: 14,
    fontWeight: '600',
  },
  // Data display styles
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12, // ลดลงจาก 15
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  dataKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dataIcon: {
    fontSize: 20,
    marginRight: 10,
  },
   dataKey: {
     fontSize: 14, // ลดลงจาก 16
     color: '#555555',
     fontWeight: '500',
   },
  dataValue: {
    fontSize: 14, // ลดลงจาก 16
    color: '#333333',
    fontWeight: '600',
    marginLeft: 8, // ลดลงจาก 10
  },
  alertValue: {
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  // Mode tag styles
  modeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  normalModeTag: {
    backgroundColor: '#D5F5E3',
  },
  alertModeTag: {
    backgroundColor: '#FADBD8',
  },
  modeTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  // Empty data styles
  emptyPointContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCCCCC',
  },
  emptyPointText: {
    fontSize: 16,
    color: '#999999',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  pointImage: {
    width: width * 0.6, // ขนาดเล็กลงเพื่อความสวยงาม
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
  }
});

export default SavedPointCard;