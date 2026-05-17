'use client';

import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { api } from '@/utils/storage';
import { FontAwesome6 } from '@expo/vector-icons';

export default function FeedbackScreen() {
  const router = useSafeRouter();
  const [submitter, setSubmitter] = useState('');
  const [content, setContent] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitterLength = submitter.trim().length;
  const contentLength = content.trim().length;
  const detailLength = detail.trim().length;

  const handleSubmit = async () => {
    if (!submitter.trim()) {
      alert('请输入提交人姓名');
      return;
    }
    if (submitterLength > 20) {
      alert('提交人姓名不能超过20字');
      return;
    }
    if (!content.trim()) {
      alert('请输入反馈内容');
      return;
    }
    if (contentLength > 50) {
      alert('反馈内容不能超过50字');
      return;
    }
    if (detailLength > 500) {
      alert('详细内容不能超过500字');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.submitFeedback({
        submitter: submitter.trim(),
        content: content.trim(),
        detail: detail.trim(),
      });

      if (response.code === 0 || response.code === 201) {
        alert('提交成功，感谢您的反馈！');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        alert(response.message || '提交失败，请重试');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败，请检查网络连接');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* 顶部标题 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>意见反馈</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.content}>
          {/* 主卡片 */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <FontAwesome6 name="comment-dots" size={24} color="#6C63FF" />
              </View>
              <Text style={styles.cardTitle}>提交反馈</Text>
            </View>

            {/* 提交人 */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>提交人</Text>
                <Text style={styles.required}>*必填</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={submitter}
                  onChangeText={setSubmitter}
                  placeholder="请输入您的姓名"
                  placeholderTextColor="#B2BEC3"
                  maxLength={20}
                />
              </View>
              <Text style={[styles.charCount, submitterLength > 20 && styles.charCountError]}>
                {submitterLength}/20
              </Text>
            </View>

            {/* 反馈内容 */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>反馈内容</Text>
                <Text style={styles.required}>*必填</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={content}
                  onChangeText={setContent}
                  placeholder="请简述您的反馈"
                  placeholderTextColor="#B2BEC3"
                  maxLength={50}
                />
              </View>
              <Text style={[styles.charCount, contentLength > 50 && styles.charCountError]}>
                {contentLength}/50
              </Text>
            </View>

            {/* 详细内容 */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>详细内容</Text>
                <Text style={styles.optional}>选填</Text>
              </View>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={detail}
                  onChangeText={setDetail}
                  placeholder="请详细描述您的问题或建议"
                  placeholderTextColor="#B2BEC3"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                />
              </View>
              <Text style={[styles.charCount, detailLength > 500 && styles.charCountError]}>
                {detailLength}/500
              </Text>
            </View>

            {/* 提交按钮 */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <FontAwesome6 name="paper-plane" size={16} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>提交反馈</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.hint}>感谢您的反馈，我们将认真处理每一条意见</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 20,
    backgroundColor: '#6C63FF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: -10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  required: {
    fontSize: 12,
    color: '#FF6B6B',
    marginLeft: 6,
    fontWeight: '500',
  },
  optional: {
    fontSize: 12,
    color: '#B2BEC3',
    marginLeft: 6,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: '#F0F0F3',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2D3436',
  },
  textAreaContainer: {
    minHeight: 100,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#B2BEC3',
    textAlign: 'right',
    marginTop: 6,
  },
  charCountError: {
    color: '#FF6B6B',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#B2BEC3',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: '#B2BEC3',
    textAlign: 'center',
    marginTop: 16,
  },
});
