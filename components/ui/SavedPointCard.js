import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const SavedPointCard = ({
  data,
  pointNumber,
  imagePoint,
  onPickImage,
  translateKey,
  formatValue,
  getIconForKey,
  styles
}) => {
  const modeValue = data.mode;
  const isAlertMode = modeValue === 2;

  return (
    <View>
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
            <TouchableOpacity
              style={[styles.saveButton, { marginHorizontal: 16, marginBottom: 10 }]}
              onPress={() => onPickImage(pointNumber)}
            >
              <Text style={styles.saveButtonText}>📷 ถ่าย/เลือกรูปจุดนี้</Text>
            </TouchableOpacity>
          </View>
        </View>

        {Object.entries(data)
          .filter(([key]) => key !== 'mode')
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
      </View>

      {imagePoint?.uri && (
        <Image
          source={{ uri: imagePoint.uri }}
          style={{
            width: '90%',
            height: 200,
            marginHorizontal: 16,
            marginBottom: 10,
            borderRadius: 10
          }}
        />
      )}
    </View>
  );
};

export default SavedPointCard;
