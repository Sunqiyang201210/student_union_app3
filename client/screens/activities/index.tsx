'use client';

import { useState, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View, Badge } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';

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
      <View className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
          <Text className="text-gray-900 text-xl font-bold">活动通知</Text>
          <Text className="text-gray-400 text-sm mt-0.5">
            {loading ? '加载中...' : `共 ${activities.length} 个活动`}
          </Text>
        </View>

        {/* 活动列表 */}
        <View className="flex-1 px-4 py-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">加载中...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">暂无活动</Text>
            </View>
          ) : (
            activities.map((item, index) => (
              <Card key={item.id} className="mb-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* 顶部装饰条 */}
                <View className="h-1 bg-gradient-to-r from-orange-400 to-orange-500" />
                
                <View className="p-4">
                  {/* 标题和状态 */}
                  <View className="flex-row justify-between items-start mb-3">
                    <Text className="text-gray-800 font-bold text-base flex-1 pr-2" numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Badge className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">
                      即将开始
                    </Badge>
                  </View>

                  {/* 描述 */}
                  <Text className="text-gray-500 text-sm leading-relaxed mb-3" numberOfLines={2}>
                    {item.description}
                  </Text>

                  {/* 时间信息 */}
                  <View className="bg-gray-50 rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-gray-400 text-sm">时间 {formatDate(item.start_time)}</Text>
                      <Text className="text-orange-500 text-sm ml-4 font-medium">
                        时间 {formatTime(item.start_time)}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 text-sm">位置 {item.location}</Text>
                    </View>
                  </View>

                  {/* 主办方 */}
                  <View className="flex-row items-center">
                    <View className="bg-blue-50 px-2 py-1 rounded">
                      <Text className="text-blue-600 text-xs">组织 {item.organizer}</Text>
                    </View>
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
