import express, { Router } from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 9091;

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
  // 足球赛程
  { id: 1, league: '校足球联赛', home_team: '计算机学院', away_team: '机械工程学院', home_score: null, away_score: null, match_time: '2024-12-16 15:00:00', venue: '北区足球场', status: 'scheduled' },
  { id: 2, league: '校足球联赛', home_team: '经济管理学院', away_team: '电气工程学院', home_score: null, away_score: null, match_time: '2024-12-16 17:00:00', venue: '南区足球场', status: 'scheduled' },
  { id: 3, league: '校足球联赛', home_team: '土木工程学院', away_team: '化学化工学院', home_score: null, away_score: null, match_time: '2024-12-17 15:00:00', venue: '北区足球场', status: 'scheduled' },
  { id: 4, league: '校足球联赛', home_team: '计算机学院', away_team: '材料科学学院', home_score: null, away_score: null, match_time: '2024-12-18 16:00:00', venue: '南区足球场', status: 'scheduled' },
  { id: 5, league: '校足球联赛', home_team: '机械工程学院', away_team: '土木工程学院', home_score: null, away_score: null, match_time: '2024-12-19 15:00:00', venue: '北区足球场', status: 'scheduled' },
  // 篮球赛程
  { id: 6, league: '校篮球联赛', home_team: '计算机学院', away_team: '经济管理学院', home_score: null, away_score: null, match_time: '2024-12-15 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
  { id: 7, league: '校篮球联赛', home_team: '电气工程学院', away_team: '土木工程学院', home_score: null, away_score: null, match_time: '2024-12-15 20:00:00', venue: '体育馆B馆', status: 'scheduled' },
  { id: 8, league: '校篮球联赛', home_team: '机械工程学院', away_team: '化学化工学院', home_score: null, away_score: null, match_time: '2024-12-17 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
  { id: 9, league: '校篮球联赛', home_team: '材料科学学院', away_team: '计算机学院', home_score: null, away_score: null, match_time: '2024-12-18 19:00:00', venue: '体育馆B馆', status: 'scheduled' },
  { id: 10, league: '校篮球联赛', home_team: '经济管理学院', away_team: '电气工程学院', home_score: null, away_score: null, match_time: '2024-12-20 18:00:00', venue: '体育馆A馆', status: 'scheduled' },
];

const feedbacks: Array<{ id: number; content: string; contact: string | null; type: string; status: string; created_at: string }> = [];

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ==================== 通知相关 API ====================
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

// ==================== 活动相关 API ====================
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

// ==================== 赛程相关 API ====================
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

// ==================== 反馈相关 API ====================
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
