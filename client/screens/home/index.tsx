'use client';

import { useState, useCallback } from 'react';
import { Link } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card, Text, View } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';
import { FontAwesome6 } from '@expo/vector-icons';

interface Stats {
  notifications: number;
  activities: number;
  matches: number;
}

export default function HomeScreen() {
  const [counts, setCounts] = useState<Stats>({ notifications: 0, activities: 0, matches: 0 });
  const [loading, setLoading] = useState(true);

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
      subtitle: '查看最新通知',
      icon: 'bullhorn',
      count: counts.notifications,
      href: '/notifications',
      iconBg: 'rgba(108, 99, 255, 0.12)',
      iconColor: '#6C63FF',
    },
    {
      title: '活动通知',
      subtitle: '精彩校园活动',
      icon: 'party-bell',
      count: counts.activities,
      href: '/activities',
      iconBg: 'rgba(255, 101, 132, 0.12)',
      iconColor: '#FF6584',
    },
    {
      title: '足联篮联赛程',
      subtitle: '足球篮球赛程',
      icon: 'football',
      count: counts.matches,
      href: '/schedule',
      iconBg: 'rgba(0, 184, 148, 0.12)',
      iconColor: '#00B894',
    },
    {
      title: '意见反馈',
      subtitle: '提交您的建议',
      icon: 'comment-dots',
      href: '/feedback',
      iconBg: 'rgba(253, 203, 110, 0.12)',
      iconColor: '#FDCB6E',
    },
  ];

  return (
    <Screen>
      <View className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
        {/* 顶部渐变背景 */}
        <View 
          className="px-6 pt-14 pb-10"
          style={{ 
            background: 'linear-gradient(135deg, #6C63FF 0%, #896BFF 50%, #FF6584 100%)',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white text-3xl font-bold">学生会</Text>
          <Text className="text-white/80 text-sm mt-1 tracking-wide">Student Union</Text>
          <Text className="text-white/60 text-xs mt-3">
            校园生活服务助手
          </Text>
        </View>

        {/* 功能菜单 */}
        <View className="px-4 -mt-6">
          <View className="flex-row flex-wrap justify-between">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href as any} asChild>
                <Card 
                  className="w-[48%] mb-4"
                  style={{ 
                    backgroundColor: 'var(--surface)',
                    borderRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 6, height: 6 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  <View className="items-center p-4">
                    <View 
                      className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                      style={{ backgroundColor: item.iconBg }}
                    >
                      <FontAwesome6 name={item.icon as any} size={24} color={item.iconColor} />
                    </View>
                    <Text 
                      className="font-semibold text-base mb-1"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {item.title}
                    </Text>
                    <Text 
                      className="text-xs"
                      style={{ color: 'var(--muted)' }}
                    >
                      {item.subtitle}
                    </Text>
                    {item.count !== undefined && (
                      <View 
                        className="mt-2 px-3 py-1 rounded-full"
                        style={{ backgroundColor: item.iconBg }}
                      >
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: item.iconColor }}
                        >
                          {loading ? '...' : `${item.count} 条`}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              </Link>
            ))}
          </View>
        </View>

        {/* 底部提示 */}
        <View className="px-4 mt-auto pb-8">
          <View 
            className="rounded-2xl p-4 mx-2"
            style={{ 
              backgroundColor: 'var(--surface)',
              boxShadow: 'var(--surface-shadow)',
            }}
          >
            <View className="flex-row items-center">
              <View 
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(108, 99, 255, 0.12)' }}
              >
                <FontAwesome6 name="circle-info" size={18} color="#6C63FF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  温馨提示
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  点击卡片进入对应功能，管理员可登录管理内容
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}
