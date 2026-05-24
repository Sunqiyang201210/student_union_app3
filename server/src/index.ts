import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 9091;

// PostgreSQL连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 初始化数据库表
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        priority VARCHAR(20) DEFAULT 'normal',
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        cover_image VARCHAR(500),
        organizer VARCHAR(100),
        status VARCHAR(50) DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        league VARCHAR(100) NOT NULL,
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        match_time TIMESTAMP NOT NULL,
        venue VARCHAR(255),
        status VARCHAR(50) DEFAULT 'scheduled',
        home_score INTEGER,
        away_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        submitter VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        detail TEXT,
        contact VARCHAR(100),
        type VARCHAR(50) DEFAULT 'suggestion',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS push_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(500) UNIQUE NOT NULL,
        platform VARCHAR(20) DEFAULT 'android',
        device_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('数据库表初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  } finally {
    client.release();
  }
}

// 启动时初始化数据库
initDatabase();

// 允许的来源
const allowedOrigins = ['http://localhost:5000', 'http://localhost:3000', 'http://9.128.233.5', 'https://6d607e26-4db8-41a7-a02a-8f6184020334.dev.coze.site', '.railway.app'];

// CORS配置
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(null, true); // 允许所有来源
    }
  },
  credentials: true
}));

app.use(express.json());

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
    const result = await pool.query('SELECT * FROM notifications ORDER BY published_at DESC');
    sendResponse(res, result.rows);
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
    
    const result = await pool.query(
      'INSERT INTO notifications (title, content, type, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, type, priority]
    );
    sendResponse(res, result.rows[0], '创建成功');
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
    
    const result = await pool.query(
      'UPDATE notifications SET title = COALESCE($1, title), content = COALESCE($2, content), type = COALESCE($3, type), priority = COALESCE($4, priority) WHERE id = $5 RETURNING *',
      [title, content, type, priority, id]
    );
    
    if (result.rows.length === 0) {
      sendResponse(res, null, '通知不存在', 404);
      return;
    }
    sendResponse(res, result.rows[0], '更新成功');
  } catch (error: any) {
    console.error('更新通知失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 删除通知
app.delete('/api/v1/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      sendResponse(res, null, '通知不存在', 404);
      return;
    }
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
    const result = await pool.query('SELECT * FROM activities ORDER BY start_time DESC');
    sendResponse(res, result.rows);
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
    
    const result = await pool.query(
      'INSERT INTO activities (title, description, location, start_time, end_time, organizer, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, location, start_time, end_time, organizer, status]
    );
    sendResponse(res, result.rows[0], '创建成功');
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
    
    const result = await pool.query(
      'UPDATE activities SET title = COALESCE($1, title), description = COALESCE($2, description), location = COALESCE($3, location), start_time = COALESCE($4, start_time), end_time = COALESCE($5, end_time), organizer = COALESCE($6, organizer), status = COALESCE($7, status) WHERE id = $8 RETURNING *',
      [title, description, location, start_time, end_time, organizer, status, id]
    );
    
    if (result.rows.length === 0) {
      sendResponse(res, null, '活动不存在', 404);
      return;
    }
    sendResponse(res, result.rows[0], '更新成功');
  } catch (error: any) {
    console.error('更新活动失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 删除活动
app.delete('/api/v1/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      sendResponse(res, null, '活动不存在', 404);
      return;
    }
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
    let query = 'SELECT * FROM matches ORDER BY match_time ASC';
    let params: any[] = [];
    
    if (league) {
      query = 'SELECT * FROM matches WHERE league = $1 ORDER BY match_time ASC';
      params = [league];
    }
    
    const result = await pool.query(query, params);
    sendResponse(res, result.rows);
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
    
    const result = await pool.query(
      'INSERT INTO matches (league, home_team, away_team, match_time, venue, status, home_score, away_score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [league, home_team, away_team, match_time, venue, status, home_score, away_score]
    );
    sendResponse(res, result.rows[0], '创建成功');
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
    
    const result = await pool.query(
      'UPDATE matches SET league = COALESCE($1, league), home_team = COALESCE($2, home_team), away_team = COALESCE($3, away_team), match_time = COALESCE($4, match_time), venue = COALESCE($5, venue), status = COALESCE($6, status), home_score = COALESCE($7, home_score), away_score = COALESCE($8, away_score) WHERE id = $9 RETURNING *',
      [league, home_team, away_team, match_time, venue, status, home_score, away_score, id]
    );
    
    if (result.rows.length === 0) {
      sendResponse(res, null, '赛程不存在', 404);
      return;
    }
    sendResponse(res, result.rows[0], '更新成功');
  } catch (error: any) {
    console.error('更新赛程失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 删除赛程
app.delete('/api/v1/matches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM matches WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      sendResponse(res, null, '赛程不存在', 404);
      return;
    }
    sendResponse(res, null, '删除成功');
  } catch (error: any) {
    console.error('删除赛程失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// ============ 认证接口 ============

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

app.post('/api/v1/feedbacks', async (req, res) => {
  try {
    const { submitter, content, detail, contact, type } = req.body;
    
    if (!submitter || !content) {
      sendResponse(res, null, '提交人和内容不能为空', 400);
      return;
    }
    
    const result = await pool.query(
      'INSERT INTO feedbacks (submitter, content, detail, contact, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [submitter, content, detail || '', contact || '', type || 'suggestion']
    );
    
    // 转发到云端
    try {
      await fetch('https://3m2srsmnzb.coze.site/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitter, content, detail: detail || '' })
      });
    } catch (cloudError) {
      console.warn('云端反馈转发失败:', cloudError);
    }
    
    sendResponse(res, result.rows[0], '提交成功，感谢您的反馈！');
  } catch (error: any) {
    console.error('提交反馈失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 获取统计数据
app.get('/api/v1/stats', async (req, res) => {
  try {
    const [notifications, activities, matches] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM notifications'),
      pool.query('SELECT COUNT(*) as count FROM activities'),
      pool.query('SELECT COUNT(*) as count FROM matches')
    ]);
    
    sendResponse(res, {
      notifications: parseInt(notifications.rows[0].count),
      activities: parseInt(activities.rows[0].count),
      matches: parseInt(matches.rows[0].count)
    });
  } catch (error: any) {
    console.error('获取统计失败:', error);
    sendResponse(res, { notifications: 0, activities: 0, matches: 0 }, error.message, 500);
  }
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${port}`);
  console.log(`使用 Railway PostgreSQL 数据库`);
});

// ============ 推送通知接口 ============

// 注册设备推送token
app.post('/api/v1/push/register', async (req, res) => {
  try {
    const { token, platform = 'android', deviceName } = req.body;
    
    if (!token) {
      sendResponse(res, null, 'Token不能为空', 400);
      return;
    }
    
    // 插入或更新token
    await pool.query(
      `INSERT INTO push_tokens (token, platform, device_name, last_active) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (token) 
       DO UPDATE SET last_active = CURRENT_TIMESTAMP, device_name = $3`,
      [token, platform, deviceName || '']
    );
    
    sendResponse(res, { success: true }, '设备注册成功');
  } catch (error: any) {
    console.error('注册设备失败:', error);
    sendResponse(res, null, error.message, 500);
  }
});

// 发送推送通知给所有设备
async function sendPushNotification(title: string, body: string, data?: Record<string, any>) {
  try {
    // 获取所有token
    const result = await pool.query('SELECT token FROM push_tokens');
    const tokens = result.rows.map(row => row.token);
    
    if (tokens.length === 0) {
      console.log('没有注册的设备');
      return { success: true, sent: 0 };
    }
    
    // 发送推送通知
    const messages = tokens.map(token => ({
      to: token,
      title,
      body,
      data: data || {},
      sound: 'default',
    }));
    
    // Expo推送API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
    
    const result_data = await response.json();
    console.log('推送结果:', result_data);
    
    return { success: true, sent: tokens.length };
  } catch (error: any) {
    console.error('发送推送失败:', error);
    return { success: false, error: error.message };
  }
}

// 修改创建通知接口，添加推送功能
const originalCreateNotification = async (req: Request, res: Response) => {
  try {
    const { title, content, type = 'general', priority = 'normal' } = req.body;
    
    if (!title || !content) {
      sendResponse(res, null, '标题和内容不能为空', 400);
      return;
    }
    
    const result = await pool.query(
      'INSERT INTO notifications (title, content, type, priority) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, type, priority]
    );
    
    // 发送推送通知
    await sendPushNotification(title, content, { type: 'notification', id: result.rows[0].id });
    
    sendResponse(res, result.rows[0], '创建成功');
  } catch (error: any) {
    console.error('创建通知失败:', error);
    sendResponse(res, null, error.message, 500);
  }
};

// 覆盖原来的创建通知接口
app.post('/api/v1/notifications', async (req, res) => {
  await originalCreateNotification(req, res);
});

export default app;
