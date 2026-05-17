'use client';

import { useState, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View, Button } from '@/components/ui';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { api, initStorage } from '@/utils/storage';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ notifications: 0, activities: 0, matches: 0 });

  const fetchStats = useCallback(async () => {
    try {
      initStorage();
      const [notifRes, actRes, matchRes] = await Promise.all([
        api.getNotifications(),
        api.getActivities(),
        api.getMatches(),
      ]);
      setStats({
        notifications: notifRes.data?.length || 0,
        activities: actRes.data?.length || 0,
        matches: matchRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  return (
    <Screen>
      <View className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
        {/* 顶部渐变背景 */}
        <View 
          className="px-6 pt-14 pb-8"
          style={{ 
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white text-2xl font-bold">我的</Text>
          <Text className="text-white/70 text-sm mt-1">欢迎使用学生会APP</Text>
        </View>

        <View className="flex-1 px-4 -mt-6">
          {/* 用户信息卡片 */}
          <Card
            className="mb-4 overflow-hidden"
            style={{ 
              backgroundColor: 'var(--surface)',
              borderRadius: 20,
              boxShadow: 'var(--surface-shadow)',
            }}
          >
            <View className="p-5 flex-row items-center">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ 
                  background: user 
                    ? 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
                    : 'linear-gradient(135deg, #B8B8B8 0%, #9B9B9B 100%)'
                }}
              >
                <FontAwesome6 name="user" size={28} color="white" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                  {user ? user.username : '游客用户'}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View 
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: user ? 'rgba(102, 126, 234, 0.15)' : 'rgba(156, 163, 175, 0.15)' }}
                  >
                    <Text 
                      className="text-xs font-medium"
                      style={{ color: user ? '#667EEA' : '#9B9B9B' }}
                    >
                      {user ? '管理员' : '普通用户'}
                    </Text>
                  </View>
                </View>
              </View>
              {!user && (
                <Link href="/login" asChild>
                  <Button 
                    size="sm"
                    style={{ backgroundColor: '#667EEA', borderRadius: 12 }}
                  >
                    <Text className="text-white text-sm font-medium">登录</Text>
                  </Button>
                </Link>
              )}
            </View>
          </Card>

          {/* 数据统计卡片 */}
          <Card
            className="mb-4 overflow-hidden"
            style={{ 
              backgroundColor: 'var(--surface)',
              borderRadius: 20,
              boxShadow: 'var(--surface-shadow)',
            }}
          >
            <View className="p-4">
              <Text className="font-medium text-sm mb-3" style={{ color: 'var(--muted)' }}>
                内容统计
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: 'rgba(102, 126, 234, 0.12)' }}
                  >
                    <FontAwesome6 name="bell" size={20} color="#667EEA" />
                  </View>
                  <Text className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
                    {stats.notifications}
                  </Text>
                  <Text className="text-xs" style={{ color: 'var(--muted)' }}>通知</Text>
                </View>
                <View className="items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: 'rgba(255, 140, 0, 0.12)' }}
                  >
                    <FontAwesome6 name="calendar-plus" size={20} color="#FF8C00" />
                  </View>
                  <Text className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
                    {stats.activities}
                  </Text>
                  <Text className="text-xs" style={{ color: 'var(--muted)' }}>活动</Text>
                </View>
                <View className="items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: 'rgba(17, 153, 142, 0.12)' }}
                  >
                    <FontAwesome6 name="futbol" size={20} color="#11998E" />
                  </View>
                  <Text className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
                    {stats.matches}
                  </Text>
                  <Text className="text-xs" style={{ color: 'var(--muted)' }}>赛程</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* 功能入口 */}
          <Card
            className="mb-4 overflow-hidden"
            style={{ 
              backgroundColor: 'var(--surface)',
              borderRadius: 20,
              boxShadow: 'var(--surface-shadow)',
            }}
          >
            <View className="p-4">
              <Text className="font-medium text-sm mb-3" style={{ color: 'var(--muted)' }}>
                快捷功能
              </Text>
              
              <View>
                <Link href="/notifications" asChild>
                  <View className="flex-row items-center py-3 px-2 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                    <View 
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{ backgroundColor: 'rgba(102, 126, 234, 0.12)' }}
                    >
                      <FontAwesome6 name="bell" size={18} color="#667EEA" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-medium" style={{ color: 'var(--foreground)' }}>学生会通知</Text>
                      <Text className="text-xs" style={{ color: 'var(--muted)' }}>查看最新通知公告</Text>
                    </View>
                    <Text style={{ color: 'var(--muted)' }}>{'>'}</Text>
                  </View>
                </Link>

                <Link href="/activities" asChild>
                  <View className="flex-row items-center py-3 px-2 mt-2 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                    <View 
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{ backgroundColor: 'rgba(255, 140, 0, 0.12)' }}
                    >
                      <FontAwesome6 name="calendar-plus" size={18} color="#FF8C00" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-medium" style={{ color: 'var(--foreground)' }}>活动通知</Text>
                      <Text className="text-xs" style={{ color: 'var(--muted)' }}>查看近期活动</Text>
                    </View>
                    <Text style={{ color: 'var(--muted)' }}>{'>'}</Text>
                  </View>
                </Link>

                <Link href="/schedule" asChild>
                  <View className="flex-row items-center py-3 px-2 mt-2 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                    <View 
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{ backgroundColor: 'rgba(17, 153, 142, 0.12)' }}
                    >
                      <FontAwesome6 name="futbol" size={18} color="#11998E" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-medium" style={{ color: 'var(--foreground)' }}>足联篮联赛程</Text>
                      <Text className="text-xs" style={{ color: 'var(--muted)' }}>查看比赛安排</Text>
                    </View>
                    <Text style={{ color: 'var(--muted)' }}>{'>'}</Text>
                  </View>
                </Link>

                <Link href="/feedback" asChild>
                  <View className="flex-row items-center py-3 px-2 mt-2 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                    <View 
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)' }}
                    >
                      <FontAwesome6 name="comment" size={18} color="#A855F7" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-medium" style={{ color: 'var(--foreground)' }}>意见反馈</Text>
                      <Text className="text-xs" style={{ color: 'var(--muted)' }}>提交您的建议</Text>
                    </View>
                    <Text style={{ color: 'var(--muted)' }}>{'>'}</Text>
                  </View>
                </Link>
              </View>
            </View>
          </Card>

          {/* 管理员功能 */}
          {user && (
            <Card
              className="mb-4 overflow-hidden"
              style={{ 
                backgroundColor: 'var(--surface)',
                borderRadius: 20,
                boxShadow: 'var(--surface-shadow)',
              }}
            >
              <View className="p-4">
                <Text className="font-medium text-sm mb-3" style={{ color: 'var(--muted)' }}>
                  管理功能
                </Text>
                
                <Link href="/manage" asChild>
                  <View className="flex-row items-center py-3 px-2 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                    <View 
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)' }}
                    >
                      <FontAwesome6 name="pen-to-square" size={18} color="#EF4444" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-medium" style={{ color: 'var(--foreground)' }}>内容管理</Text>
                      <Text className="text-xs" style={{ color: 'var(--muted)' }}>管理通知、活动、赛程</Text>
                    </View>
                    <Text style={{ color: 'var(--muted)' }}>{'>'}</Text>
                  </View>
                </Link>

                <View 
                  onTouchEnd={logout}
                  className="flex-row items-center py-3 px-2 mt-2 rounded-xl"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <View 
                    className="w-11 h-11 rounded-xl items-center justify-center"
                    style={{ backgroundColor: 'rgba(156, 163, 175, 0.12)' }}
                  >
                    <FontAwesome6 name="arrow-right-from-bracket" size={18} color="#9B9B9B" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-medium" style={{ color: '#EF4444' }}>退出登录</Text>
                    <Text className="text-xs" style={{ color: 'var(--muted)' }}>切换账号</Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
        </View>
      </View>
    </Screen>
  );
}
