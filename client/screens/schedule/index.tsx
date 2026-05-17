'use client';

import { useState, useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card, Text, View, Button } from '@/components/ui';
import { useFocusEffect } from 'expo-router';
import { api, initStorage } from '@/utils/storage';
import { FontAwesome6 } from '@expo/vector-icons';

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
        setMatches(response.data as unknown as Match[]);
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

  const getStatusInfo = (status: string) => {
    if (status === 'completed') {
      return { text: '已结束', color: '#00B894', bgColor: 'rgba(0, 184, 148, 0.12)' };
    }
    if (status === 'live') {
      return { text: '进行中', color: '#FF6B6B', bgColor: 'rgba(255, 107, 107, 0.12)' };
    }
    return { text: '未开始', color: '#6C63FF', bgColor: 'rgba(108, 99, 255, 0.12)' };
  };

  const isBasketball = (league: string) => league.includes('篮球');
  const isFootball = (league: string) => league.includes('足球');

  return (
    <Screen>
      <View className="flex-1" style={{ backgroundColor: 'var(--background)' }}>
        {/* 顶部标题 */}
        <View 
          className="px-6 pt-14 pb-6"
          style={{ 
            background: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white text-2xl font-bold">足联篮联赛程</Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome6 name="futbol" size={14} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 text-sm ml-2">
              {loading ? '加载中...' : `共 ${matches.length} 场精彩对决`}
            </Text>
          </View>
        </View>

        {/* 筛选按钮 */}
        <View className="px-4 py-4">
          <View 
            className="flex-row p-1.5 rounded-2xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            {(['全部', '足球联赛', '篮球联赛'] as LeagueFilter[]).map((filter) => {
              const isActive = activeFilter === filter;
              const icon = filter === '全部' ? 'list' : isBasketball(filter) ? 'basketball' : 'futbol';
              
              return (
                <View
                  key={filter}
                  onTouchEnd={() => setActiveFilter(filter)}
                  className="flex-1 py-2.5 px-2 rounded-xl items-center"
                  style={{
                    backgroundColor: isActive ? 'rgba(17, 153, 142, 0.12)' : 'transparent',
                  }}
                >
                  <FontAwesome6 
                    name={icon as any} 
                    size={14} 
                    color={isActive ? '#11998E' : 'var(--muted)'} 
                  />
                  <Text 
                    className="text-xs font-medium mt-1.5"
                    style={{ color: isActive ? '#11998E' : 'var(--muted)' }}
                  >
                    {filter}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 赛程列表 */}
        <View className="flex-1 px-4 pb-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(17, 153, 142, 0.12)' }}
              >
                <FontAwesome6 name="spinner" size={24} color="#11998E" />
              </View>
              <Text className="mt-4" style={{ color: 'var(--muted)' }}>加载中...</Text>
            </View>
          ) : filteredMatches.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(17, 153, 142, 0.08)' }}
              >
                <FontAwesome6 name="calendar-xmark" size={32} color="#11998E" />
              </View>
              <Text className="text-lg font-medium" style={{ color: 'var(--muted)' }}>暂无赛程</Text>
              <Text className="text-sm mt-1" style={{ color: 'var(--muted)' }}>敬请期待更多精彩比赛</Text>
            </View>
          ) : (
            filteredMatches.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              const isBasket = isBasketball(item.league);
              
              return (
                <Card
                  key={item.id}
                  className="mb-4 overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--surface)',
                    borderRadius: 20,
                    boxShadow: 'var(--surface-shadow)',
                  }}
                >
                  {/* 联赛标签 */}
                  <View 
                    className="px-4 py-2.5 flex-row items-center"
                    style={{ 
                      background: isBasket 
                        ? 'linear-gradient(90deg, #FF8C00 0%, #FFA500 100%)'
                        : 'linear-gradient(90deg, #11998E 0%, #38EF7D 100%)',
                    }}
                  >
                    <FontAwesome6 
                      name={isBasket ? 'basketball' : 'futbol'} 
                      size={14} 
                      color="white" 
                    />
                    <Text className="text-white text-sm font-medium ml-2">
                      {item.league}
                    </Text>
                  </View>

                  <View className="p-4">
                    {/* 对阵双方 */}
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-1 items-center">
                        <View 
                          className="w-12 h-12 rounded-full items-center justify-center mb-2"
                          style={{ backgroundColor: 'rgba(17, 153, 142, 0.12)' }}
                        >
                          <FontAwesome6 name="shield-halved" size={20} color="#11998E" />
                        </View>
                        <Text 
                          className="font-bold text-sm text-center leading-tight"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {item.home_team}
                        </Text>
                      </View>
                      
                      <View className="px-4 items-center">
                        {item.home_score !== null && item.away_score !== null ? (
                          <View 
                            className="rounded-2xl px-4 py-2"
                            style={{ backgroundColor: 'var(--background)' }}
                          >
                            <Text className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
                              {item.home_score} - {item.away_score}
                            </Text>
                          </View>
                        ) : (
                          <Text className="text-2xl font-bold" style={{ color: 'var(--muted)' }}>
                            VS
                          </Text>
                        )}
                        <View 
                          className="mt-2 px-3 py-1 rounded-full"
                          style={{ backgroundColor: statusInfo.bgColor }}
                        >
                          <Text className="text-xs font-medium" style={{ color: statusInfo.color }}>
                            {statusInfo.text}
                          </Text>
                        </View>
                      </View>
                      
                      <View className="flex-1 items-center">
                        <View 
                          className="w-12 h-12 rounded-full items-center justify-center mb-2"
                          style={{ backgroundColor: isBasket ? 'rgba(255, 140, 0, 0.12)' : 'rgba(56, 239, 125, 0.12)' }}
                        >
                          <FontAwesome6 name="shield-halved" size={20} color={isBasket ? '#FF8C00' : '#38EF7D'} />
                        </View>
                        <Text 
                          className="font-bold text-sm text-center leading-tight"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {item.away_team}
                        </Text>
                      </View>
                    </View>

                    {/* 比赛信息卡片 */}
                    <View 
                      className="rounded-2xl p-3"
                      style={{ backgroundColor: 'var(--background)' }}
                    >
                      <View className="flex-row items-center">
                        <View className="flex-row items-center flex-1">
                          <FontAwesome6 name="calendar-day" size={12} color="var(--muted)" />
                          <Text className="text-xs ml-2" style={{ color: 'var(--muted)' }}>
                            {formatDate(item.match_time)}
                          </Text>
                        </View>
                        <View className="flex-row items-center flex-1">
                          <FontAwesome6 name="clock" size={12} color="var(--muted)" />
                          <Text className="text-xs ml-2 font-medium" style={{ color: '#11998E' }}>
                            {formatTime(item.match_time)}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mt-2">
                        <FontAwesome6 name="location-dot" size={12} color="var(--muted)" />
                        <Text className="text-xs ml-2" style={{ color: 'var(--muted)' }}>
                          {item.venue}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </View>
    </Screen>
  );
}
