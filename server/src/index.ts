import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const port = process.env.PORT || 9091;

// 允许的来源
const allowedOrigins = ['http://localhost:5000', 'http://localhost:3000', 'http://9.128.233.5', 'https://6d607e26-4db8-41a7-a02a-8f6184020334.dev.coze.site'];

// CORS配置
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.coze.site')) {
      callback(null, true);
    } else {
      callback(null, true); // 允许所有来源
    }
  },
  credentials: true
}));

app.use(express.json());

// ws包用于Supabase WebSocket支持
import ws from 'ws';

// Supabase客户端 - 使用环境变量
const supabaseUrl = process.env.COZE_SUPABASE_URL || 'https://br-ample-kagu-9cc543c6.supabase2.aidap-global.cn-beijing.volces.com';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: fetch as any },
  realtime: { transport: ws as any }
});

// 辅助函数：包装响应
const sendResponse = (res: Response, data: any, message?: string, code = 0) => {
  res.json({ code, data, message });
};

// 健康检查
app.get('/api/v1/health', (req, res) => {
  sendResponse(res, { status: 'ok', timestamp: new Date().toISOString() });
});

// ============ 通知接口 ============

// 获取所有通知
app.get('/api/v1/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    sendResponse(res, data || []);
  } catch (error: any) {
    console.error('获取通知失败:', error);
    sendResponse(res, [], error.message, 500);
  }
});

// 创建通知
app.post('/api/v1/notifications', async (req, res) => {
  try {
    const { title, content, type = 'general', priority = 'normal' } = req.body;
    
    if (!title || !content) {
      sendResponse(res, null, '标题和内容不能为空', 400);
      return;
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ title, content, type, priority }])
      .select()
      .single();
    
    if (error) throw error;
    sendResponse(res, data, '创建成功');
  } catch (error: any) {
    console.error('创建通知失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 更新通知
app.put('/api/v1/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority } = req.body;
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ title, content, type, priority })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    sendResponse(res, data, '更新成功');
  } catch (error: any) {
    console.error('更新通知失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 删除通知
app.delete('/api/v1/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    sendResponse(res, null, '删除成功');
  } catch (error: any) {
    console.error('删除通知失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// ============ 活动接口 ============

// 获取所有活动
app.get('/api/v1/activities', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    sendResponse(res, data || []);
  } catch (error: any) {
    console.error('获取活动失败:', error);
    sendResponse(res, [], error.message, 500);
  }
});

// 创建活动
app.post('/api/v1/activities', async (req, res) => {
  try {
    const { title, description, location, start_time, end_time, organizer, status = 'upcoming' } = req.body;
    
    if (!title || !start_time) {
      sendResponse(res, null, '标题和开始时间不能为空', 400);
      return;
    }
    
    const { data, error } = await supabase
      .from('activities')
      .insert([{ title, description, location, start_time, end_time, organizer, status }])
      .select()
      .single();
    
    if (error) throw error;
    sendResponse(res, data, '创建成功');
  } catch (error: any) {
    console.error('创建活动失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 更新活动
app.put('/api/v1/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, start_time, end_time, organizer, status } = req.body;
    
    const { data, error } = await supabase
      .from('activities')
      .update({ title, description, location, start_time, end_time, organizer, status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    sendResponse(res, data, '更新成功');
  } catch (error: any) {
    console.error('更新活动失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 删除活动
app.delete('/api/v1/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    sendResponse(res, null, '删除成功');
  } catch (error: any) {
    console.error('删除活动失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// ============ 赛程接口 ============

// 获取所有赛程
app.get('/api/v1/matches', async (req, res) => {
  try {
    const { league } = req.query;
    let query = supabase.from('matches').select('*').order('match_time', { ascending: true });
    
    if (league) {
      query = query.eq('league', league);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    sendResponse(res, data || []);
  } catch (error: any) {
    console.error('获取赛程失败:', error);
    sendResponse(res, [], error.message, 500);
  }
});

// 创建赛程
app.post('/api/v1/matches', async (req, res) => {
  try {
    const { league, home_team, away_team, match_time, venue, status = 'scheduled', home_score, away_score } = req.body;
    
    if (!league || !home_team || !away_team || !match_time) {
      sendResponse(res, null, '联赛、主队、客队和比赛时间不能为空', 400);
      return;
    }
    
    const { data, error } = await supabase
      .from('matches')
      .insert([{ league, home_team, away_team, match_time, venue, status, home_score, away_score }])
      .select()
      .single();
    
    if (error) throw error;
    sendResponse(res, data, '创建成功');
  } catch (error: any) {
    console.error('创建赛程失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 更新赛程
app.put('/api/v1/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { league, home_team, away_team, match_time, venue, status, home_score, away_score } = req.body;
    
    const { data, error } = await supabase
      .from('matches')
      .update({ league, home_team, away_team, match_time, venue, status, home_score, away_score })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    sendResponse(res, data, '更新成功');
  } catch (error: any) {
    console.error('更新赛程失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 删除赛程
app.delete('/api/v1/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    sendResponse(res, null, '删除成功');
  } catch (error: any) {
    console.error('删除赛程失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// ============ 认证接口 ============

// 简单的内存认证（生产环境应使用数据库）
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' }
];

let tokenStore: { [key: string]: any } = {};

app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    sendResponse(res, null, '用户名或密码错误', 401);
    return;
  }
  
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  tokenStore[token] = { ...user, password: undefined };
  
  sendResponse(res, { token, user: { ...user, password: undefined } }, '登录成功');
});

// ============ 反馈接口 ============

// 提交反馈（转发到云端）
app.post('/api/v1/feedbacks', async (req, res) => {
  try {
    const { submitter, content, detail, contact, type } = req.body;
    
    if (!submitter || !content) {
      sendResponse(res, null, '提交人和内容不能为空', 400);
      return;
    }
    
    // 保存到本地数据库
    const { data: localData, error: localError } = await supabase
      .from('feedbacks')
      .insert([{ submitter, content, detail: detail || '', contact: contact || '', type: type || 'suggestion', status: 'pending' }])
      .select()
      .single();
    
    // 转发到云端
    try {
      const cloudResponse = await fetch('https://3m2srsmnzb.coze.site/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitter, content, detail: detail || '' })
      });
      
      if (!cloudResponse.ok) {
        console.warn('云端反馈提交失败:', cloudResponse.status);
      }
    } catch (cloudError) {
      console.warn('云端反馈转发失败:', cloudError);
    }
    
    if (localError) throw localError;
    sendResponse(res, localData, '提交成功，感谢您的反馈！');
  } catch (error: any) {
    console.error('提交反馈失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 获取统计数据
app.get('/api/v1/stats', async (req, res) => {
  try {
    const [notifications, activities, matches] = await Promise.all([
      supabase.from('notifications').select('id', { count: 'exact', head: true }),
      supabase.from('activities').select('id', { count: 'exact', head: true }),
      supabase.from('matches').select('id', { count: 'exact', head: true })
    ]);
    
    sendResponse(res, {
      notifications: notifications.count || 0,
      activities: activities.count || 0,
      matches: matches.count || 0
    });
  } catch (error: any) {
    console.error('获取统计失败:', error);
    sendResponse(res, { notifications: 0, activities: 0, matches: 0 }, error.message, 500);
  }
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${port}`);
  console.log(`Supabase: ${supabaseUrl}`);
});

export default app;
