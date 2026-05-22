import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

interface Activity {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string | null;
  organizer: string;
  status: string;
}

export default function ActivitiesScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async (retries = 3) => {
    try {
      // 使用环境变量配置的后端地址
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
      console.log('Fetching activities from:', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/v1/activities`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) throw new Error('Network response not ok');
      
      const data = await response.json();
      if (data.code === 0) {
        setActivities(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 500));
        return fetchActivities(retries - 1);
      }
      console.log('Failed to fetch activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActivities();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return {
      date: `${month}月${day}日`,
      time: `${hours}:${minutes}`,
    };
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { text: '即将开始', color: '#00B894', bg: 'rgba(0, 184, 148, 0.12)' };
      case 'ongoing':
        return { text: '进行中', color: '#6C63FF', bg: 'rgba(108, 99, 255, 0.12)' };
      case 'ended':
        return { text: '已结束', color: '#B2BEC3', bg: 'rgba(178, 190, 195, 0.12)' };
      default:
        return { text: '未知', color: '#B2BEC3', bg: 'rgba(178, 190, 195, 0.12)' };
    }
  };

  const ActivityCard = ({ item }: { item: Activity }) => {
    const { date, time } = formatDateTime(item.start_time);
    const statusConfig = getStatusConfig(item.status);
    
    return (
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          {/* Date Badge */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          
          {/* Content */}
          <View style={styles.cardContentContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.text}
                </Text>
              </View>
            </View>
            
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <FontAwesome6 name="location-dot" size={14} color="#6C63FF" />
                <Text style={styles.infoText}>{item.location}</Text>
              </View>
              <View style={styles.infoItem}>
                <FontAwesome6 name="user" size={14} color="#6C63FF" />
                <Text style={styles.infoText}>{item.organizer}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>活动通知</Text>
        <Text style={styles.headerSubtitle}>精彩活动不容错过</Text>
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
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="calendar-xmark" size={48} color="#B2BEC3" />
            <Text style={styles.emptyText}>暂无活动</Text>
          </View>
        ) : (
          activities.map((item) => (
            <ActivityCard key={item.id} item={item} />
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
  dateContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#6C63FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  cardContentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    color: '#636E72',
    lineHeight: 20,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#636E72',
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
