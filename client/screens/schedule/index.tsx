import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
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
  const router = useSafeRouter();
  const { league } = useSafeSearchParams<{ league?: string }>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(league || '足球联赛');

  const fetchMatches = async (retries = 3) => {
    try {
      // 使用环境变量配置的后端地址
      const baseUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
      console.log('Fetching matches from:', baseUrl);
      
      // localtunnel bypass header
      const headers: Record<string, string> = {};
      if (baseUrl.includes('loca.lt')) {
        headers['bypass-tunnel-reminder'] = 'true';
      }
      
      const response = await fetch(`${baseUrl}/api/v1/matches?league=${encodeURIComponent(selectedLeague)}`, {
        headers,
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
      console.log('Failed to fetch matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (league) {
        setSelectedLeague(league);
      }
    }, [league])
  );

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [selectedLeague])
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

  const getLeagueIcon = (league: string) => {
    return league.includes('篮球') ? 'basketball' : 'football';
  };

  const getLeagueColor = (league: string) => {
    return league.includes('篮球') ? '#FF6584' : '#00B894';
  };

  const MatchCard = ({ item }: { item: Match }) => {
    const { date, weekday, time } = formatDateTime(item.match_time);
    const isFinished = item.status === 'finished';
    const leagueColor = getLeagueColor(item.league);
    
    return (
      <View style={styles.cardOuter}>
        <View style={styles.cardInner}>
          {/* Date Header */}
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{date}</Text>
            <Text style={styles.weekdayText}>{weekday}</Text>
            <Text style={styles.timeText}>{time}</Text>
          </View>
          
          {/* Teams */}
          <View style={styles.matchContainer}>
            <View style={styles.team}>
              <View style={[styles.teamBadge, { backgroundColor: `${leagueColor}1A` }]}>
                <FontAwesome6 name="shirt" size={20} color={leagueColor} />
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{item.home_team}</Text>
            </View>
            
            <View style={styles.scoreContainer}>
              {isFinished ? (
                <>
                  <Text style={styles.score}>{item.home_score ?? 0}</Text>
                  <Text style={styles.scoreDivider}>:</Text>
                  <Text style={styles.score}>{item.away_score ?? 0}</Text>
                </>
              ) : (
                <Text style={styles.vsText}>VS</Text>
              )}
            </View>
            
            <View style={styles.team}>
              <View style={[styles.teamBadge, { backgroundColor: `${leagueColor}1A` }]}>
                <FontAwesome6 name="shirt" size={20} color={leagueColor} />
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{item.away_team}</Text>
            </View>
          </View>
          
          {/* Venue */}
          <View style={styles.venueContainer}>
            <FontAwesome6 name="location-dot" size={12} color="#B2BEC3" />
            <Text style={styles.venueText}>{item.venue}</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: isFinished ? 'rgba(178, 190, 195, 0.12)' : 'rgba(108, 99, 255, 0.12)' 
            }]}>
              <Text style={[styles.statusText, { 
                color: isFinished ? '#B2BEC3' : '#6C63FF' 
              }]}>
                {isFinished ? '已结束' : '即将开始'}
              </Text>
            </View>
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
        ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome6 name="calendar-xmark" size={48} color="#B2BEC3" />
            <Text style={styles.emptyText}>暂无赛程</Text>
          </View>
        ) : (
          matches.map((item) => (
            <MatchCard key={item.id} item={item} />
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
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#F0F0F3',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
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
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
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
  cardOuter: {
    marginBottom: 16,
  },
  cardInner: {
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  weekdayText: {
    fontSize: 12,
    color: '#636E72',
  },
  timeText: {
    fontSize: 12,
    color: '#636E72',
    marginLeft: 'auto',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  score: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
  },
  scoreDivider: {
    fontSize: 28,
    fontWeight: '800',
    color: '#B2BEC3',
    marginHorizontal: 8,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B2BEC3',
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  venueText: {
    fontSize: 12,
    color: '#636E72',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
