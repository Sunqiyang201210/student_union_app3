import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

interface NoticeCount {
  notification: number;
  activity: number;
}

interface MenuCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  href: string;
  badge?: number;
}

function MenuCard({ icon, title, subtitle, color, href, badge }: MenuCardProps) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.menuCardOuter}>
        <View style={styles.menuCardInner}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}1A` }]}>
            <FontAwesome6 name={icon as any} size={24} color={color} />
            {badge !== undefined && badge > 0 && (
              <View style={[styles.badge, { backgroundColor: color }]}>
                <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
              </View>
            )}
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuSubtitle}>{subtitle}</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#B2BEC3" />
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export default function HomeScreen() {
  const [counts, setCounts] = useState<NoticeCount>({ notification: 0, activity: 0 });

  useFocusEffect(
    useCallback(() => {
      const fetchCounts = async () => {
        try {
          const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
          const [notifRes, actRes] = await Promise.all([
            fetch(`${baseUrl}/api/v1/notifications`),
            fetch(`${baseUrl}/api/v1/activities`),
          ]);
          const notifData = await notifRes.json();
          const actData = await actRes.json();
          setCounts({
            notification: Array.isArray(notifData.data) ? notifData.data.length : 0,
            activity: Array.isArray(actData.data) ? actData.data.length : 0,
          });
        } catch (e) {
          console.log('Failed to fetch counts, using defaults');
          setCounts({ notification: 0, activity: 0 });
        }
      };
      fetchCounts();
    }, [])
  );

  return (
    <Screen>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>你好</Text>
            <Text style={styles.title}>欢迎使用学生会</Text>
          </View>
          <View style={styles.avatarContainer}>
            <FontAwesome6 name="graduation-cap" size={24} color="#6C63FF" />
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>快捷服务</Text>
        </View>

        <View style={styles.menuGrid}>
          <MenuCard
            icon="bullhorn"
            title="学生会通知"
            subtitle="查看最新公告"
            color="#6C63FF"
            href="/(tabs)/notifications"
            badge={counts.notification}
          />
          <MenuCard
            icon="calendar-check"
            title="活动通知"
            subtitle="精彩活动不容错过"
            color="#FF6584"
            href="/(tabs)/activities"
            badge={counts.activity}
          />
          <MenuCard
            icon="football"
            title="足篮球赛程"
            subtitle="校联赛程安排"
            color="#00B894"
            href="/(tabs)/profile"
          />
          <MenuCard
            icon="comment-dots"
            title="意见反馈"
            subtitle="提出你的建议"
            color="#FDCB6E"
            href="/feedback"
          />
        </View>

        {/* Quick Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>数据概览</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{counts.notification}</Text>
            <Text style={styles.statLabel}>通知公告</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{counts.activity}</Text>
            <Text style={styles.statLabel}>精彩活动</Text>
          </View>
        </View>

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
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D3436',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  menuGrid: {
    gap: 16,
  },
  menuCardOuter: {
    marginBottom: 16,
  },
  menuCardInner: {
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#636E72',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#636E72',
  },
});
