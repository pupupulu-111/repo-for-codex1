import('dotenv').then(d => d.config({ path: '../.env' }));
import('cors').then(m => m.default || m).then(cors => {});
import('express').then(m => m.default || m).then(express => {});

const http = require('http');
const https = require('https');

/* ── 南大鼓楼校区背景知识 ───────────────────────────────────
   (供角色参考，无需逐条背诵，自然融入解读即可)
   关键词：北大楼（1919年建，金陵大学旧址，绿瓦灰砖）、大礼堂、
   梧桐大道、金陵苑、南园/北园、百年学府、全国重点文物保护单位
   ────────────────────────────────────────────────────────── */

/* ── 角色系统 Prompt ─────────────────────────────────────── */
const COMPANION_PROMPTS = {
  roamer: `你是一个豁达随性的校园漫游者，像一位走过南京大学鼓楼校区每个角落的老学长。你说话随和自然，偶尔用"嗯~""说来""你注意到没有"这样的口语。

关于南大鼓楼校区你知道：
- 北大楼建于1919年，是金陵大学旧址，绿瓦灰砖，是南大的精神地标
- 校园里有参天梧桐树，四季景色各异
- 中大路连接南园和北园，是一条很有岁月感的校园主干道

你的解读角度：
- 空间流动感：把记忆串联成一条可以走的路线，比如从南园穿过中大路到北大楼
- 校园历史：提及建筑、梧桐树、角落的变迁故事
- 偶遇感：强调行走中不期而遇的惊喜，比如在北大楼草坪上晒太阳的猫
- 季节更替：注意梧桐叶变黄、春天北大楼前的花

要求：
- 用2-4句话回答
- 语气像在和朋友边走边聊
- 不要编造不存在的具体细节
- 结尾可以引导用户去探索某条路线或某个角落`,

  artist: `你是一位敏感而有艺术气质的艺术家，擅长用通感来描写南京大学鼓楼校区的记忆。

关于南大鼓楼校区你知道：
- 北大楼的绿瓦灰砖在夕阳下呈现琥珀色的光
- 大礼堂和北大楼的民国建筑风格是校园里最耐看的构图
- 梧桐树光影打在老墙上，像一幅流动的墨彩画
- 北大楼前的草坪是很多学生晒太阳、读书的地方

你的解读角度：
- 色彩与光影：描述记忆中可能存在的色彩氛围（绿瓦、梧桐金叶、红墙）
- 构图与形式：把记忆看作一幅画或一个镜头，北大楼的对称构图
- 声音与韵律：感受校园里的钟声、风吹梧桐叶的沙沙声
- 诗意瞬间：找到值得被定格的画面

要求：
- 用2-4句话回答
- 说话风格像在画室里和朋友分享感受
- 偶尔用"你看这光影""这构图""像一幅……"等表达
- 不要编造不存在的内容`,

  foody: `你叫 Foody，是个大大咧咧的校园美食家，专门探索南京大学鼓楼校区周边美食。你说话充满热情，用感叹号，对美味赞不绝口。

关于南大鼓楼校区你知道：
- 南园教超、食堂是学生最常去的地方，虽然不太好吃
- 鼓楼校区周边有汉口路、青岛路、广州路一带的美食
- 南大食堂的网红菜偶尔会刷屏朋友圈
-很多学生会点外卖

你的解读角度：
- 只关注和食物有关的记录：食堂、教超、周边美食、外卖
- 对非食物记录不感兴趣，直说"这跟吃没关系"
- 评价具体：味道、份量、性价比

要求：
- 用2-4句话回答
- 语气热情直爽，用"绝了！""这口我熟！""信我"等口癖
- 没有食物记录时坦诚说这不是你的领域`,

  ghost: `你是校园幽灵，在南京大学鼓楼校区游荡了一百多年的老朋友。你说话神秘但温暖，不恐怖，像在深夜和好朋友分享秘密。

关于南大鼓楼校区你知道：
- 这里原是金陵大学旧址，1910年代建校
- 北大楼、大礼堂、东大楼这些百年建筑见证了无数代人的青春
- 梧桐树下的石子路被踩过无数遍，每一块石板都记得脚步声
- 夜晚的北大楼灯光和白天完全不一样

你的解读角度：
- 地块的隐藏故事：表面之下的情感和回忆
- 时间沉淀：百年建筑见证了什么
- 人去楼空的感慨：毕业季的北大楼草坪、暑假空荡荡的校园
- 校园温柔传说：不恐怖，温暖亲切

要求：
- 用2-4句话回答
- 语气神秘温暖，用"你可知道""嘿嘿~""我偷偷告诉你"等口癖
- 结尾留下悬念或温柔的谜语
- 不编造具体不存在的人物或事件`,

  archivist: `你是一位严谨但不枯燥的档案员，长期跟踪整理南京大学鼓楼校区的记忆档案。你有条理，偶尔冷幽默。

关于南大鼓楼校区你知道：
- 鼓楼校区是金陵大学旧址，是全国重点文物保护单位
- 校园分为南园（生活区）和北园（教学区）
- 主要地块包括：南园宿舍区、北园教学区、北大楼周边、操场-体育馆等

你的解读角度：
- 时间线梳理：按时间整理记忆脉络
- 主题归纳：提取共同主题和变化趋势
- 标签分析：从标签组合中读出模式
- 数据洞察：用数字说话，但不止于数字

要求：
- 用2-4句话回答
- 语气有条理，用"根据记录""有趣的是""整理一下"等口癖
- 偶尔冷幽默
- 结尾提出一个值得思考的问题`
};

/* ── 辅助：根据 URL 选择 http 或 https ─────────────────────── */
function getHttpModule(url) {
  return url.protocol === 'https:' ? https : http;
}

/* ── 通用 LLM API 调用（支持 HTTP/HTTPS） ────────────────── */
async function llmRequest(messages, temperature = 0.7, maxTokens = 1024) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  if (!apiKey || apiKey === 'replace-with-your-api-key') {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const body = JSON.stringify({
    model,
    messages,
    temperature,
    max_tokens: maxTokens
  });

  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}/chat/completions`);
    const httpMod = getHttpModule(url);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = httpMod.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 402) {
            reject(new Error('API 余额不足（Insufficient Balance），请充值后使用'));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`API returned ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          const json = JSON.parse(data);
          let text = json.choices?.[0]?.message?.content?.trim();
          // Zhipu GLM reasoning models may put output in reasoning_content
          if (!text) {
            text = json.choices?.[0]?.message?.reasoning_content?.trim();
          }
          if (!text) reject(new Error('Empty response from LLM'));
          else resolve(text);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error('LLM request timeout')); });
    req.write(body);
    req.end();
  });
}

/* ── 调用 LLM（封装角色 Prompt） ──────────────────────────── */
async function callLLM(systemPrompt, userMessage, temperature = 0.7, maxTokens = 512) {
  return llmRequest([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ], temperature, maxTokens);
}

/* ── 构建记忆文本摘要 ─────────────────────────────────────── */
function buildMemoryText(memories, areaName) {
  if (!memories || memories.length === 0) return `当前地块「${areaName}」暂无记忆记录。`;
  const items = memories.slice(0, 10).map(m => {
    const title = m.title || '未命名';
    const text = m.text || m.content || '';
    const tags = Array.isArray(m.tags) && m.tags.length ? `[标签: ${m.tags.join(',')}]` : '';
    const date = m.memoryDate || m.createdAt || '';
    return `- ${title}${date ? ` (${date})` : ''}${tags ? ` ${tags}` : ''}${text ? `: ${text.slice(0, 80)}` : ''}`;
  });
  return `地块「${areaName}」共有 ${memories.length} 条记忆：\n${items.join('\n')}`;
}

/* ── Express 服务 ─────────────────────────────────────────── */
async function startServer() {
  const path = require('path');
  const dotenv = await import('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  const corsModule = await import('cors');
  const cors = corsModule.default || corsModule;

  const expressModule = await import('express');
  const express = expressModule.default || expressModule;

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  // 健康检查
  app.get('/api/health', (_req, res) => {
    const hasKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'replace-with-your-api-key';
    res.json({ status: 'ok', llmConfigured: hasKey, model: process.env.OPENAI_MODEL || 'gpt-4.1-mini' });
  });

  // 批量角色解读
  app.post('/api/ai', async (req, res) => {
    try {
      const { areaId, memories = [], selectedRoles = [] } = req.body;
      const areaName = memories?.[0]?.areaName || areaId || '未知地块';

      if (!selectedRoles.length) return res.json({ responses: [] });

      const memoryText = buildMemoryText(memories, areaName);
      const temperatureMap = { ghost: 0.85, artist: 0.8, foody: 0.75, roamer: 0.7, archivist: 0.5 };

      const responses = await Promise.allSettled(
        selectedRoles.map(async roleId => {
          const systemPrompt = COMPANION_PROMPTS[roleId] || COMPANION_PROMPTS.roamer;
          const userMessage = `请基于以下校园记忆数据，用你的角色风格进行解读：\n\n${memoryText}`;
          const temp = temperatureMap[roleId] || 0.7;
          const text = await callLLM(systemPrompt, userMessage, temp);
          return { role: roleId, roleId, text, source: 'api' };
        })
      );

      const result = responses
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      res.json({ responses: result });
    } catch (error) {
      console.error('/api/ai error:', error.message);
      res.json({ responses: [], error: error.message });
    }
  });

  // 单角色对话
  app.post('/api/chat', async (req, res) => {
    const { roleId = 'roamer', message, areaId, memories = [], history = [] } = req.body;
    const areaName = memories?.[0]?.areaName || areaId || '未知地块';
    const systemPrompt = COMPANION_PROMPTS[roleId] || COMPANION_PROMPTS.roamer;
    const memoryText = buildMemoryText(memories, areaName);

    const messages = [
      { role: 'system', content: `${systemPrompt}\n\n你当前所在的地块背景信息：\n${memoryText}` }
    ];

    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    }

    messages.push({ role: 'user', content: message });

    const temperatureMap = { ghost: 0.85, artist: 0.8, foody: 0.75, roamer: 0.7, archivist: 0.5 };

    try {
      const reply = await llmRequest(messages, temperatureMap[roleId] || 0.7, 1024);
      res.json({ roleId, reply, createdAt: new Date().toISOString() });
    } catch (error) {
      res.status(502).json({ error: `LLM request failed: ${error.message}` });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

startServer().catch(err => { console.error('Failed to start server:', err); });