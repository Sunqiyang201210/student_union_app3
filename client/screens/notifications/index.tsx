'use client';

import { useState, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';
import { FontAwesome6 } from '@expo/vector-icons';

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

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; bg: string; color: string; icon: string }> = {
      meeting: { label: '会议', bg: 'rgba(108, 99, 255, 0.12)', color: '#6C63FF', icon: 'users' },
      recruit: { label: '招募', bg: 'rgba(0, 184, 148, 0.12)', color: '#00B894', icon: 'hand-holding-heart' },
      notice: { label: '通知', bg: 'rgba(253, 203, 110, 0.12)', color: '#FDCB6E', icon: 'bell' },
      activity: { label: '活动', bg: 'rgba(255, 101, 132, 0.12)', color: '#FF6584', icon: 'party-bell' },
    };
    return configs[type] || configs.notice;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Screen>
      <View className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
        {/* 顶部标题 */}
        <View 
          className="px-6 pt-14 pb-6"
          style={{ 
            background: 'linear-gradient(135deg, #6C63FF 0%, #896BFF 100%)',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white text-2xl font-bold">学生会通知</Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome6 name="bullhorn" size={14} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 text-sm ml-2">
              {loading ? '加载中...' : `共 ${notifications.length} 条通知`}
            </Text>
          </View>
        </View>

        {/* 通知列表 */}
        <View className="flex-1 px-4 py-5">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(108, 99, 255, 0.12)' }}
              >
                <FontAwesome6 name="spinner" size={24} color="#6C63FF" />
              </View>
              <Text className="mt-4" style={{ color: 'var(--muted)' }}>加载中...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(108, 99, 255, 0.08)' }}
              >
                <FontAwesome6 name="inbox" size={32} color="#6C63FF" />
              </View>
              <Text className="text-lg font-medium" style={{ color: 'var(--muted)' }}>暂无通知</Text>
              <Text className="text-sm mt-1" style={{ color: 'var(--muted)' }}>稍后再来看看吧</Text>
            </View>
          ) : (
            notifications.map((item, index) => {
              const typeConfig = getTypeConfig(item.type);
              return (
                <Card
                  key={item.id}
                  className="mb-4"
                  style={{ 
                    backgroundColor: 'var(--surface)',
                    borderRadius: 20,
                    boxShadow: 'var(--surface-shadow)',
                    borderLeftWidth: 4,
                    borderLeftColor: item.priority === 'high' ? '#FF6584' : typeConfig.color,
                  }}
                >
                  <View className="p-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center flex-1">
                        <View 
                          className="w-10 h-10 rounded-xl items-center justify-center"
                          style={{ backgroundColor: typeConfig.bg }}
                        >
                          <FontAwesome6 name={typeConfig.icon as any} size={18} color={typeConfig.color} />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text 
                            className="font-semibold text-base leading-snug"
                            style={{ color: 'var(--foreground)' }}
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>
                        </View>
                      </View>
                      <View 
                        className="px-3 py-1 rounded-full ml-2"
                        style={{ backgroundColor: typeConfig.bg }}
                      >
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: typeConfig.color }}
                        >
                          {typeConfig.label}
                        </Text>
                      </View>
                    </View>
                    <Text 
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--muted)' }}
                      numberOfLines={2}
                    >
                      {item.content}
                    </Text>
                    <View className="flex-row items-center mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: 'var(--border)' }}>
                      <FontAwesome6 name="clock" size={12} color="var(--muted)" />
                      <Text className="text-xs ml-2" style={{ color: 'var(--muted)' }}>
                        {formatDate(item.published_at)}
                      </Text>
                      {item.priority === 'high' && (
                        <View 
                          className="flex-row items-center px-2 py-0.5 rounded-full ml-3"
                          style={{ backgroundColor: 'rgba(255, 101, 132, 0.12)' }}
                        >
                          <FontAwesome6 name="star" size={10} color="#FF6584" />
                          <Text className="text-xs ml-1 font-medium" style={{ color: '#FF6584' }}>重要</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </View>
    </Screen>
  );
}
