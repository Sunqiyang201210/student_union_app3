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
      <View className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
          <Text className="text-gray-900 text-xl font-bold">我的</Text>
        </View>

        <View className="flex-1 px-4 py-6">
          {/* 用户信息卡片 */}
          <Card className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center">
                <Text className="text-white text-2xl font-bold">
                  {user ? user.username[0].toUpperCase() : '游'}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-gray-800 font-bold text-lg">
                  {user ? user.username : '游客用户'}
                </Text>
                <Text className="text-gray-400 text-sm mt-0.5">
                  {user ? '学生会管理员' : '点击登录管理内容'}
                </Text>
              </View>
            </View>
          </Card>

          {/* 功能入口 */}
          <Card className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
            <Text className="text-gray-700 font-medium text-sm mb-3">快捷功能</Text>
            
            <View className="space-y-2">
              <Link href="/notifications" asChild>
                <Button variant="ghost" className="justify-start px-2 py-3 h-auto">
                  <View className="flex-row items-center w-full">
                    <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                      <Text className="text-blue-500 text-sm font-bold">通知</Text>
                    </View>
                    <Text className="text-gray-700 flex-1 text-left">学生会通知</Text>
                    <Text className="text-gray-400 text-sm mr-2">{stats.notifications}条</Text>
                    <Text className="text-gray-300">›</Text>
                  </View>
                </Button>
              </Link>

              <Link href="/activities" asChild>
                <Button variant="ghost" className="justify-start px-2 py-3 h-auto">
                  <View className="flex-row items-center w-full">
                    <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center mr-3">
                      <Text className="text-orange-500 text-sm font-bold">活动</Text>
                    </View>
                    <Text className="text-gray-700 flex-1 text-left">活动通知</Text>
                    <Text className="text-gray-400 text-sm mr-2">{stats.activities}条</Text>
                    <Text className="text-gray-300">›</Text>
                  </View>
                </Button>
              </Link>

              <Link href="/schedule" asChild>
                <Button variant="ghost" className="justify-start px-2 py-3 h-auto">
                  <View className="flex-row items-center w-full">
                    <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mr-3">
                      <Text className="text-green-500 text-sm font-bold">赛程</Text>
                    </View>
                    <Text className="text-gray-700 flex-1 text-left">足联篮联赛程</Text>
                    <Text className="text-gray-400 text-sm mr-2">{stats.matches}场</Text>
                    <Text className="text-gray-300">›</Text>
                  </View>
                </Button>
              </Link>

              <Link href="/feedback" asChild>
                <Button variant="ghost" className="justify-start px-2 py-3 h-auto">
                  <View className="flex-row items-center w-full">
                    <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mr-3">
                      <FontAwesome6 name="comment" size={18} color="#a855f7" />
                    </View>
                    <Text className="text-gray-700 flex-1 text-left">意见反馈</Text>
                    <Text className="text-gray-300">›</Text>
                  </View>
                </Button>
              </Link>
            </View>
          </Card>

          {/* 管理员入口 */}
          <Card className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <Text className="text-gray-700 font-medium text-sm mb-3">管理功能</Text>
            
            {user ? (
              <View className="space-y-2">
                <Link href="/manage" asChild>
                  <Button variant="ghost" className="justify-start px-2 py-3 h-auto">
                    <View className="flex-row items-center w-full">
                      <View className="w-10 h-10 rounded-xl bg-red-50 items-center justify-center mr-3">
                        <FontAwesome6 name="gear" size={18} color="#ef4444" />
                      </View>
                      <Text className="text-gray-700 flex-1 text-left">内容管理</Text>
                      <Text className="text-gray-300">›</Text>
                    </View>
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  onPress={logout}
                  className="justify-start px-2 py-3 h-auto"
                >
                  <View className="flex-row items-center w-full">
                    <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center mr-3">
                      <FontAwesome6 name="door-open" size={18} color="#6b7280" />
                    </View>
                    <Text className="text-gray-500 flex-1 text-left">退出登录</Text>
                  </View>
                </Button>
              </View>
            ) : (
              <Link href="/login" asChild>
                <Button variant="solid" className="bg-blue-500 py-3 rounded-xl">
                  <Text className="text-white font-medium">管理员登录</Text>
                </Button>
              </Link>
            )}
          </Card>
        </View>
      </View>
    </Screen>
  );
}
