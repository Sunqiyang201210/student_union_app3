'use client';

import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View, Button, Input } from '@/components/ui';
import { useRouter } from 'expo-router';
import { api } from '@/utils/storage';

export default function FeedbackScreen() {
  const router = useRouter();
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
      <View className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 flex-row items-center">
          <Button onPress={() => router.back()} className="mr-2 p-2 -ml-2">
            <Text className="text-gray-600 text-xl">←</Text>
          </Button>
          <Text className="text-gray-900 text-xl font-bold">意见反馈</Text>
        </View>

        <View className="flex-1 px-4 py-6">
          <Card className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <Text className="text-gray-800 font-bold text-lg mb-4">提交反馈</Text>

            {/* 提交人 */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-gray-600 text-sm">提交人 *</Text>
                <Text className={`text-xs ${submitterLength > 20 ? 'text-red-500' : 'text-gray-400'}`}>
                  {submitterLength}/20
                </Text>
              </View>
              <Input
                value={submitter}
                onChangeText={setSubmitter}
                placeholder="请输入您的姓名"
                className="bg-gray-50 rounded-xl px-4 py-3"
              />
            </View>

            {/* 反馈内容 */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-gray-600 text-sm">反馈内容 *</Text>
                <Text className={`text-xs ${contentLength > 50 ? 'text-red-500' : 'text-gray-400'}`}>
                  {contentLength}/50
                </Text>
              </View>
              <Input
                value={content}
                onChangeText={setContent}
                placeholder="请简述您的反馈"
                className="bg-gray-50 rounded-xl px-4 py-3"
              />
            </View>

            {/* 详细内容 */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-gray-600 text-sm">详细内容（选填）</Text>
                <Text className={`text-xs ${detailLength > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {detailLength}/500
                </Text>
              </View>
              <Input
                value={detail}
                onChangeText={setDetail}
                placeholder="请详细描述您的问题或建议"
                multiline
                className="bg-gray-50 rounded-xl px-4 py-3 h-32"
              />
            </View>

            {/* 提交按钮 */}
            <Button
              onPress={handleSubmit}
              disabled={submitting}
              className={`py-3.5 rounded-xl ${submitting ? 'bg-gray-300' : 'bg-blue-500'}`}
            >
              <Text className="text-white font-medium text-base">
                {submitting ? '提交中...' : '提交反馈'}
              </Text>
            </Button>

            <Text className="text-gray-400 text-xs text-center mt-4">
              感谢您的反馈，我们将认真处理每一条意见
            </Text>
          </Card>
        </View>
      </View>
    </Screen>
  );
}
