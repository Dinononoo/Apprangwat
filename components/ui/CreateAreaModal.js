import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const CreateAreaModal = ({ visible, onClose, onCreateArea }) => {
  const [areaName, setAreaName] = useState('');
  const [observerName, setObserverName] = useState('');

  const handleCreate = () => {
    if (!areaName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อพื้นที่');
      return;
    }

    if (!observerName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อผู้สำรวจ');
      return;
    }

    onCreateArea(areaName.trim(), observerName.trim());
    setAreaName('');
    setObserverName('');
    onClose();
  };

  const handleClose = () => {
    setAreaName('');
    setObserverName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerGradient}
              >
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <Ionicons name="location" size={24} color="white" />
                    <Text style={styles.headerTitle}>สร้างพื้นที่ใหม่</Text>
                  </View>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <View style={styles.body}>
                <Text style={styles.label}>ชื่อพื้นที่สำรวจ</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="pencil" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={areaName}
                    onChangeText={setAreaName}
                    placeholder="เช่น บ้านเก่า, เขาสูง, ริมน้ำ..."
                    placeholderTextColor="#9ca3af"
                    maxLength={50}
                    autoFocus={true}
                    onSubmitEditing={() => {}}
                  />
                </View>
                
                <Text style={styles.label}>ชื่อผู้สำรวจ</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={observerName}
                    onChangeText={setObserverName}
                    placeholder="ระบุชื่อผู้ทำการสำรวจ..."
                    placeholderTextColor="#9ca3af"
                    maxLength={50}
                    onSubmitEditing={handleCreate}
                  />
                </View>

                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelText}>ยกเลิก</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.createButton, (!areaName.trim() || !observerName.trim()) && styles.createButtonDisabled]}
                    onPress={handleCreate}
                    disabled={!areaName.trim() || !observerName.trim()}
                  >
                    <LinearGradient
                      colors={areaName.trim() && observerName.trim()
                        ? ['#10b981', '#059669'] 
                        : ['#9ca3af', '#6b7280']
                      }
                      style={styles.createGradient}
                    >
                      <Ionicons name="add-circle" size={20} color="white" />
                      <Text style={styles.createText}>เริ่มสำรวจ</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 16,
  },
  hint: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  createText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CreateAreaModal; 