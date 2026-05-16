/**
 * 本地存储管理器 - 替代后端API
 * 所有数据存储在浏览器的localStorage中
 */

const STORAGE_KEYS = {
  NOTIFICATIONS: 'student_union_notifications',
  ACTIVITIES: 'student_union_activities',
  MATCHES: 'student_union_matches',
  FEEDBACKS: 'student_union_feedbacks',
  ADMIN_USER: 'student_union_admin',
  ADMIN_TOKEN: 'student_union_token',
};

// 导出API基础URL供其他模块使用
export const API_BASE = ''; // 本地存储模式，不需要远程API

// 默认管理员账户
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  name: '管理员',
  role: 'admin',
};

// 默认数据
const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: '关于举办2024年度学生代表大会的通知', content: '学校定于12月15日在学术报告厅举办2024年度学生代表大会，请各学院代表准时参加。届时将进行学生会年度工作报告及换届选举。', type: 'meeting', priority: 'high', published_at: new Date().toISOString() },
  { id: 2, title: '学生会招新面试安排', content: '本周三至周五将进行学生会各部门招新面试，请已报名同学提前做好准备，具体时间地点将通过短信通知。', type: 'recruit', priority: 'normal', published_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: '校园文明倡议书', content: '为营造良好的校园环境，学生会向全体同学发出文明倡议：文明出行、礼貌待人、爱护公物、维护卫生。', type: 'notice', priority: 'normal', published_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 4, title: '关于冬至包饺子活动的通知', content: '本周六下午3点在食堂三楼举办冬至包饺子活动，欢迎同学们踊跃参加！', type: 'activity', priority: 'high', published_at: new Date(Date.now() - 259200000).toISOString() },
];

const DEFAULT_ACTIVITIES = [
  { id: 1, title: '校园歌手大赛', description: '一年一度的校园歌手大赛即将拉开帷幕，无论你是流行还是民谣，都能在这里绽放光芒！', location: '大学生活动中心', start_time: '2024-12-20 18:00:00', organizer: '文艺部', status: 'upcoming' },
  { id: 2, title: '公益支教志愿者招募', description: '加入我们，一起走进山区，为孩子们带去知识与温暖。本学期计划前往云南偏远山区支教两周。', location: '行政楼102', start_time: '2024-12-18 14:00:00', organizer: '志愿服务中心', status: 'upcoming' },
  { id: 3, title: '创业大赛报名开启', description: '第八届大学生创业大赛正式启动，丰厚奖金和创业资源等你来拿，最高可获10万元创业基金。', location: '创新创业学院', start_time: '2024-12-25 09:00:00', organizer: '创业实践部', status: 'upcoming' },
  { id: 4, title: '元旦晚会节目征集', description: '2024年元旦晚会节目征集开始了！舞蹈、小品、相声、乐器演奏...只要你敢秀，我们就给你舞台！', location: '学生会办公室', start_time: '2024-12-10 20:00:00', organizer: '文艺部', status: 'upcoming' },
];

const DEFAULT_MATCHES = [
  { id: 1, league: '校足球联赛', home_team: '计算机学院', away_team: '机械工程学院', home_score: null, away_score: null, match_time: '2024-12-16 15:00:00', venue: '北区足球场', status: 'scheduled' },
  { id: 2, league: '校足球联赛', home_team: '经济管理学院', away_team: '电气工程学院', home_score: null, away_score: null, match_time: '2024-12-16 17:00:00', venue: '南区足球场', status: 'scheduled' },
  { id: 3, league: '校足球联赛', home_team: '土木工程学院', away_team: '化学化工学院', home_score: null, away_score: null, match_time: '2024-12-17 15:00:00', venue: '北区足球场', status: 'scheduled' },
  { id: 4, league: '校篮球联赛', home_team: '计算机学院', away_team: '经济管理学院', home_score: null, away_score: null, match_time: '2024-12-15 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
  { id: 5, league: '校篮球联赛', home_team: '电气工程学院', away_team: '土木工程学院', home_score: null, away_score: null, match_time: '2024-12-15 20:00:00', venue: '体育馆B馆', status: 'scheduled' },
  { id: 6, league: '校篮球联赛', home_team: '机械工程学院', away_team: '化学化工学院', home_score: null, away_score: null, match_time: '2024-12-17 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
  { id: 7, league: '校篮球联赛', home_team: '材料科学学院', away_team: '计算机学院', home_score: null, away_score: null, match_time: '2024-12-18 19:00:00', venue: '体育馆B馆', status: 'scheduled' },
  { id: 8, league: '校篮球联赛', home_team: '经济管理学院', away_team: '电气工程学院', home_score: null, away_score: null, match_time: '2024-12-20 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
  { id: 9, league: '校足球联赛', home_team: '计算机学院', away_team: '材料科学学院', home_score: null, away_score: null, match_time: '2024-12-18 16:00:00', venue: '南区足球场', status: 'scheduled' },
  { id: 10, league: '校足球联赛', home_team: '机械工程学院', away_team: '土木工程学院', home_score: null, away_score: null, match_time: '2024-12-19 15:00:00', venue: '北区足球场', status: 'scheduled' },
];

// 辅助函数
function getStorageData<T>(key: string, defaultData: T[]): T[] {
  if (typeof window === 'undefined') return defaultData;
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.log('Error reading from localStorage:', e);
  }
  return defaultData;
}

function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.log('Error writing to localStorage:', e);
  }
}

function generateId(items: any[]): number {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}

// 初始化数据
export function initStorage(): void {
  if (typeof window === 'undefined') return;
  
  // 初始化通知
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  }
  
  // 初始化活动
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    setStorageData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
  }
  
  // 初始化赛程
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    setStorageData(STORAGE_KEYS.MATCHES, DEFAULT_MATCHES);
  }
}

// API 函数
export const api = {
  // 登录
  login: async (username: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 300)); // 模拟网络延迟
    
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      const token = btoa(JSON.stringify({ username, exp: Date.now() + 86400000 }));
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(DEFAULT_ADMIN));
      }
      return {
        code: 0,
        data: { token, user: DEFAULT_ADMIN },
        message: '登录成功',
      };
    }
    
    return {
      code: 401,
      message: '用户名或密码错误',
    };
  },

  // 退出登录
  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    }
    return { code: 0, message: '退出成功' };
  },

  // 检查登录状态
  checkAuth: () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    if (token && user) {
      try {
        const decoded = JSON.parse(atob(token));
        if (decoded.exp > Date.now()) {
          return { token, user: JSON.parse(user) };
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  },

  // 获取通知列表
  getNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const data = getStorageData(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    return { code: 0, data };
  },

  // 创建通知
  createNotification: async (notification: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notifications = getStorageData(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const newNotification = {
      ...notification,
      id: generateId(notifications),
      published_at: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return { code: 0, data: newNotification, message: '创建成功' };
  },

  // 更新通知
  updateNotification: async (id: number, notification: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notifications = getStorageData(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index] = { ...notifications[index], ...notification };
      setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
      return { code: 0, data: notifications[index], message: '更新成功' };
    }
    return { code: 404, message: '通知不存在' };
  },

  // 删除通知
  deleteNotification: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notifications = getStorageData(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const filtered = notifications.filter(n => n.id !== id);
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, filtered);
    return { code: 0, message: '删除成功' };
  },

  // 获取活动列表
  getActivities: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const data = getStorageData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    return { code: 0, data };
  },

  // 创建活动
  createActivity: async (activity: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activities = getStorageData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    const newActivity = {
      ...activity,
      id: generateId(activities),
      status: 'upcoming',
    };
    activities.unshift(newActivity);
    setStorageData(STORAGE_KEYS.ACTIVITIES, activities);
    return { code: 0, data: newActivity, message: '创建成功' };
  },

  // 更新活动
  updateActivity: async (id: number, activity: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activities = getStorageData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    const index = activities.findIndex(a => a.id === id);
    if (index !== -1) {
      activities[index] = { ...activities[index], ...activity };
      setStorageData(STORAGE_KEYS.ACTIVITIES, activities);
      return { code: 0, data: activities[index], message: '更新成功' };
    }
    return { code: 404, message: '活动不存在' };
  },

  // 删除活动
  deleteActivity: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const activities = getStorageData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    const filtered = activities.filter(a => a.id !== id);
    setStorageData(STORAGE_KEYS.ACTIVITIES, filtered);
    return { code: 0, message: '删除成功' };
  },

  // 获取赛程列表
  getMatches: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const data = getStorageData(STORAGE_KEYS.MATCHES, DEFAULT_MATCHES);
    return { code: 0, data };
  },

  // 创建赛程
  createMatch: async (match: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const matches = getStorageData(STORAGE_KEYS.MATCHES, DEFAULT_MATCHES);
    const newMatch = {
      ...match,
      id: generateId(matches),
      home_score: null,
      away_score: null,
      status: 'scheduled',
    };
    matches.unshift(newMatch);
    setStorageData(STORAGE_KEYS.MATCHES, matches);
    return { code: 0, data: newMatch, message: '创建成功' };
  },

  // 更新赛程
  updateMatch: async (id: number, match: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const matches = getStorageData(STORAGE_KEYS.MATCHES, DEFAULT_MATCHES);
    const index = matches.findIndex(m => m.id === id);
    if (index !== -1) {
      matches[index] = { ...matches[index], ...match };
      setStorageData(STORAGE_KEYS.MATCHES, matches);
      return { code: 0, data: matches[index], message: '更新成功' };
    }
    return { code: 404, message: '赛程不存在' };
  },

  // 删除赛程
  deleteMatch: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const matches = getStorageData(STORAGE_KEYS.MATCHES, DEFAULT_MATCHES);
    const filtered = matches.filter(m => m.id !== id);
    setStorageData(STORAGE_KEYS.MATCHES, filtered);
    return { code: 0, message: '删除成功' };
  },

  // 提交反馈到云端
  submitFeedback: async (feedback: any) => {
    try {
      const response = await fetch('https://3m2srsmnzb.coze.site/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitter: feedback.submitter,
          content: feedback.content,
          detail: feedback.detail || '',
        }),
      });
      
      if (response.ok) {
        return { code: 0, message: '提交成功，感谢您的反馈！' };
      }
      return { code: response.status, message: '提交失败，请稍后重试' };
    } catch (e) {
      return { code: 500, message: '网络错误，请检查网络连接' };
    }
  },

  // 获取统计数据
  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notifications = getStorageData(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    const activities = getStorageData(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    const matches = getStorageData(STORAGE_KEYS.MATCHES, DEFAULT_MATCHES);
    
    return {
      code: 0,
      data: {
        notifications: notifications.length,
        activities: activities.length,
        matches: matches.length,
      },
    };
  },
};
