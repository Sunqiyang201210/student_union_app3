'use client';

import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';
import { api, initStorage } from '@/utils/storage';
import Toast from 'react-native-toast-message';

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
    Toast.show({
      type: 'info',
      text1: '确认删除',
      text2: '删除后将无法恢复',
      onPress: async () => {
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
            Toast.show({ type: 'success', text1: '删除成功' });
            fetchData();
          } else {
            Toast.show({ type: 'error', text1: '删除失败', text2: response.message });
          }
        } catch (error) {
          console.error('Delete error:', error);
          Toast.show({ type: 'error', text1: '删除失败' });
        }
      },
    });
  };

  const handleAdd = () => {
    setFormData({ title: '', content: '', location: '', start_time: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      Toast.show({ type: 'error', text1: '请输入标题' });
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
        Toast.show({ type: 'success', text1: '保存成功' });
        setModalVisible(false);
        fetchData();
      } else {
        Toast.show({ type: 'error', text1: '保存失败', text2: response.message });
      }
    } catch (error) {
      console.error('Save error:', error);
      Toast.show({ type: 'error', text1: '保存失败' });
    }
  };

  const getTitle = (item: ContentItem) => item.title || item.home_team || '未命名';
  const getSubtitle = (item: ContentItem) => item.content || item.description || `${item.home_team || ''} vs ${item.away_team || ''}`;

  if (!user) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.notLoggedIn}>
            <View style={styles.notLoggedInIcon}>
              <FontAwesome6 name="user-lock" size={48} color="#6C63FF" />
            </View>
            <Text style={styles.notLoggedInTitle}>请先登录</Text>
            <Text style={styles.notLoggedInSubtitle}>登录后才能管理内容</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
              <Text style={styles.loginButtonText}>去登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  const tabs: { key: ContentType; label: string; icon: string }[] = [
    { key: 'notifications', label: '通知', icon: 'bell' },
    { key: 'activities', label: '活动', icon: 'calendar-alt' },
    { key: 'matches', label: '赛程', icon: 'futbol' },
  ];

  return (
    <Screen>
      <View style={styles.container}>
        {/* 顶部标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>内容管理</Text>
          <Text style={styles.headerSubtitle}>欢迎，{user.username}</Text>
        </View>

        {/* Tab切换 */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => { setActiveTab(tab.key); setLoading(true); }}
            >
              <FontAwesome6
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? '#6C63FF' : '#B2BEC3'}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 内容列表 */}
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listCount}>共 {items.length} 条</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <FontAwesome6 name="plus" size={14} color="#FFFFFF" />
              <Text style={styles.addButtonText}>新增</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <FontAwesome6 name="spinner" size={32} color="#B2BEC3" />
              <Text style={styles.emptyText}>加载中...</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome6 name="inbox" size={48} color="#DFE6E9" />
              <Text style={styles.emptyText}>暂无内容</Text>
              <Text style={styles.emptyHint}>点击上方&quot;新增&quot;添加内容</Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{getTitle(item)}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={2}>{getSubtitle(item)}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <FontAwesome6 name="trash" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* 新增/编辑弹窗 */}
        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>新增 {tabs.find(t => t.key === activeTab)?.label}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <FontAwesome6 name="xmark" size={20} color="#636E72" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  {activeTab === 'matches' ? '主队/第一项' : '标题'} *
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text: string) => setFormData({ ...formData, title: text })}
                    placeholder="请输入"
                    placeholderTextColor="#B2BEC3"
                  />
                </View>
              </View>

              {activeTab === 'matches' ? (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>客队/第二项</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={formData.content}
                        onChangeText={(text: string) => setFormData({ ...formData, content: text })}
                        placeholder="请输入"
                        placeholderTextColor="#B2BEC3"
                      />
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>时间</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={formData.start_time}
                        onChangeText={(text: string) => setFormData({ ...formData, start_time: text })}
                        placeholder="格式: 2024-12-20 15:00"
                        placeholderTextColor="#B2BEC3"
                      />
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>地点/场馆</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        value={formData.location}
                        onChangeText={(text: string) => setFormData({ ...formData, location: text })}
                        placeholder="请输入"
                        placeholderTextColor="#B2BEC3"
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>{activeTab === 'activities' ? '描述' : '内容'}</Text>
                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.content}
                        onChangeText={(text: string) => setFormData({ ...formData, content: text })}
                        placeholder="请输入内容"
                        placeholderTextColor="#B2BEC3"
                        multiline
                        numberOfLines={3}
                      />
                    </View>
                  </View>
                  {activeTab === 'activities' && (
                    <>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>时间</Text>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.input}
                            value={formData.start_time}
                            onChangeText={(text: string) => setFormData({ ...formData, start_time: text })}
                            placeholder="格式: 2024-12-20 15:00"
                            placeholderTextColor="#B2BEC3"
                          />
                        </View>
                      </View>
                      <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>地点</Text>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.input}
                            value={formData.location}
                            onChangeText={(text: string) => setFormData({ ...formData, location: text })}
                            placeholder="请输入地点"
                            placeholderTextColor="#B2BEC3"
                          />
                        </View>
                      </View>
                    </>
                  )}
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 20,
    backgroundColor: '#6C63FF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B2BEC3',
  },
  tabTextActive: {
    color: '#6C63FF',
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listCount: {
    fontSize: 14,
    color: '#636E72',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 18,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#B2BEC3',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyHint: {
    fontSize: 13,
    color: '#DFE6E9',
    marginTop: 8,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedInIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notLoggedInTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D3436',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F0F0F3',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2D3436',
  },
  textAreaContainer: {
    minHeight: 80,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F3',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#636E72',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
