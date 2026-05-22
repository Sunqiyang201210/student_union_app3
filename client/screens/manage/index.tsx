import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert, Modal } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { FontAwesome6 } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

type TabType = 'notifications' | 'activities' | 'matches';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  published_at: string;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  organizer: string;
  status: string;
}

interface Match {
  id: number;
  league: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_time: string;
  venue: string;
  status: string;
}

export default function ManageScreen() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState('notice');
  const [formPriority, setFormPriority] = useState('normal');
  const [formLocation, setFormLocation] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formOrganizer, setFormOrganizer] = useState('');
  const [formLeague, setFormLeague] = useState('校足球联赛');
  const [formHomeTeam, setFormHomeTeam] = useState('');
  const [formAwayTeam, setFormAwayTeam] = useState('');
  const [formVenue, setFormVenue] = useState('');

  const getBaseUrl = () => process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 
  (typeof window !== 'undefined' ? `http://${window.location.hostname}:9091` : 'http://localhost:9091');

  const fetchData = async () => {
    const baseUrl = getBaseUrl();
    try {
      const [notifRes, actRes, matchRes] = await Promise.all([
        fetch(`${baseUrl}/api/v1/notifications`),
        fetch(`${baseUrl}/api/v1/activities`),
        fetch(`${baseUrl}/api/v1/matches`),
      ]);
      const notifData = await notifRes.json();
      const actData = await actRes.json();
      const matchData = await matchRes.json();
      
      setNotifications(notifData.data || []);
      setActivities(actData.data || []);
      setMatches(matchData.data || []);
    } catch (e) {
      console.log('Fetch data failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'notifications') {
      setFormTitle(item.title);
      setFormContent(item.content);
      setFormType(item.type);
      setFormPriority(item.priority);
    } else if (activeTab === 'activities') {
      setFormTitle(item.title);
      setFormContent(item.description);
      setFormLocation(item.location);
      setFormStartTime(item.start_time);
      setFormOrganizer(item.organizer);
    } else if (activeTab === 'matches') {
      setFormLeague(item.league);
      setFormHomeTeam(item.home_team);
      setFormAwayTeam(item.away_team);
      setFormStartTime(item.match_time);
      setFormVenue(item.venue);
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormType('notice');
    setFormPriority('normal');
    setFormLocation('');
    setFormStartTime('');
    setFormOrganizer('');
    setFormLeague('校足球联赛');
    setFormHomeTeam('');
    setFormAwayTeam('');
    setFormVenue('');
  };

  const handleSubmit = async () => {
    const currentToken = token;
    if (!currentToken) {
      Toast.show({ type: 'error', text1: '请先登录管理员账号' });
      return;
    }
    setLoading(true);
    const baseUrl = getBaseUrl();
    
    try {
      let url = '';
      let body: any = {};

      if (activeTab === 'notifications') {
        if (!formTitle || !formContent) {
          Toast.show({ type: 'error', text1: '请填写完整信息' });
          setLoading(false);
          return;
        }
        url = editingItem 
          ? `${baseUrl}/api/v1/notifications/${editingItem.id}`
          : `${baseUrl}/api/v1/notifications`;
        body = { title: formTitle, content: formContent, type: formType, priority: formPriority };
      } else if (activeTab === 'activities') {
        if (!formTitle || !formStartTime) {
          Toast.show({ type: 'error', text1: '请填写标题和开始时间' });
          setLoading(false);
          return;
        }
        url = editingItem 
          ? `${baseUrl}/api/v1/activities/${editingItem.id}`
          : `${baseUrl}/api/v1/activities`;
        body = { title: formTitle, description: formContent, location: formLocation, start_time: formStartTime, organizer: formOrganizer };
      } else if (activeTab === 'matches') {
        if (!formHomeTeam || !formAwayTeam || !formStartTime) {
          Toast.show({ type: 'error', text1: '请填写完整信息' });
          setLoading(false);
          return;
        }
        url = editingItem 
          ? `${baseUrl}/api/v1/matches/${editingItem.id}`
          : `${baseUrl}/api/v1/matches`;
        body = { league: formLeague, home_team: formHomeTeam, away_team: formAwayTeam, match_time: formStartTime, venue: formVenue };
      }

      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.code === 0) {
        Toast.show({ type: 'success', text1: editingItem ? '更新成功' : '创建成功' });
        setModalVisible(false);
        resetForm();
        fetchData();
      } else {
        Toast.show({ type: 'error', text1: data.message || '操作失败' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: '网络错误' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (!token) {
      Toast.show({ type: 'error', text1: '请先登录管理员账号' });
      return;
    }
    
    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const currentToken = token;
          const baseUrl = getBaseUrl();
          let endpoint = '';
          
          if (activeTab === 'notifications') {
            endpoint = `/api/v1/notifications/${id}`;
          } else if (activeTab === 'activities') {
            endpoint = `/api/v1/activities/${id}`;
          } else if (activeTab === 'matches') {
            endpoint = `/api/v1/matches/${id}`;
          }
          
          const url = `${baseUrl}${endpoint}`;
          
          try {
            const response = await fetch(url, {
              method: 'DELETE',
              headers: { 
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            const data = await response.json();
            console.log('Delete response:', response.status, data);
            
            if (response.ok && data.code === 0) {
              Toast.show({ type: 'success', text1: '删除成功' });
              fetchData();
            } else {
              const errorMsg = data.message || `HTTP ${response.status}`;
              Toast.show({ type: 'error', text1: `删除失败: ${errorMsg}` });
            }
          } catch (e: any) {
            console.log('Delete error:', e);
            Toast.show({ type: 'error', text1: `网络错误: ${e?.message || '请重试'}` });
          }
        },
      },
    ]);
  };

  const TabButton = ({ tab, label, icon }: { tab: TabType; label: string; icon: string }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <FontAwesome6 name={icon as any} size={16} color={activeTab === tab ? '#FFFFFF' : '#6C63FF'} />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderNotificationItem = (item: Notification) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.typeBadge, { backgroundColor: item.priority === 'high' ? '#FF6B6B' : '#6C63FF' }]}>
          <Text style={styles.typeBadgeText}>{item.priority === 'high' ? '重要' : '普通'}</Text>
        </View>
      </View>
      <Text style={styles.itemContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.itemFooter}>
        <Text style={styles.itemDate}>{new Date(item.published_at).toLocaleDateString()}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
            <FontAwesome6 name="edit" size={14} color="#6C63FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
            <FontAwesome6 name="trash" size={14} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderActivityItem = (item: Activity) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.typeBadge, { backgroundColor: '#00B894' }]}>
          <Text style={styles.typeBadgeText}>{item.status === 'upcoming' ? '进行中' : item.status}</Text>
        </View>
      </View>
      <Text style={styles.itemContent} numberOfLines={2}>{item.description}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemInfoText}>{item.location}</Text>
        <Text style={styles.itemInfoText}>{item.organizer}</Text>
      </View>
      <View style={styles.itemFooter}>
        <Text style={styles.itemDate}>{item.start_time}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
            <FontAwesome6 name="edit" size={14} color="#6C63FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
            <FontAwesome6 name="trash" size={14} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMatchItem = (item: Match) => (
    <View key={item.id} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.league}</Text>
        <View style={[styles.typeBadge, { backgroundColor: '#6C63FF' }]}>
          <Text style={styles.typeBadgeText}>{item.status === 'scheduled' ? '未开始' : item.status}</Text>
        </View>
      </View>
      <View style={styles.matchTeams}>
        <Text style={styles.teamName}>{item.home_team}</Text>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.teamName}>{item.away_team}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemInfoText}>{item.venue}</Text>
        <Text style={styles.itemInfoText}>{item.match_time}</Text>
      </View>
      <View style={styles.itemFooter}>
        <View />
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
            <FontAwesome6 name="edit" size={14} color="#6C63FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
            <FontAwesome6 name="trash" size={14} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // 未登录提示
  if (!token) {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>内容管理</Text>
          <Text style={styles.headerSubtitle}>发布和管理学生会内容</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <FontAwesome6 name="lock" size={60} color="#CCC" />
          <Text style={{ fontSize: 18, color: '#666', marginTop: 16, textAlign: 'center' }}>
            请先登录管理员账号
          </Text>
          <Text style={{ fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' }}>
            在"我的"页面进行登录
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>内容管理</Text>
        <Text style={styles.headerSubtitle}>发布和管理学生会内容</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton tab="notifications" label="通知" icon="bell" />
        <TabButton tab="activities" label="活动" icon="calendar-star" />
        <TabButton tab="matches" label="赛程" icon="football" />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />}
      >
        {activeTab === 'notifications' && notifications.map(renderNotificationItem)}
        {activeTab === 'activities' && activities.map(renderActivityItem)}
        {activeTab === 'matches' && matches.map(renderMatchItem)}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <FontAwesome6 name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? '编辑' : '新增'}
                {activeTab === 'notifications' ? '通知' : activeTab === 'activities' ? '活动' : '赛程'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="times" size={20} color="#636E72" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {activeTab === 'notifications' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>标题</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="请输入标题"
                      value={formTitle}
                      onChangeText={setFormTitle}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>内容</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      placeholder="请输入内容"
                      value={formContent}
                      onChangeText={setFormContent}
                      multiline
                    />
                  </View>
                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>类型</Text>
                      <View style={styles.formSelect}>
                        {['notice', 'meeting', 'recruit', 'activity'].map((t) => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.selectOption, formType === t && styles.selectOptionActive]}
                            onPress={() => setFormType(t)}
                          >
                            <Text style={[styles.selectOptionText, formType === t && styles.selectOptionTextActive]}>
                              {t === 'notice' ? '通知' : t === 'meeting' ? '会议' : t === 'recruit' ? '招募' : '活动'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>优先级</Text>
                    <View style={styles.formSelect}>
                      {[
                        { value: 'normal', label: '普通' },
                        { value: 'high', label: '重要' },
                      ].map((p) => (
                        <TouchableOpacity
                          key={p.value}
                          style={[styles.selectOption, formPriority === p.value && styles.selectOptionActive]}
                          onPress={() => setFormPriority(p.value)}
                        >
                          <Text style={[styles.selectOptionText, formPriority === p.value && styles.selectOptionTextActive]}>
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {activeTab === 'activities' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>标题</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="请输入活动标题"
                      value={formTitle}
                      onChangeText={setFormTitle}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>描述</Text>
                    <TextInput
                      style={[styles.formInput, styles.formTextArea]}
                      placeholder="请输入活动描述"
                      value={formContent}
                      onChangeText={setFormContent}
                      multiline
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>地点</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="请输入活动地点"
                      value={formLocation}
                      onChangeText={setFormLocation}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>开始时间 (格式: 2024-12-20 18:00:00)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="2024-12-20 18:00:00"
                      value={formStartTime}
                      onChangeText={setFormStartTime}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>主办方</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="请输入主办方"
                      value={formOrganizer}
                      onChangeText={setFormOrganizer}
                    />
                  </View>
                </>
              )}

              {activeTab === 'matches' && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>联赛</Text>
                    <View style={styles.formSelect}>
                      {['校足球联赛', '校篮球联赛'].map((l) => (
                        <TouchableOpacity
                          key={l}
                          style={[styles.selectOption, formLeague === l && styles.selectOptionActive]}
                          onPress={() => setFormLeague(l)}
                        >
                          <Text style={[styles.selectOptionText, formLeague === l && styles.selectOptionTextActive]}>
                            {l}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>主队</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="请输入主队名称"
                      value={formHomeTeam}
                      onChangeText={setFormHomeTeam}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>客队</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="请输入客队名称"
                      value={formAwayTeam}
                      onChangeText={setFormAwayTeam}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>比赛时间 (格式: 2024-12-20 18:00:00)</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="2024-12-20 18:00:00"
                      value={formStartTime}
                      onChangeText={setFormStartTime}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>场地</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="请输入比赛场地"
                      value={formVenue}
                      onChangeText={setFormVenue}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>{loading ? '提交中...' : '保存'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F3' },
  contentContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 160 },
  header: { backgroundColor: '#F0F0F3', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#2D3436' },
  headerSubtitle: { fontSize: 13, color: '#636E72', marginTop: 4 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12 },
  tabButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(108, 99, 255, 0.12)',
  },
  tabButtonActive: { backgroundColor: '#6C63FF' },
  tabButtonText: { fontSize: 13, fontWeight: '600', color: '#6C63FF' },
  tabButtonTextActive: { color: '#FFFFFF' },
  itemCard: {
    backgroundColor: '#F0F0F3', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#D1D9E6', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.6, shadowRadius: 6,
    elevation: 4, borderWidth: 0.5, borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#2D3436', flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  itemContent: { fontSize: 13, color: '#636E72', marginBottom: 8 },
  itemInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  itemInfoText: { fontSize: 12, color: '#636E72' },
  matchTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 },
  teamName: { fontSize: 15, fontWeight: '600', color: '#2D3436' },
  vsText: { fontSize: 14, fontWeight: '700', color: '#B2BEC3' },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemDate: { fontSize: 12, color: '#B2BEC3' },
  itemActions: { flexDirection: 'row', gap: 12 },
  actionButton: { padding: 4 },
  fab: {
    position: 'absolute', bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#F0F0F3', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%', paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#E8E8EB',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#2D3436' },
  modalBody: { padding: 20 },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12 },
  formLabel: { fontSize: 14, fontWeight: '600', color: '#2D3436', marginBottom: 8 },
  formInput: {
    backgroundColor: '#E8E8EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#2D3436',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  formTextArea: { minHeight: 100, textAlignVertical: 'top' },
  formSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectOption: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
  },
  selectOptionActive: { backgroundColor: '#6C63FF' },
  selectOptionText: { fontSize: 13, fontWeight: '600', color: '#6C63FF' },
  selectOptionTextActive: { color: '#FFFFFF' },
  submitButton: {
    backgroundColor: '#6C63FF', marginHorizontal: 20, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
