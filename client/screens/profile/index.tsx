import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { Link } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

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
            <FontAwesome6 name="user-graduate" size={40} color="#6C63FF" />
          </View>
          <Text style={styles.userName}>学生用户</Text>
          <Text style={styles.userRole}>学生会成员</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>通知</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>活动</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>10</Text>
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
    fontSize: 14,
    color: '#636E72',
  },
  statsRow: {
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#636E72',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8EB',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  menuSection: {
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  menuItemOuter: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
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
  aboutCard: {
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#636E72',
  },
  aboutValue: {
    fontSize: 14,
    color: '#2D3436',
  },
});
