import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

const feedbackTypes = [
  { value: 'suggestion', label: '建议', icon: 'lightbulb' },
  { value: 'complaint', label: '投诉', icon: 'exclamation-circle' },
  { value: 'question', label: '咨询', icon: 'circle-question' },
  { value: 'other', label: '其他', icon: 'ellipsis' },
];

export default function FeedbackScreen() {
  const router = useSafeRouter();
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [selectedType, setSelectedType] = useState('suggestion');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: '请输入反馈内容',
      });
      return;
    }

    setSubmitting(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          contact: contact.trim(),
          type: selectedType,
        }),
      });
      
      const data = await response.json();
      if (data.code === 0) {
        Toast.show({
          type: 'success',
          text1: '提交成功',
          text2: '感谢您的反馈，我们会尽快处理！',
        });
        setContent('');
        setContact('');
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        Toast.show({
          type: 'error',
          text1: '提交失败',
          text2: data.message || '请稍后重试',
        });
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: '网络错误',
        text2: '请检查网络连接后重试',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const TypeSelector = () => (
    <View style={styles.typeContainer}>
      {feedbackTypes.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.typeItem,
            selectedType === type.value && styles.typeItemActive,
          ]}
          onPress={() => setSelectedType(type.value)}
        >
          <FontAwesome6
            name={type.icon as any}
            size={18}
            color={selectedType === type.value ? '#FFFFFF' : '#6C63FF'}
          />
          <Text
            style={[
              styles.typeText,
              selectedType === type.value && styles.typeTextActive,
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
            <Text style={styles.headerTitle}>意见反馈</Text>
            <Text style={styles.headerSubtitle}>您的意见是我们前进的动力</Text>
          </View>

          {/* Feedback Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>反馈类型</Text>
            <TypeSelector />
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>反馈内容</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="请详细描述您的问题或建议..."
                placeholderTextColor="#B2BEC3"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Contact Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>联系方式（选填）</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="手机号或邮箱"
                placeholderTextColor="#B2BEC3"
                value={contact}
                onChangeText={setContact}
              />
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
              · 联系方式仅用于问题反馈，不会用于其他用途{'\n'}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D3436',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
  },
  typeItemActive: {
    backgroundColor: '#6C63FF',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  input: {
    fontSize: 15,
    color: '#2D3436',
    padding: 16,
  },
  textArea: {
    fontSize: 15,
    color: '#2D3436',
    padding: 16,
    minHeight: 140,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tipsCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
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
