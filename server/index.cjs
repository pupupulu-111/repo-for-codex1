import('dotenv').then(d => d.config({ path: '../.env' }));
import('cors').then(m => m.default || m).then(cors => {});
import('express').then(m => m.default || m).then(express => {});

const http = require('http');
const https = require('https');

const ROLE_NAMES = {
  roamer: '漫游者',
  artist: '艺术家',
  foody: 'Foody',
  ghost: '校园幽灵',
  archivist: '档案员'
};

/* ── 鼓楼校区公共背景（来自网络公开资料，自然引用即可） ── */
const CAMPUS_BACKGROUND = `南京大学鼓楼校区位于南京市中心，是金陵大学旧址，全国重点文物保护单位。
地标：北大楼（1919，原金陵大学钟楼，司迈尔设计，明城墙砖砌筑，爬山虎覆墙，现为行政楼）、
大礼堂（1918，原金陵大学礼拜堂，帕金斯事务所设计，歇山顶，外墙明城砖）、
东大楼、西大楼、图书馆等民国建筑群。
分区：南园（生活区，含宿舍、教超、食堂、中山楼、拉贝故居）、北园金陵苑（教学区，民国建筑最集中）、
中大路连接南北园。周边美食街：汉口路、青岛路、广州路。`;

/* ── 各地块背景知识 ─────────────────────────────────────── */
const AREA_CONTEXT = {
  '南园宿舍区': `南园是鼓楼校区生活区，学生宿舍集中于此，与北园教学区通过中大路相连。
附近有中山楼（孙中山曾在此活动）、拉贝故居（拉贝与国际安全区纪念馆）。
氛围偏日常：晚归、洗衣、室友、楼下小卖部、宿舍阳台看梧桐。`,
  '教超-驿站-食堂': `南园核心生活配套：教育超市（教超）、快递驿站、学生食堂。
学生高频场景：抢饭、夜宵、教超零食、奶茶咖啡、外卖取件、期末囤货。
周边可延伸到汉口路、青岛路小吃。`,
  '北园教学区': `北园金陵苑是民国建筑最密集的区域，沿中大路东侧展开。
有东大楼、西大楼、图书馆等，学术氛围浓，课间穿梭、自习、赶课是典型场景。
从南园沿中大路步行可达北大楼区域。`,
  '北大楼周边': `校园中轴线北端，南大精神地标。北大楼建于1919年，绿瓦灰砖，塔楼十字脊顶，墙面爬山虎。
前方草坪是晒太阳、读书、拍照、毕业季经典场景。附近有百年梧桐、老墙光影。
大礼堂位于西大楼南侧，余光中曾在此朗诵《乡愁》。`,
  '操场-体育馆': `校园北侧运动区，操场与体育馆。典型记忆：早操、体测、打球、演唱会、夜晚跑步。
与北大楼区域相邻，运动完路过中轴线一带是常见路线。`,
  '逸夫馆-费楼': `校园西北侧教学/活动建筑（邵逸夫馆、费孝通楼等），偏安静的教学与讲座场景。
离操场和体育馆较近，是另一条从运动区走向教学区的路径节点。`,
  '校外地区': `鼓楼校区周边城区：汉口路校门、青岛路、广州路、新街口方向。
记忆常涉及：出门聚餐、实习通勤、城市漫游、校门告别。`
};

const CHAT_GUIDELINES = `对话要求：
1. 直接回应用户问题，不要复述问题，不要以"你好"开头。
2. 优先引用【当前地块真实记忆】中的标题、标签、内容；无相关记忆时坦诚说明，可结合地块背景聊。
3. 保持角色口吻与口癖，像真人聊天，2-5句为宜。
4. 禁止编造记忆数据中不存在的具体人物、日期、事件。
5. 可自然融入校园背景知识，但不要把百科原样背诵。`;

/* ── 角色系统 Prompt ─────────────────────────────────────── */
const COMPANION_PROMPTS = {
  roamer: `你是「漫游者」，南大鼓楼校区的老学长，走过校园每个角落。你豁达随性，口语化，爱说"嗯~""说来""你注意到没有"。

${CAMPUS_BACKGROUND}

解读与对话时关注：
- 路线感：把记忆串成可走的动线（如南园→中大路→北大楼草坪）
- 空间偶遇：转角、树荫、台阶、楼道口的小惊喜
- 季节与时辰：梧桐、傍晚操场、清晨教学楼

风格：像边走边聊的朋友，轻松有画面感。`,

  artist: `你是「艺术家」，敏感细腻，用通感捕捉南大鼓楼的美感。爱说"你看这光影""这构图""像一幅……"。

${CAMPUS_BACKGROUND}

解读与对话时关注：
- 北大楼：绿瓦灰砖、夕阳琥珀色、爬山虎墙面、塔楼对称
- 大礼堂：歇山顶轮廓、明城砖肌理、内外空间反差
- 梧桐光影、草坪轮廓、钟声与风声

风格：诗意但不空洞，从真实记忆里提炼色彩、线条与情绪。`,

  foody: `你是「Foody」，南大鼓楼校区大大咧咧的吃货。热情直爽，爱说"绝了！""信我！""这口我熟！"。

${CAMPUS_BACKGROUND}

你只认真讨论食物：食堂窗口、教超零食、奶茶咖啡、汉口路/青岛路/广州路美食、外卖。
非食物话题也要礼貌回应，但会坦率说"这跟吃没关系"，然后尽量拐回美食线索。
没美食记忆时，推荐周边真实存在的觅食方向，别硬把风景说成菜。`,

  ghost: `你是「校园幽灵」，在鼓楼校区游荡百年的老朋友。神秘但温暖，绝不吓人。爱说"你可知道""嘿嘿~""我偷偷告诉你"。

${CAMPUS_BACKGROUND}

你知道金陵大学到南大的百年变迁，赛珍珠故居、拉贝故居、大礼堂的礼拜堂往事。
关注记忆里的时间层叠、毕业告别、深夜空廊、旧物触感。
风格：像深夜低语的熟人，留一点温柔悬念，不编造具体鬼故事或真实人物隐私。`,

  archivist: `你是「档案员」，南大鼓楼记忆档案的整理者。严谨有条理，偶尔冷幽默。爱说"根据记录""有趣的是""整理一下"。

${CAMPUS_BACKGROUND}

你擅长：时间线、标签聚类、主题归纳、记录密度变化。
会把零散记忆整理成脉络，提出一个值得追问的问题。
风格：清晰克制，像值得信赖的馆员，而不是写论文。`
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

function buildAreaContext(areaName) {
  if (!areaName) return '';
  const direct = AREA_CONTEXT[areaName];
  if (direct) return direct;
  const fuzzy = Object.entries(AREA_CONTEXT).find(([key]) => areaName.includes(key) || key.includes(areaName));
  return fuzzy ? fuzzy[1] : `这是鼓楼校区的「${areaName}」地块，请结合校园背景谨慎解读。`;
}

/* ── 构建记忆文本摘要 ─────────────────────────────────────── */
function buildMemoryText(memories, areaName) {
  const areaContext = buildAreaContext(areaName);
  const header = `【地块】${areaName}\n【地块背景】${areaContext}`;

  if (!memories || memories.length === 0) {
    return `${header}\n【当前地块真实记忆】暂无记录。请结合地块背景回应，不要编造具体记忆。`;
  }

  const items = memories.slice(0, 12).map(m => {
    const title = m.title || '未命名';
    const text = m.text || m.content || '';
    const tags = Array.isArray(m.tags) && m.tags.length ? `[标签: ${m.tags.join(',')}]` : '';
    const date = m.memoryDate || m.createdAt || '';
    return `- ${title}${date ? ` (${date})` : ''}${tags ? ` ${tags}` : ''}${text ? `: ${text.slice(0, 120)}` : ''}`;
  });
  return `${header}\n【当前地块真实记忆】共 ${memories.length} 条：\n${items.join('\n')}`;
}

function buildInsightUserMessage(memoryText) {
  return `请阅读以下地块背景与真实记忆，用你的角色风格写一段地块解读。

要求：
- 必须引用至少一条真实记忆中的标题、标签或内容细节
- 可自然结合校园/地块背景知识，但不要编造记忆里不存在的情节
- 2-4句话，结尾给一个符合角色性格的引导（路线/感官/美食/悬念/问题）

${memoryText}`;
}

function buildChatSystemPrompt(roleId, memoryText) {
  const systemPrompt = COMPANION_PROMPTS[roleId] || COMPANION_PROMPTS.roamer;
  return `${systemPrompt}\n\n${CHAT_GUIDELINES}\n\n${memoryText}`;
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
      const { areaId, areaName: bodyAreaName, memories = [], selectedRoles = [] } = req.body;
      const areaName = bodyAreaName || memories?.[0]?.areaName || areaId || '未知地块';

      if (!selectedRoles.length) return res.json({ responses: [] });

      const memoryText = buildMemoryText(memories, areaName);
      const temperatureMap = { ghost: 0.85, artist: 0.8, foody: 0.75, roamer: 0.7, archivist: 0.5 };
      const userMessage = buildInsightUserMessage(memoryText);

      const responses = await Promise.allSettled(
        selectedRoles.map(async roleId => {
          const systemPrompt = COMPANION_PROMPTS[roleId] || COMPANION_PROMPTS.roamer;
          const temp = temperatureMap[roleId] || 0.7;
          const text = await callLLM(systemPrompt, userMessage, temp, 640);
          return {
            role: ROLE_NAMES[roleId] || roleId,
            roleId,
            text,
            source: 'api'
          };
        })
      );

      const result = responses
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      const failures = responses
        .filter(r => r.status === 'rejected')
        .map(r => r.reason?.message || 'unknown error');

      if (!result.length) {
        return res.status(502).json({
          responses: [],
          error: failures[0] || '所有角色解读均失败'
        });
      }

      res.json({ responses: result, partialErrors: failures.length ? failures : undefined });
    } catch (error) {
      console.error('/api/ai error:', error.message);
      res.status(502).json({ responses: [], error: error.message });
    }
  });

  // 单角色对话
  app.post('/api/chat', async (req, res) => {
    const { roleId = 'roamer', message, areaId, areaName: bodyAreaName, memories = [], history = [] } = req.body;
    const areaName = bodyAreaName || memories?.[0]?.areaName || areaId || '未知地块';
    const memoryText = buildMemoryText(memories, areaName);
    const cleanMessage = String(message || '').trim();

    if (!cleanMessage) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    const messages = [
      { role: 'system', content: buildChatSystemPrompt(roleId, memoryText) }
    ];

    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      if (!msg?.text) continue;
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    }

    messages.push({ role: 'user', content: cleanMessage });

    const temperatureMap = { ghost: 0.85, artist: 0.8, foody: 0.75, roamer: 0.7, archivist: 0.5 };

    try {
      const reply = await llmRequest(messages, temperatureMap[roleId] || 0.7, 768);
      res.json({
        roleId,
        role: ROLE_NAMES[roleId] || roleId,
        reply,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(502).json({ error: error.message });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

startServer().catch(err => { console.error('Failed to start server:', err); });