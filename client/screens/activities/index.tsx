'use client';

import { useState, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';
import { FontAwesome6 } from '@expo/vector-icons';

interface Activity {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  organizer: string;
  status: string;
}

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await api.getActivities();
      if (response.code === 0) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      initStorage();
      fetchActivities();
    }, [fetchActivities])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <Screen>
      <View className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
        {/* 顶部标题 */}
        <View 
          className="px-6 pt-14 pb-6"
          style={{ 
            background: 'linear-gradient(135deg, #FF6584 0%, #FF8A9B 100%)',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white text-2xl font-bold">活动通知</Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome6 name="star" size={14} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 text-sm ml-2">
              {loading ? '加载中...' : `共 ${activities.length} 个精彩活动`}
            </Text>
          </View>
        </View>

        {/* 活动列表 */}
        <View className="flex-1 px-4 py-5">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 101, 132, 0.12)' }}
              >
                <FontAwesome6 name="spinner" size={24} color="#FF6584" />
              </View>
              <Text className="mt-4" style={{ color: 'var(--muted)' }}>加载中...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(255, 101, 132, 0.08)' }}
              >
                <FontAwesome6 name="calendar-xmark" size={32} color="#FF6584" />
              </View>
              <Text className="text-lg font-medium" style={{ color: 'var(--muted)' }}>暂无活动</Text>
              <Text className="text-sm mt-1" style={{ color: 'var(--muted)' }}>精彩活动即将上线</Text>
            </View>
          ) : (
            activities.map((item, index) => (
              <Card
                key={item.id}
                className="mb-4 overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  borderRadius: 20,
                  boxShadow: 'var(--surface-shadow)',
                }}
              >
                {/* 顶部渐变条 */}
                <View 
                  className="h-1.5"
                  style={{ 
                    background: 'linear-gradient(90deg, #FF6584 0%, #FF8A9B 100%)',
                  }}
                />
                
                <View className="p-4">
                  {/* 标题和状态 */}
                  <View className="flex-row justify-between items-start mb-3">
                    <Text 
                      className="font-bold text-base flex-1 pr-2 leading-snug"
                      style={{ color: 'var(--foreground)' }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <View 
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(255, 101, 132, 0.12)' }}
                    >
                      <Text className="text-xs font-medium" style={{ color: '#FF6584' }}>
                        即将开始
                      </Text>
                    </View>
                  </View>

                  {/* 描述 */}
                  <Text 
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: 'var(--muted)' }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>

                  {/* 时间和地点卡片 */}
                  <View 
                    className="rounded-2xl p-4 mb-4"
                    style={{ backgroundColor: 'var(--background)' }}
                  >
                    <View className="flex-row items-center mb-2">
                      <View 
                        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(255, 101, 132, 0.12)' }}
                      >
                        <FontAwesome6 name="clock" size={14} color="#FF6584" />
                      </View>
                      <View>
                        <Text className="text-xs" style={{ color: 'var(--muted)' }}>活动时间</Text>
                        <Text className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {formatDate(item.start_time)} {formatTime(item.start_time)}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center">
                      <View 
                        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(108, 99, 255, 0.12)' }}
                      >
                        <FontAwesome6 name="location-dot" size={14} color="#6C63FF" />
                      </View>
                      <View>
                        <Text className="text-xs" style={{ color: 'var(--muted)' }}>活动地点</Text>
                        <Text className="font-medium" style={{ color: 'var(--foreground)' }}>
                          {item.location}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 主办方 */}
                  <View className="flex-row items-center">
                    <View 
                      className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                      style={{ backgroundColor: 'rgba(0, 184, 148, 0.12)' }}
                    >
                      <FontAwesome6 name="user-tie" size={14} color="#00B894" />
                    </View>
                    <Text className="text-sm" style={{ color: 'var(--muted)' }}>
                      主办: <Text className="font-medium" style={{ color: '#00B894' }}>{item.organizer}</Text>
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </View>
    </Screen>
  );
}
