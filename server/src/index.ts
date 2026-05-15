import express, { Router } from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
const port = process.env.PORT || 9091;

// 简单的密钥用于JWT签名
const JWT_SECRET = process.env.JWT_SECRET || 'student-union-secret-key-2024';

// 内存数据存储
let notifications = [
  { id: 1, title: '关于举办2024年度学生代表大会的通知', content: '学校定于12月15日在学术报告厅举办2024年度学生代表大会，请各学院代表准时参加。', type: 'meeting', priority: 'high', published_at: new Date().toISOString() },
  { id: 2, title: '学生会招新面试安排', content: '本周三至周五将进行学生会各部门招新面试，请已报名同学提前做好准备。', type: 'recruit', priority: 'normal', published_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: '校园文明倡议书', content: '为营造良好的校园环境，学生会向全体同学发出文明倡议。', type: 'notice', priority: 'normal', published_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 4, title: '关于冬至包饺子活动的通知', content: '本周六下午3点在食堂三楼举办冬至包饺子活动，欢迎同学们踊跃参加！', type: 'activity', priority: 'high', published_at: new Date(Date.now() - 259200000).toISOString() },
];

let activities = [
  { id: 1, title: '校园歌手大赛', description: '一年一度的校园歌手大赛即将拉开帷幕，无论你是流行还是民谣，都能在这里绽放光芒！', location: '大学生活动中心', start_time: '2024-12-20 18:00:00', organizer: '文艺部', status: 'upcoming' },
  { id: 2, title: '公益支教志愿者招募', description: '加入我们，一起走进山区，为孩子们带去知识与温暖。本学期计划前往云南偏远山区支教两周。', location: '行政楼102', start_time: '2024-12-18 14:00:00', organizer: '志愿服务中心', status: 'upcoming' },
  { id: 3, title: '创业大赛报名开启', description: '第八届大学生创业大赛正式启动，丰厚奖金和创业资源等你来拿，最高可获10万元创业基金。', location: '创新创业学院', start_time: '2024-12-25 09:00:00', organizer: '创业实践部', status: 'upcoming' },
  { id: 4, title: '元旦晚会节目征集', description: '2024年元旦晚会节目征集开始了！舞蹈、小品、相声、乐器演奏...只要你敢秀，我们就给你舞台！', location: '学生会办公室', start_time: '2024-12-10 20:00:00', organizer: '文艺部', status: 'upcoming' },
];

let matches = [
  { id: 1, league: '校足球联赛', home_team: '计算机学院', away_team: '机械工程学院', home_score: null, away_score: null, match_time: '2024-12-16 15:00:00', venue: '北区足球场', status: 'scheduled' },
  { id: 2, league: '校足球联赛', home_team: '经济管理学院', away_team: '电气工程学院', home_score: null, away_score: null, match_time: '2024-12-16 17:00:00', venue: '南区足球场', status: 'scheduled' },
  { id: 3, league: '校足球联赛', home_team: '土木工程学院', away_team: '化学化工学院', home_score: null, away_score: null, match_time: '2024-12-17 15:00:00', venue: '北区足球场', status: 'scheduled' },
  { id: 4, league: '校足球联赛', home_team: '计算机学院', away_team: '材料科学学院', home_score: null, away_score: null, match_time: '2024-12-18 16:00:00', venue: '南区足球场', status: 'scheduled' },
  { id: 5, league: '校足球联赛', home_team: '机械工程学院', away_team: '土木工程学院', home_score: null, away_score: null, match_time: '2024-12-19 15:00:00', venue: '北区足球场', status: 'scheduled' },
  { id: 6, league: '校篮球联赛', home_team: '计算机学院', away_team: '经济管理学院', home_score: null, away_score: null, match_time: '2024-12-15 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
  { id: 7, league: '校篮球联赛', home_team: '电气工程学院', away_team: '土木工程学院', home_score: null, away_score: null, match_time: '2024-12-15 20:00:00', venue: '体育馆B馆', status: 'scheduled' },
  { id: 8, league: '校篮球联赛', home_team: '机械工程学院', away_team: '化学化工学院', home_score: null, away_score: null, match_time: '2024-12-17 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
  { id: 9, league: '校篮球联赛', home_team: '材料科学学院', away_team: '计算机学院', home_score: null, away_score: null, match_time: '2024-12-18 19:00:00', venue: '体育馆B馆', status: 'scheduled' },
  { id: 10, league: '校篮球联赛', home_team: '经济管理学院', away_team: '电气工程学院', home_score: null, away_score: null, match_time: '2024-12-20 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
];

const feedbacks: Array<{ id: number; content: string; contact: string | null; type: string; status: string; created_at: string }> = [];

// 管理员账户（实际项目中应存入数据库并加密）
const ADMIN_USER = {
  username: 'admin',
  // 密码: admin123 (SHA256加密)
  passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  name: '管理员',
  role: 'admin'
};

// 生成简单token
function generateToken(username: string): string {
  const payload = { username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 验证token
function verifyToken(token: string): { username: string; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// 简单认证中间件
function authMiddleware(req: any, res: any, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未授权，请先登录' });
  }
  const token = authHeader.slice(7);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
  req.user = user;
  next();
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==================== 认证 API ====================

// 登录
app.post('/api/v1/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    
    // 验证密码
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    if (username === ADMIN_USER.username && passwordHash === ADMIN_USER.passwordHash) {
      const token = generateToken(username);
      res.json({ 
        code: 0, 
        data: { 
          token, 
          user: { username: ADMIN_USER.username, name: ADMIN_USER.name, role: ADMIN_USER.role }
        }, 
        message: '登录成功' 
      });
    } else {
      res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }
  } catch (err) {
    res.status(500).json({ code: 500, message: '登录失败' });
  }
});

// 获取当前用户
app.get('/api/v1/auth/me', authMiddleware, (req: any, res) => {
  res.json({ 
    code: 0, 
    data: { username: req.user.username, name: ADMIN_USER.name, role: ADMIN_USER.role },
    message: 'success' 
  });
});

// ==================== 通知管理 API ====================

// 获取通知列表（公开）
app.get('/api/v1/notifications', (req, res) => {
  try {
    const sorted = [...notifications].sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
    res.json({ code: 0, data: sorted, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取通知失败' });
  }
});

// 创建通知（需认证）
app.post('/api/v1/notifications', authMiddleware, (req: any, res) => {
  try {
    const { title, content, type, priority } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    }
    
    const newNotification = {
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      title,
      content,
      type: type || 'notice',
      priority: priority || 'normal',
      published_at: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    res.json({ code: 0, data: newNotification, message: '创建成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建通知失败' });
  }
});

// 更新通知（需认证）
app.put('/api/v1/notifications/:id', authMiddleware, (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority } = req.body;
    
    const index = notifications.findIndex(n => n.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }
    
    notifications[index] = {
      ...notifications[index],
      title: title ?? notifications[index].title,
      content: content ?? notifications[index].content,
      type: type ?? notifications[index].type,
      priority: priority ?? notifications[index].priority,
    };
    
    res.json({ code: 0, data: notifications[index], message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新通知失败' });
  }
});

// 删除通知（需认证）
app.delete('/api/v1/notifications/:id', authMiddleware, (req: any, res) => {
  try {
    const { id } = req.params;
    const index = notifications.findIndex(n => n.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '通知不存在' });
    }
    
    notifications.splice(index, 1);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除通知失败' });
  }
});

// ==================== 活动管理 API ====================

app.get('/api/v1/activities', (req, res) => {
  try {
    const { status } = req.query;
    let result = [...activities].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    
    if (status) {
      result = result.filter(item => item.status === status);
    }
    
    res.json({ code: 0, data: result, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取活动列表失败' });
  }
});

app.get('/api/v1/activities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const activity = activities.find(item => item.id === parseInt(id));
    
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }
    
    res.json({ code: 0, data: activity, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取活动详情失败' });
  }
});

app.post('/api/v1/activities', authMiddleware, (req: any, res) => {
  try {
    const { title, description, location, start_time, organizer, status } = req.body;
    
    if (!title || !start_time) {
      return res.status(400).json({ code: 400, message: '标题和开始时间不能为空' });
    }
    
    const newActivity = {
      id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
      title,
      description: description || '',
      location: location || '',
      start_time,
      end_time: null,
      organizer: organizer || '',
      status: status || 'upcoming'
    };
    
    activities.push(newActivity);
    res.json({ code: 0, data: newActivity, message: '创建成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建活动失败' });
  }
});

app.put('/api/v1/activities/:id', authMiddleware, (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, start_time, organizer, status } = req.body;
    
    const index = activities.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }
    
    activities[index] = {
      ...activities[index],
      title: title ?? activities[index].title,
      description: description ?? activities[index].description,
      location: location ?? activities[index].location,
      start_time: start_time ?? activities[index].start_time,
      organizer: organizer ?? activities[index].organizer,
      status: status ?? activities[index].status,
    };
    
    res.json({ code: 0, data: activities[index], message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新活动失败' });
  }
});

app.delete('/api/v1/activities/:id', authMiddleware, (req: any, res) => {
  try {
    const { id } = req.params;
    const index = activities.findIndex(a => a.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '活动不存在' });
    }
    
    activities.splice(index, 1);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除活动失败' });
  }
});

// ==================== 赛程管理 API ====================

app.get('/api/v1/matches', (req, res) => {
  try {
    const { league } = req.query;
    let result = [...matches].sort((a, b) => 
      new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
    );
    
    if (league) {
      result = result.filter(item => item.league === league);
    }
    
    res.json({ code: 0, data: result, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取赛程失败' });
  }
});

app.get('/api/v1/matches/:id', (req, res) => {
  try {
    const { id } = req.params;
    const match = matches.find(item => item.id === parseInt(id));
    
    if (!match) {
      return res.status(404).json({ code: 404, message: '比赛不存在' });
    }
    
    res.json({ code: 0, data: match, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取比赛详情失败' });
  }
});

app.post('/api/v1/matches', authMiddleware, (req: any, res) => {
  try {
    const { league, home_team, away_team, match_time, venue } = req.body;
    
    if (!league || !home_team || !away_team || !match_time) {
      return res.status(400).json({ code: 400, message: '联赛、主队、客队和比赛时间不能为空' });
    }
    
    const newMatch = {
      id: matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1,
      league,
      home_team,
      away_team,
      home_score: null,
      away_score: null,
      match_time,
      venue: venue || '',
      status: 'scheduled'
    };
    
    matches.push(newMatch);
    res.json({ code: 0, data: newMatch, message: '创建成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '创建比赛失败' });
  }
});

app.put('/api/v1/matches/:id', authMiddleware, (req: any, res) => {
  try {
    const { id } = req.params;
    const { home_score, away_score, status, match_time, venue } = req.body;
    
    const index = matches.findIndex(m => m.id === parseInt(id));
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '比赛不存在' });
    }
    
    matches[index] = {
      ...matches[index],
      home_score: home_score ?? matches[index].home_score,
      away_score: away_score ?? matches[index].away_score,
      status: status ?? matches[index].status,
      match_time: match_time ?? matches[index].match_time,
      venue: venue ?? matches[index].venue,
    };
    
    res.json({ code: 0, data: matches[index], message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '更新比赛失败' });
  }
});

app.delete('/api/v1/matches/:id', authMiddleware, (req: any, res) => {
  try {
    const { id } = req.params;
    const index = matches.findIndex(m => m.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({ code: 404, message: '比赛不存在' });
    }
    
    matches.splice(index, 1);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除比赛失败' });
  }
});

// ==================== 反馈管理 API ====================

app.get('/api/v1/feedbacks', (req, res) => {
  try {
    const sorted = [...feedbacks].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    res.json({ code: 0, data: sorted, message: 'success' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '获取反馈列表失败' });
  }
});

app.post('/api/v1/feedbacks', (req, res) => {
  try {
    const { content, contact, type } = req.body;
    
    if (!content) {
      return res.status(400).json({ code: 400, message: '反馈内容不能为空' });
    }
    
    const newFeedback = {
      id: feedbacks.length + 1,
      content,
      contact: contact || null,
      type: type || 'suggestion',
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    feedbacks.push(newFeedback);
    res.json({ code: 0, data: newFeedback, message: '提交成功，感谢您的反馈！' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '提交反馈失败' });
  }
});

// ==================== 健康检查 ====================

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});

export default app;
