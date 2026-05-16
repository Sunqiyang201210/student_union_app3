'use client';

import { useState, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View, Badge, Button } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';

interface Match {
  id: number;
  league: string;
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  match_time: string;
  venue: string;
  status: string;
}

type LeagueFilter = '全部' | '足球联赛' | '篮球联赛';

export default function ScheduleScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<LeagueFilter>('全部');

  const fetchMatches = useCallback(async () => {
    try {
      const response = await api.getMatches();
      if (response.code === 0) {
        setMatches(response.data as Match[]);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      initStorage();
      fetchMatches();
    }, [fetchMatches])
  );

  const filteredMatches = matches.filter((match) => {
    if (activeFilter === '全部') return true;
    if (activeFilter === '足球联赛') return match.league.includes('足球');
    if (activeFilter === '篮球联赛') return match.league.includes('篮球');
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">已结束</Badge>;
    }
    if (status === 'live') {
      return <Badge className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">进行中</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">未开始</Badge>;
  };

  const getLeagueIcon = (league: string) => {
    return league.includes('篮球') ? '篮球' : '足球';
  };

  const getLeagueColor = (league: string) => {
    return league.includes('篮球') ? 'bg-orange-500' : 'bg-emerald-500';
  };

  return (
    <Screen>
      <View className="flex-1 bg-gray-50">
        {/* 顶部标题 */}
        <View className="bg-white px-5 pt-12 pb-4 border-b border-gray-100">
          <Text className="text-gray-900 text-xl font-bold">足联篮联赛程</Text>
          <Text className="text-gray-400 text-sm mt-0.5">
            {loading ? '加载中...' : `共 ${matches.length} 场比赛`}
          </Text>
        </View>

        {/* 筛选按钮 */}
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            {(['全部', '足球联赛', '篮球联赛'] as LeagueFilter[]).map((filter) => (
              <Button
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`flex-1 py-2 px-3 rounded-lg ${
                  activeFilter === filter ? 'bg-white shadow-sm' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-sm font-medium text-center ${
                    activeFilter === filter ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {filter}
                </Text>
              </Button>
            ))}
          </View>
        </View>

        {/* 赛程列表 */}
        <View className="flex-1 px-4 py-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">加载中...</Text>
            </View>
          ) : filteredMatches.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">暂无赛程</Text>
            </View>
          ) : (
            filteredMatches.map((item, index) => (
              <Card key={item.id} className="mb-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* 联赛标签 */}
                <View className={`${getLeagueColor(item.league)} px-3 py-1.5 flex-row items-center`}>
                  <Text className="text-white text-sm mr-1">{getLeagueIcon(item.league)}</Text>
                  <Text className="text-white text-xs font-medium">{item.league}</Text>
                </View>

                <View className="p-4">
                  {/* 对阵双方 */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1 items-center">
                      <Text className="text-gray-800 font-bold text-base">{item.home_team}</Text>
                    </View>
                    
                    <View className="px-4">
                      {item.home_score !== null && item.away_score !== null ? (
                        <View className="bg-gray-100 rounded-lg px-3 py-1">
                          <Text className="text-gray-700 font-bold text-lg">
                            {item.home_score} - {item.away_score}
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-gray-400 text-lg">VS</Text>
                      )}
                    </View>
                    
                    <View className="flex-1 items-center">
                      <Text className="text-gray-800 font-bold text-base">{item.away_team}</Text>
                    </View>
                  </View>

                  {/* 比赛信息 */}
                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <View className="flex-row items-center">
                      <Text className="text-gray-400 text-xs">日期 {formatDate(item.match_time)}</Text>
                      <Text className="text-blue-500 text-xs ml-3 font-medium">
                        时间 {formatTime(item.match_time)}
                      </Text>
                    </View>
                    {getStatusBadge(item.status)}
                  </View>

                  {/* 场地 */}
                  <View className="flex-row items-center mt-2">
                    <Text className="text-gray-400 text-xs">地点 {item.venue}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </View>
    </Screen>
  );
}
