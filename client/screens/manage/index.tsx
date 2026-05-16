'use client';

import { useState, useCallback } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card, Text, Button, Input, Modal } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { api, initStorage, API_BASE } from '@/utils/storage';

type ContentType = 'notifications' | 'activities' | 'matches';

interface ContentItem {
  id: number;
  title?: string;
  content?: string;
  description?: string;
  home_team?: string;
  away_team?: string;
  [key: string]: any;
}

export default function ManageScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ContentType>('notifications');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', location: '', start_time: '' });

  const fetchData = useCallback(async () => {
    try {
      initStorage();
      let response;
      if (activeTab === 'notifications') {
        response = await api.getNotifications();
      } else if (activeTab === 'activities') {
        response = await api.getActivities();
      } else {
        response = await api.getMatches();
      }
      if (response.code === 0) {
        setItems(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        router.replace('/login');
        return;
      }
      fetchData();
    }, [user, fetchData, router])
  );

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      let response: { code: number; message?: string };
      if (activeTab === 'notifications') {
        response = await api.deleteNotification(id);
      } else if (activeTab === 'activities') {
        response = await api.deleteActivity(id);
      } else {
        response = await api.deleteMatch(id);
      }
      if (response.code === 0) {
        alert('删除成功');
        fetchData();
      } else {
        alert(response.message || '删除失败');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败');
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ title: '', content: '', location: '', start_time: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('请输入标题');
      return;
    }
    try {
      let response;
      if (activeTab === 'notifications') {
        response = await api.createNotification({
          title: formData.title,
          content: formData.content,
          type: 'general',
        });
      } else if (activeTab === 'activities') {
        response = await api.createActivity({
          title: formData.title,
          description: formData.content,
          location: formData.location,
          start_time: formData.start_time,
        });
      } else {
        response = await api.createMatch({
          home_team: formData.title,
          away_team: formData.content,
          match_time: formData.start_time,
          venue: formData.location,
        });
      }
      if (response.code === 0) {
        alert('保存成功');
        setModalVisible(false);
        fetchData();
      } else {
        alert(response.message || '保存失败');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存失败');
    }
  };

  const getTitle = (item: ContentItem) => {
    return item.title || item.home_team || '未命名';
  };

  const getSubtitle = (item: ContentItem) => {
    return item.content || item.description || `${item.home_team} vs ${item.away_team}` || '';
  };

  if (!user) {
    return (
      <Screen>
        <View className="flex-1 bg-gray-50 items-center justify-center p-6">
          <Text className="text-gray-500 mb-4">请先登录管理员账号</Text>
          <Button onPress={() => router.push('/login')} className="bg-blue-500 px-6 py-3 rounded-xl">
            <Text className="text-white">去登录</Text>
          </Button>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
          <Text className="text-gray-900 text-xl font-bold">内容管理</Text>
          <Text className="text-gray-400 text-sm mt-0.5">管理 {user.username} 的内容</Text>
        </View>

        {/* Tab切换 */}
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            {(['notifications', 'activities', 'matches'] as ContentType[]).map((tab) => (
              <Button
                key={tab}
                onPress={() => { setActiveTab(tab); setLoading(true); }}
                className={`flex-1 py-2 px-2 rounded-lg ${activeTab === tab ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              >
                <Text className={`text-xs font-medium ${activeTab === tab ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab === 'notifications' ? '通知' : tab === 'activities' ? '活动' : '赛程'}
                </Text>
              </Button>
            ))}
          </View>
        </View>

        {/* 内容列表 */}
        <View className="flex-1 px-4 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-600 text-sm">
              共 {items.length} 条
            </Text>
            <Button onPress={handleAdd} className="bg-blue-500 px-4 py-2 rounded-xl">
              <Text className="text-white text-sm">+ 新增</Text>
            </Button>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">加载中...</Text>
            </View>
          ) : items.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">暂无内容</Text>
            </View>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-3">
                    <Text className="text-gray-800 font-medium text-sm mb-1" numberOfLines={1}>
                      {getTitle(item)}
                    </Text>
                    <Text className="text-gray-400 text-xs" numberOfLines={2}>
                      {getSubtitle(item)}
                    </Text>
                  </View>
                  <Button
                    onPress={() => handleDelete(item.id)}
                    className="bg-red-50 p-2 rounded-lg"
                  >
                    <FontAwesome6 name="trash" size={18} color="#ef4444" />
                  </Button>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* 新增/编辑弹窗 */}
        <Modal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <View className="bg-white rounded-2xl p-6 mx-4">
            <Text className="text-gray-800 font-bold text-lg mb-4">
              {editingItem ? '编辑' : '新增'} {activeTab === 'notifications' ? '通知' : activeTab === 'activities' ? '活动' : '赛程'}
            </Text>

            <View className="space-y-4">
              {activeTab === 'matches' ? (
                <>
                  <View>
                    <Text className="text-gray-600 text-sm mb-1">主队/第一项</Text>
                    <Input
                      value={formData.title}
                      onChangeText={(text: string) => setFormData({ ...formData, title: text })}
                      placeholder="请输入"
                      className="bg-gray-50 rounded-xl px-4 py-3"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-600 text-sm mb-1">客队/第二项</Text>
                    <Input
                      value={formData.content}
                      onChangeText={(text: string) => setFormData({ ...formData, content: text })}
                      placeholder="请输入"
                      className="bg-gray-50 rounded-xl px-4 py-3"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-600 text-sm mb-1">时间</Text>
                    <Input
                      value={formData.start_time}
                      onChangeText={(text: string) => setFormData({ ...formData, start_time: text })}
                      placeholder="格式: 2024-12-20 15:00"
                      className="bg-gray-50 rounded-xl px-4 py-3"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-600 text-sm mb-1">地点/场馆</Text>
                    <Input
                      value={formData.location}
                      onChangeText={(text: string) => setFormData({ ...formData, location: text })}
                      placeholder="请输入"
                      className="bg-gray-50 rounded-xl px-4 py-3"
                    />
                  </View>
                </>
              ) : (
                <>
                  <View>
                    <Text className="text-gray-600 text-sm mb-1">标题 *</Text>
                    <Input
                      value={formData.title}
                      onChangeText={(text: string) => setFormData({ ...formData, title: text })}
                      placeholder="请输入标题"
                      className="bg-gray-50 rounded-xl px-4 py-3"
                    />
                  </View>
                  <View>
                    <Text className="text-gray-600 text-sm mb-1">
                      {activeTab === 'activities' ? '描述' : '内容'}
                    </Text>
                    <Input
                      value={formData.content}
                      onChangeText={(text: string) => setFormData({ ...formData, content: text })}
                      placeholder="请输入内容"
                      multiline
                      className="bg-gray-50 rounded-xl px-4 py-3 h-24"
                    />
                  </View>
                  {activeTab === 'activities' && (
                    <>
                      <View>
                        <Text className="text-gray-600 text-sm mb-1">时间</Text>
                        <Input
                          value={formData.start_time}
                          onChangeText={(text: string) => setFormData({ ...formData, start_time: text })}
                          placeholder="格式: 2024-12-20 15:00"
                          className="bg-gray-50 rounded-xl px-4 py-3"
                        />
                      </View>
                      <View>
                        <Text className="text-gray-600 text-sm mb-1">地点</Text>
                        <Input
                          value={formData.location}
                          onChangeText={(text: string) => setFormData({ ...formData, location: text })}
                          placeholder="请输入地点"
                          className="bg-gray-50 rounded-xl px-4 py-3"
                        />
                      </View>
                    </>
                  )}
                </>
              )}
            </View>

            <View className="flex-row mt-6 space-x-3">
              <Button
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-100 py-3 rounded-xl"
              >
                <Text className="text-gray-600">取消</Text>
              </Button>
              <Button onPress={handleSave} className="flex-1 bg-blue-500 py-3 rounded-xl">
                <Text className="text-white">保存</Text>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}
