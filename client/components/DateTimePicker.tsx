import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePickerLib from '@react-native-community/datetimepicker';

// 简单日期时间选择器组件
// Web上使用Modal+TextInput，原生平台使用DateTimePicker
interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
}

export default function DateTimePickerComponent({
  value,
  onChange,
  placeholder = '选择日期和时间',
  mode = 'datetime',
  display = 'default',
}: DateTimePickerProps) {
  const [showWebPicker, setShowWebPicker] = useState(false);
  const [webDate, setWebDate] = useState('');
  const [webTime, setWebTime] = useState('');

  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  };

  // Web平台使用简单的输入框
  if (Platform.OS === 'web') {
    const handleWebConfirm = () => {
      if (webDate && webTime) {
        const dateStr = `${webDate}T${webTime}:00`;
        onChange(new Date(dateStr));
      }
      setShowWebPicker(false);
    };

    return (
      <>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowWebPicker(true)}
        >
          <Text style={styles.placeholder}>
            {formatDateTime(value)}
          </Text>
        </TouchableOpacity>

        <Modal visible={showWebPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>选择日期和时间</Text>
              
              <Text style={styles.label}>日期 (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={webDate}
                onChangeText={setWebDate}
                placeholder="2024-12-20"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>时间 (HH:MM)</Text>
              <TextInput
                style={styles.textInput}
                value={webTime}
                onChangeText={setWebTime}
                placeholder="18:00"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowWebPicker(false)}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleWebConfirm}
                >
                  <Text style={styles.confirmButtonText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // 原生平台使用DateTimePicker
  const DateTimePicker = DateTimePickerLib;
  
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={display}
      onChange={(event: any, selectedDate?: Date) => {
        if (selectedDate) {
          onChange(selectedDate);
        }
      }}
      style={styles.nativePicker}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 56,
    justifyContent: 'center',
  },
  placeholder: {
    color: '#374151',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  nativePicker: {
    width: '100%',
  },
});
