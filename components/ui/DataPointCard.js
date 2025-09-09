import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DataPointCard = ({ data, pointNumber, image, onPress }) => {
  const hasData = data && Object.keys(data).length > 0;
  
  const formatValue = (value, unit = '') => {
    if (value === undefined || value === null || isNaN(value)) {
      return `--${unit}`;
    }
    return `${Number(value).toFixed(4)}${unit}`;
  };

  const formatCoordinate = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '--';
    }
    return Number(value).toFixed(3);
  };

  if (!hasData) {
    return (
      <TouchableOpacity style={styles.emptyCard} onPress={onPress}>
        <LinearGradient
          colors={['#ecf0f1', '#bdc3c7']}
          style={styles.emptyGradient}
        >
          <Ionicons name="add-circle-outline" size={48} color="#95a5a6" />
          <Text style={styles.emptyTitle}>จุดที่ {pointNumber}</Text>
          <Text style={styles.emptySubtitle}>ยังไม่มีข้อมูล</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardContent}>
        {/* Header */}
        <LinearGradient
          colors={pointNumber === 1 ? ['#3498DB', '#2980B9'] : ['#9B59B6', '#8E44AD']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="location" size={20} color="white" />
            <Text style={styles.headerTitle}>จุดที่ {pointNumber}</Text>
          </View>
          <Text style={styles.timestamp}>
            {data.timestamp ? new Date(data.timestamp).toLocaleDateString('th-TH') : '--'}
          </Text>
        </LinearGradient>

        {/* Image Section */}
        <View style={styles.imageSection}>
          {image?.uri ? (
            <Image source={{ uri: image.uri }} style={styles.pointImage} />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="camera-outline" size={32} color="#bdc3c7" />
              <Text style={styles.noImageText}>ไม่มีรูปภาพ</Text>
            </View>
          )}
          
          {/* Quick Info Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          >
            <View style={styles.quickInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="navigate" size={14} color="white" />
                <Text style={styles.infoText}>
                  {formatCoordinate(data.lat)}, {formatCoordinate(data.lon)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="compass" size={14} color="white" />
                <Text style={styles.infoText}>{formatValue(data.azimuth, '°')}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Data Preview */}
        <View style={styles.dataPreview}>
          <View style={styles.dataRow}>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>มุมเงย</Text>
              <Text style={styles.dataValue}>{formatValue(data.altitude, '°')}</Text>
            </View>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>ระยะทาง</Text>
              <Text style={styles.dataValue}>{formatValue(data.slopeDistance, 'm')}</Text>
            </View>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
          <Text style={styles.detailsButtonText}>ดูรายละเอียด</Text>
          <Ionicons name="chevron-forward" size={16} color="#3498db" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (width - 48) / 2,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyCard: {
    width: (width - 48) / 2,
    height: 200,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  cardContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  imageSection: {
    height: 120,
    position: 'relative',
  },
  pointImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // ไม่ zoom เข้าไป
    borderRadius: 60, // กรอบวงกลม (ครึ่งหนึ่งของ height: 120)
    borderWidth: 2,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  noImageText: {
    fontSize: 12,
    color: '#bdc3c7',
    marginTop: 4,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    padding: 8,
  },
  quickInfo: {
    gap: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  dataPreview: {
    padding: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
    marginRight: 4,
  },
});

export default DataPointCard; 