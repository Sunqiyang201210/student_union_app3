import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  published_at: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'meeting': return 'users';
    case 'recruit': return 'user-plus';
    case 'activity': return 'calendar-star';
    default: return 'bell';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'meeting': return '#6C63FF';
    case 'recruit': return '#00B894';
    case 'activity': return '#FF6584';
    default: return '#6C63FF';
  }
};

const getPriorityBadge = (priority: string) => {
  if (priority === 'high') {
    return { text: '重要', color: '#FF6B6B', bg: 'rgba(255, 107, 107, 0.12)' };
  }
  return null;
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (retries = 3) => {
    try {
      // 使用环境变量配置的后端地址
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
      console.log('Fetching notifications from:', baseUrl);
      
      // localtunnel bypass header
      const headers: Record<string, string> = {};
      if (baseUrl.includes('loca.lt')) {
        headers['bypass-tunnel-reminder'] = 'true';
      }
      
      const response = await fetch(`${baseUrl}/api/v1/notifications`, {
        headers,
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) throw new Error('Network response not ok');
      
      const data = await response.json();
      if (data.code === 0) {
        setNotifications(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 500));
        return fetchNotifications(retries - 1);
      }
      console.log('Failed to fetch notifications after retries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const NoticeCard = ({ item }: { item: Notification }) => {
    const priorityBadge = getPriorityBadge(item.priority);
    const iconColor = getTypeColor(item.type);
    
    return (
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}1A` }]}>
            <FontAwesome6 name={getTypeIcon(item.type) as any} size={22} color={iconColor} />
          </View>
          <View style={styles.cardContentContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {priorityBadge && (
                <View style={[styles.priorityBadge, { backgroundColor: priorityBadge.bg }]}>
                  <Text style={[styles.priorityText, { color: priorityBadge.color }]}>
                    {priorityBadge.text}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>
            <Text style={styles.cardDate}>{formatDate(item.published_at)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>学生会通知</Text>
        <Text style={styles.headerSubtitle}>共 {notifications.length} 条通知</Text>
      </View>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6C63FF']} />
        }
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="spinner" size={32} color="#B2BEC3" />
            <Text style={styles.emptyText}>加载中...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="bell-slash" size={48} color="#B2BEC3" />
            <Text style={styles.emptyText}>暂无通知</Text>
          </View>
        ) : (
          notifications.map((item) => (
            <NoticeCard key={item.id} item={item} />
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D3436',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  cardOuter: {
    marginBottom: 16,
  },
  cardInner: {
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContentContainer: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#B2BEC3',
    marginTop: 12,
  },
});
