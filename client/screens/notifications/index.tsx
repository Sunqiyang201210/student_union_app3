'use client';

import { useState, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View, Badge } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  published_at: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.getNotifications();
      if (response.code === 0) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      initStorage();
      fetchNotifications();
    }, [fetchNotifications])
  );

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: '会议',
      recruit: '招募',
      notice: '通知',
      activity: '活动',
    };
    return labels[type] || '通知';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-100 text-blue-700',
      recruit: 'bg-green-100 text-green-700',
      notice: 'bg-gray-100 text-gray-700',
      activity: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
          <Text className="text-gray-900 text-xl font-bold">学生会通知</Text>
          <Text className="text-gray-400 text-sm mt-0.5">
            {loading ? '加载中...' : `共 ${notifications.length} 条通知`}
          </Text>
        </View>

        {/* 通知列表 */}
        <View className="flex-1 px-4 py-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">加载中...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">暂无通知</Text>
            </View>
          ) : (
            notifications.map((item, index) => (
              <Card
                key={item.id}
                className={`mb-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${
                  item.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-gray-800 font-medium text-base flex-1 pr-2" numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Badge className={`px-2 py-0.5 rounded text-xs ${getTypeColor(item.type)}`}>
                    {getTypeLabel(item.type)}
                  </Badge>
                </View>
                <Text className="text-gray-500 text-sm leading-relaxed" numberOfLines={2}>
                  {item.content}
                </Text>
                <Text className="text-gray-400 text-xs mt-2">
                  {formatDate(item.published_at)}
                  {item.priority === 'high' && (
                    <Text className="text-red-500 ml-2">重要</Text>
                  )}
                </Text>
              </Card>
            ))
          )}
        </View>
      </View>
    </Screen>
  );
}
