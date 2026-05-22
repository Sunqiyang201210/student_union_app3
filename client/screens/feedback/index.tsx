import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function FeedbackScreen() {
  const router = useSafeRouter();
  const [submitter, setSubmitter] = useState('');
  const [content, setContent] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 字数统计
  const submitterLength = submitter.length;
  const contentLength = content.length;
  const detailLength = detail.length;

  const handleSubmit = async () => {
    // 验证必填字段
    if (!submitter.trim()) {
      Toast.show({
        type: 'error',
        text1: '请输入提交人姓名',
      });
      return;
    }

    if (submitterLength > 20) {
      Toast.show({
        type: 'error',
        text1: '提交人姓名不能超过20字',
      });
      return;
    }

    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: '请输入反馈内容',
      });
      return;
    }

    if (contentLength > 50) {
      Toast.show({
        type: 'error',
        text1: '反馈内容不能超过50字',
      });
      return;
    }

    if (detailLength > 500) {
      Toast.show({
        type: 'error',
        text1: '详细内容不能超过500字',
      });
      return;
    }

    setSubmitting(true);
    try {
      const API_BASE = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 
        (typeof window !== 'undefined' ? `http://${window.location.hostname}:9091` : 'http://localhost:9091');
      const response = await fetch(`${API_BASE}/api/v1/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true'
        },
        body: JSON.stringify({
          submitter: submitter.trim(),
          content: content.trim(),
          detail: detail.trim(),
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: '提交成功',
          text2: '感谢您的反馈，我们会尽快处理！',
        });
        setSubmitter('');
        setContent('');
        setDetail('');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: '提交失败',
          text2: result.message || '请稍后重试',
        });
      }
    } catch (e) {
      console.error('Feedback error:', e);
      Toast.show({
        type: 'error',
        text1: '网络错误',
        text2: '请检查网络连接后重试',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome6 name="arrow-left" size={20} color="#6C63FF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>意见反馈</Text>
            <View style={styles.backButton} />
          </View>

          {/* Submitter Input */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>提交人</Text>
              <Text style={styles.required}>*必填</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="请输入姓名"
                placeholderTextColor="#B2BEC3"
                value={submitter}
                onChangeText={setSubmitter}
                maxLength={20}
              />
              <Text style={styles.charCount}>{submitterLength}/20</Text>
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>反馈内容</Text>
              <Text style={styles.required}>*必填</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="请简要描述您的反馈（≤50字）"
                placeholderTextColor="#B2BEC3"
                value={content}
                onChangeText={setContent}
                maxLength={50}
              />
              <Text style={styles.charCount}>{contentLength}/50</Text>
            </View>
          </View>

          {/* Detail Input */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>详细内容</Text>
              <Text style={styles.optional}>选填</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="请详细描述您的问题或建议（≤500字）..."
                placeholderTextColor="#B2BEC3"
                value={detail}
                onChangeText={setDetail}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={[styles.charCount, styles.charCountArea]}>{detailLength}/500</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <FontAwesome6 name="paper-plane" size={18} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {submitting ? '提交中...' : '提交反馈'}
            </Text>
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipHeader}>
              <FontAwesome6 name="circle-info" size={16} color="#6C63FF" />
              <Text style={styles.tipTitle}>温馨提示</Text>
            </View>
            <Text style={styles.tipText}>
              · 请详细描述您遇到的问题或建议，以便我们更好地解决{'\n'}
              · 我们将在1-3个工作日内处理您的反馈
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
  },
  section: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  required: {
    fontSize: 12,
    color: '#E74C3C',
  },
  optional: {
    fontSize: 12,
    color: '#95A5A6',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    fontSize: 15,
    color: '#2D3436',
    paddingVertical: 4,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  textArea: {
    fontSize: 15,
    color: '#2D3436',
    minHeight: 120,
    paddingVertical: 4,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  charCount: {
    fontSize: 12,
    color: '#B2BEC3',
    textAlign: 'right',
    marginTop: 8,
  },
  charCountArea: {
    position: 'absolute',
    bottom: 12,
    right: 16,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  tipText: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 22,
  },
});
