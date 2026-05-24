import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

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

export default function ScheduleScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState('足球联赛');

  const fetchMatches = useCallback(async (retries = 3) => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
      
      const response = await fetch(`${baseUrl}/api/v1/matches?league=${encodeURIComponent(selectedLeague)}`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (!response.ok) throw new Error('Network response not ok');
      
      const data = await response.json();
      if (data.code === 0) {
        setMatches(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 500));
        return fetchMatches(retries - 1);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLeague]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMatches();
    }, [fetchMatches])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return {
      date: `${month}/${day}`,
      weekday,
      time: `${hours}:${minutes}`,
    };
  };

  // 判断比赛状态
  const getMatchStatus = (item: Match) => {
    const now = new Date();
    const matchTime = new Date(item.match_time);
    
    if (item.status === 'finished') {
      return { text: '已结束', color: '#B2BEC3', bgColor: 'rgba(178, 190, 195, 0.12)' };
    } else if (now >= matchTime && item.status === 'live') {
      return { text: '进行中', color: '#FF6B6B', bgColor: 'rgba(255, 107, 107, 0.12)' };
    } else {
      return { text: '未开始', color: '#6C63FF', bgColor: 'rgba(108, 99, 255, 0.12)' };
    }
  };

  const getLeagueIcon = (league: string) => {
    return league.includes('篮球') ? 'basketball' : 'football';
  };

  const getLeagueColor = (league: string) => {
    return league.includes('篮球') ? '#FF6584' : '#00B894';
  };

  const MatchCard = ({ item }: { item: Match }) => {
    const { date, weekday, time } = formatDateTime(item.match_time);
    const leagueColor = getLeagueColor(item.league);
    const status = getMatchStatus(item);
    
    // 比分
    const homeScore = item.home_score ?? '-';
    const awayScore = item.away_score ?? '-';
    
    return (
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          {/* 顶部：日期 + 状态 */}
          <View style={styles.topRow}>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{date}</Text>
              <Text style={styles.weekdayText}>{weekday}</Text>
              <Text style={styles.timeText}>{time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          </View>
          
          {/* 中间：比分区域 */}
          <View style={styles.scoreRow}>
            <Text style={styles.teamNameText}>{item.home_team}</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNum}>{homeScore}</Text>
              <Text style={styles.scoreColon}>:</Text>
              <Text style={styles.scoreNum}>{awayScore}</Text>
            </View>
            <Text style={styles.teamNameText}>{item.away_team}</Text>
          </View>
          
          {/* 底部：场地 */}
          <View style={styles.venueRow}>
            <FontAwesome6 name="location-dot" size={12} color="#B2BEC3" />
            <Text style={styles.venueText}>{item.venue}</Text>
          </View>
        </View>
      </View>
    );
  };

  const LeagueTab = ({ name, active }: { name: string; active: boolean }) => (
    <TouchableOpacity 
      style={[styles.tab, active && styles.tabActive]}
      onPress={() => setSelectedLeague(name)}
    >
      <FontAwesome6 
        name={getLeagueIcon(name) as any} 
        size={16} 
        color={active ? '#FFFFFF' : '#6C63FF'} 
      />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{name}</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left" size={20} color="#2D3436" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>赛程安排</Text>
        </View>
        <Text style={styles.headerSubtitle}>{selectedLeague}</Text>
      </View>
      
      {/* League Tabs */}
      <View style={styles.tabContainer}>
        <LeagueTab name="足球联赛" active={selectedLeague === '足球联赛'} />
        <LeagueTab name="篮球联赛" active={selectedLeague === '篮球联赛'} />
      </View>
      
      {/* Match List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>加载中...</Text>
          </View>
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="football" size={48} color="#B2BEC3" />
            <Text style={styles.emptyText}>暂无赛程</Text>
          </View>
        ) : (
          matches.map((item) => (
            <MatchCard key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#636E72',
    marginLeft: 36,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#6C63FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#B2BEC3',
  },
  cardOuter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardInner: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
  },
  weekdayText: {
    fontSize: 12,
    color: '#636E72',
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#636E72',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 20,
  },
  teamNameText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  scoreNum: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3436',
    minWidth: 30,
    textAlign: 'center',
  },
  scoreColon: {
    fontSize: 28,
    fontWeight: '700',
    color: '#B2BEC3',
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  venueText: {
    fontSize: 12,
    color: '#B2BEC3',
  },
});
