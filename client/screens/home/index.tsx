'use client';

import { useState, useCallback } from 'react';
import { Link } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card, Text, View } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';

interface Stats {
  notifications: number;
  activities: number;
  matches: number;
}

export default function HomeScreen() {
  const [counts, setCounts] = useState<Stats>({ notifications: 0, activities: 0, matches: 0 });
  const [loading, setLoading] = useState(true);

  // 初始化存储
  useFocusEffect(
    useCallback(() => {
      initStorage();
      fetchCounts();
    }, [])
  );

  const fetchCounts = async () => {
    try {
      const response = await api.getStats();
      if (response.code === 0) {
        setCounts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: '学生会通知',
      icon: '📢',
      iconBg: 'bg-blue-50',
      count: counts.notifications,
      href: '/notifications',
      color: 'text-blue-600',
    },
    {
      title: '活动通知',
      icon: '🎉',
      iconBg: 'bg-orange-50',
      count: counts.activities,
      href: '/activities',
      color: 'text-orange-600',
    },
    {
      title: '足联篮联赛程',
      icon: '⚽',
      iconBg: 'bg-green-50',
      count: counts.matches,
      href: '/schedule',
      color: 'text-green-600',
    },
    {
      title: '意见反馈',
      icon: '💡',
      iconBg: 'bg-purple-50',
      href: '/feedback',
      color: 'text-purple-600',
    },
  ];

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <View className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 pt-12 pb-8">
          <Text className="text-white text-2xl font-bold">学生会</Text>
          <Text className="text-blue-100 text-sm mt-1">Student Union</Text>
        </View>

        {/* 功能菜单 */}
        <View className="px-4 -mt-4">
          <View className="flex-row flex-wrap justify-between">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href as any} asChild>
                <Card className="w-[48%] mb-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <View className="flex-row items-center">
                    <View className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center`}>
                      <Text className="text-2xl">{item.icon}</Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-800 font-medium">{item.title}</Text>
                      {item.count !== undefined && (
                        <Text className="text-gray-400 text-xs mt-0.5">
                          {loading ? '加载中...' : `${item.count} 条内容`}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
              </Link>
            ))}
          </View>
        </View>

        {/* 底部信息 */}
        <View className="px-4 mt-auto pb-8">
          <Text className="text-center text-gray-400 text-xs">
            校园生活服务助手
          </Text>
        </View>
      </View>
    </Screen>
  );
}
