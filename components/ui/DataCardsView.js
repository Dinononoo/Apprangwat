import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CreateAreaModal from './CreateAreaModal';
import AreaDetailModal from './AreaDetailModal';

const DataCardsView = ({ 
  surveyAreas = [],
  createNewSurveyArea,
  submitSurveyArea,
  deleteSurveyArea,
  clearAllSurveyAreas,
  // New props for modal and mode switching
  showCreateAreaModal,
  setShowCreateAreaModal,
  openCreateAreaModal,
  onSwitchToMeasure
}) => {
  const [selectedArea, setSelectedArea] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Debug: ตรวจสอบข้อมูล surveyAreas ที่ได้รับ
  console.log('🔍 DataCardsView: Survey areas received:', {
    count: surveyAreas.length,
    areas: surveyAreas.map(area => ({
      id: area.id,
      name: area.name,
      hasLocation: !!area.location,
      hasPoints: !!area.points,
      isSubmitted: area.isSubmitted
    }))
  });

  const handleAreaPress = (area) => {
    console.log('🔍 DataCardsView: Selected area for modal:', {
      id: area.id,
      name: area.name,
      location: area.location,
      points: area.points,
      azimuth: area.azimuth,
      observer: area.observer,
      timestamp: area.timestamp,
      isSubmitted: area.isSubmitted
    });
    setSelectedArea(area);
      setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedArea(null);
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })} ${date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const getLocationName = (location) => {
    if (!location?.latitude || !location?.longitude) return 'ไม่ระบุตำแหน่ง';
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  // ฟังก์ชันสำหรับกรองและเรียงลำดับข้อมูลตามคำค้นหา
  const filteredSurveyAreas = useMemo(() => {
    let areas = surveyAreas;

    // กรองตามคำค้นหา
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      
      areas = surveyAreas.filter(area => {
        // ค้นหาจากชื่อพื้นที่
        const nameMatch = area.name?.toLowerCase().includes(searchLower);
        
        // ค้นหาจากวันที่
        const dateMatch = area.timestamp && formatDateTime(area.timestamp).toLowerCase().includes(searchLower);
        
        // ค้นหาจากผู้สำรวจ
        const observerMatch = area.observer?.toLowerCase().includes(searchLower);
        
        return nameMatch || dateMatch || observerMatch;
      });
    }

    // เรียงลำดับจากใหม่ไปเก่า (ล่าสุดอยู่ด้านบน)
    return areas.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA; // เรียงจากใหม่ไปเก่า
    });
  }, [surveyAreas, searchTerm]);

  const renderSurveyAreaCard = ({ item: area }) => (
    <TouchableOpacity
      style={styles.areaCard}
      onPress={() => handleAreaPress(area)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={area.isSubmitted 
          ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']
          : ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.05)']
        }
        style={styles.areaCardGradient}
      >
        <View style={styles.areaHeader}>
          <View style={styles.areaHeaderLeft}>
            <Ionicons 
              name={area.isSubmitted ? "checkmark-circle" : "location"} 
              size={24} 
              color={area.isSubmitted ? "#10b981" : "#667eea"} 
            />
            <View style={styles.areaHeaderText}>
              <Text style={styles.areaName}>{area.name}</Text>
              <Text style={styles.areaLocation}>{getLocationName(area.location)}</Text>
            </View>
          </View>
          
          <View style={styles.areaStatus}>
            {area.isSubmitted ? (
              <View style={[styles.statusBadge, styles.statusSubmitted]}>
                <Text style={styles.statusText}>ส่งแล้ว</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.statusBadge, styles.statusPending]}
                onPress={(e) => {
                  e.stopPropagation();
                  Alert.alert(
                    'ส่งข้อมูลพื้นที่',
                    `ต้องการส่งข้อมูล "${area.name}" ไปเซิร์ฟเวอร์หรือไม่?`,
                    [
                      { text: 'ยกเลิก', style: 'cancel' },
                      { text: 'ส่งข้อมูล', onPress: () => submitSurveyArea(area.id) }
                    ]
                  );
                }}
              >
                <Ionicons name="cloud-upload" size={16} color="white" />
                <Text style={styles.statusText}>ส่งข้อมูล</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.areaDetails}>
          <View style={styles.areaDetailItem}>
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text style={styles.areaDetailText}>{formatDateTime(area.timestamp)}</Text>
          </View>
          
          <View style={styles.areaDetailItem}>
            <Ionicons name="compass" size={16} color="#6b7280" />
            <Text style={styles.areaDetailText}>อาซิมูท: {area.azimuth}°</Text>
            </View>
          
          <View style={styles.areaDetailItem}>
            <Ionicons name="analytics" size={16} color="#6b7280" />
            <Text style={styles.areaDetailText}>
              จุดวัด: 2 จุด | รูปภาพ: {((area.points?.point1?.hasImage) ? 1 : 0) + ((area.points?.point2?.hasImage) ? 1 : 0)}/2
            </Text>
          </View>

          {/* Add clickable detail hint */}
          <View style={styles.detailHint}>
            <Ionicons name="eye" size={14} color="#667eea" />
            <Text style={styles.detailHintText}>แตะเพื่อดูรายละเอียดครบถ้วนและส่งข้อมูล</Text>
            <Ionicons name="chevron-forward" size={14} color="#667eea" />
          </View>
        </View>


      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Create New Area Section */}
        <View style={styles.createNewAreaSection}>
          <TouchableOpacity
            style={styles.createNewAreaButton}
            onPress={() => {
              // เปิด modal สร้างพื้นที่ใหม่
              openCreateAreaModal();
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b35', '#f7931e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createNewAreaGradient}
            >
              <View style={styles.createNewAreaContent}>
                <View style={styles.createNewAreaIconContainer}>
                  <Ionicons name="add-circle" size={32} color="white" />
                </View>
                <View style={styles.createNewAreaTextContainer}>
                  <Text style={styles.createNewAreaTitle}>สร้างพื้นที่สำรวจ</Text>
                  <Text style={styles.createNewAreaSubtitle}>เริ่มต้นการสำรวจ</Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Survey Areas Section */}
        <View style={styles.areasSection}>
          <View style={styles.areasSectionHeader}>
            <Text style={styles.sectionTitle}>📍 พื้นที่สำรวจที่บันทึกแล้ว</Text>
            {surveyAreas.length > 0 && (
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={clearAllSurveyAreas}
              >
                <Ionicons name="trash" size={16} color="#ef4444" />
                <Text style={styles.clearAllText}>ล้างทั้งหมด</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar */}
          {surveyAreas.length > 0 && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="ค้นหาชื่อพื้นที่ วันที่ หรือผู้สำรวจ..."
                  placeholderTextColor="#9ca3af"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchTerm.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchTerm('')}
                    style={styles.clearSearchButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
              
              {searchTerm.length > 0 && (
                <Text style={styles.searchResults}>
                  พบ {filteredSurveyAreas.length} จาก {surveyAreas.length} พื้นที่
                </Text>
              )}
            </View>
          )}

          {/* Submit All Areas Button */}


          {surveyAreas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>ยังไม่มีพื้นที่สำรวจ</Text>
              <Text style={styles.emptySubtitle}>
                บันทึกข้อมูล 2 จุดแล้วกดปุ่ม "สร้างพื้นที่ใหม่"
              </Text>
            </View>
          ) : filteredSurveyAreas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyTitle}>ไม่พบผลการค้นหา</Text>
              <Text style={styles.emptySubtitle}>
                ลองค้นหาด้วยคำอื่น หรือตรวจสอบการสะกดคำ
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredSurveyAreas}
              renderItem={renderSurveyAreaCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.areasContainer}
              />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Area Detail Modal */}
      <AreaDetailModal
        area={selectedArea}
        visible={modalVisible}
        onClose={closeModal}
        onSubmitToServer={submitSurveyArea}
        onDeleteArea={deleteSurveyArea}
      />

      {/* Create Area Modal */}
      <CreateAreaModal
        visible={showCreateAreaModal}
        onClose={() => setShowCreateAreaModal(false)}
        onCreateArea={(areaName, observerName) => {
          createNewSurveyArea(areaName, observerName);
          onSwitchToMeasure?.(); // เปลี่ยนไปหน้าตรวจวัดหลังสร้างพื้นที่
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },

  // Current Survey Section
  currentSection: {
    marginBottom: 24,
  },
  currentDataCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  currentCardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d97706',
    marginLeft: 8,
  },
  currentProgress: {
    marginBottom: 16,
  },
  currentProgressText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  createAreaButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createAreaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  createAreaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Areas Section
  areasSection: {
    marginBottom: 24,
  },
  areasSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearAllText: {
    color: '#ef4444',
    fontSize: 14,
    marginLeft: 4,
  },
  areasContainer: {
    gap: 12,
  },

  // Area Card
  areaCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  areaCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  areaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  areaHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  areaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  areaLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  areaStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusSubmitted: {
    backgroundColor: '#10b981',
  },
  statusPending: {
    backgroundColor: '#667eea',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  areaDetails: {
    gap: 8,
  },
  areaDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaDetailText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  detailHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.1)',
    gap: 6,
  },
  detailHintText: {
    fontSize: 12,
    color: '#667eea',
    flex: 1,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },

  // Empty State
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomPadding: {
    height: 20,
  },


  // Create New Area Button Styles
  createNewAreaSection: {
    marginBottom: 24,
  },
  createNewAreaButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  createNewAreaGradient: {
    padding: 24,
  },
  createNewAreaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createNewAreaIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createNewAreaTextContainer: {
    flex: 1,
    marginLeft: 20,
    marginRight: 16,
  },
  createNewAreaTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  createNewAreaSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },

  // Search Bar Styles
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 0,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchResults: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export default DataCardsView; 