import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

const MenuItem = ({ 
  icon, 
  title, 
  subtitle, 
  color, 
  href 
}: { 
  icon: string; 
  title: string; 
  subtitle: string; 
  color: string; 
  href: string;
}) => (
  <Link href={href} asChild>
    <TouchableOpacity style={styles.menuItemOuter}>
      <View style={styles.menuItemInner}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}1A` }]}>
          <FontAwesome6 name={icon as any} size={22} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <FontAwesome6 name="chevron-right" size={16} color="#B2BEC3" />
      </View>
    </TouchableOpacity>
  </Link>
);

export default function ProfileScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useSafeRouter();
  const [stats, setStats] = useState({ notifications: 0, activities: 0, matches: 0 });

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  // 从API获取统计数据
  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        try {
          const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
          const [notifRes, actRes, matchRes] = await Promise.all([
            fetch(`${baseUrl}/api/v1/notifications`),
            fetch(`${baseUrl}/api/v1/activities`),
            fetch(`${baseUrl}/api/v1/matches`),
          ]);
          
          if (notifRes.ok && actRes.ok && matchRes.ok) {
            const [notifData, actData, matchData] = await Promise.all([
              notifRes.json(),
              actRes.json(),
              matchRes.json(),
            ]);
            
            setStats({
              notifications: Array.isArray(notifData.data) ? notifData.data.length : 0,
              activities: Array.isArray(actData.data) ? actData.data.length : 0,
              matches: Array.isArray(matchData.data) ? matchData.data.length : 0,
            });
          }
        } catch (e) {
          // 静默失败，使用默认值0
        }
      };
      
      fetchStats();
    }, [])
  );

  return (
    <Screen>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            {isAuthenticated ? (
              <FontAwesome6 name="user-shield" size={40} color="#6C63FF" />
            ) : (
              <FontAwesome6 name="user-graduate" size={40} color="#6C63FF" />
            )}
          </View>
          <Text style={styles.userName}>{isAuthenticated ? user?.username : '学生用户'}</Text>
          <Text style={styles.userRole}>{isAuthenticated ? '管理员' : '学生会成员'}</Text>
        </View>

        {/* Admin Section - Only show when logged in */}
        {isAuthenticated && (
          <View style={styles.adminSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>管理功能</Text>
            </View>

            <View style={styles.menuSection}>
              <MenuItem
                icon="cog"
                title="内容管理"
                subtitle="发布和编辑通知、活动、赛程"
                color="#6C63FF"
                href="/(tabs)/manage"
              />
            </View>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.notifications}</Text>
            <Text style={styles.statLabel}>通知</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.activities}</Text>
            <Text style={styles.statLabel}>活动</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.matches}</Text>
            <Text style={styles.statLabel}>赛程</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>校园服务</Text>
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="football"
            title="足球联赛"
            subtitle="查看校足球联赛程"
            color="#00B894"
            href="/schedule?league=校足球联赛"
          />
          <MenuItem
            icon="basketball"
            title="篮球联赛"
            subtitle="查看校篮球联赛程"
            color="#FF6584"
            href="/schedule?league=校篮球联赛"
          />
          <MenuItem
            icon="comment-dots"
            title="意见反馈"
            subtitle="提交您的建议和意见"
            color="#FDCB6E"
            href="/feedback"
          />
        </View>

        {/* Auth Button */}
        <View style={styles.authSection}>
          {isAuthenticated ? (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <FontAwesome6 name="sign-out-alt" size={18} color="#FF6B6B" />
              <Text style={styles.logoutButtonText}>退出登录</Text>
            </TouchableOpacity>
          ) : (
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.loginButton}>
                <FontAwesome6 name="sign-in-alt" size={18} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>管理员登录</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>

        {/* About Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>关于</Text>
        </View>

        <View style={styles.aboutCard}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>版本</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>开发者</Text>
            <Text style={styles.aboutValue}>学生会技术部</Text>
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
  userHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: '#636E72',
  },
  adminSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuSection: {
    backgroundColor: '#F0F0F3',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  menuItemOuter: {
    backgroundColor: '#F0F0F3',
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#636E72',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F3',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E8E8EB',
    marginVertical: 4,
  },
  authSection: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  aboutCard: {
    backgroundColor: '#F0F0F3',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  aboutLabel: {
    fontSize: 14,
    color: '#636E72',
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
});
