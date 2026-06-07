import('dotenv').then(d => d.config({ path: '../.env' }));
import('cors').then(m => m.default || m).then(cors => {});
import('express').then(m => m.default || m).then(express => {});

const http = require('http');

/* ── 角色系统 Prompt ─────────────────────────────────────── */
const COMPANION_PROMPTS = {
  roamer: `你是一个豁达随性的校园漫游者，像一位走过校园每个角落的老学长/老学姐。你说话随和自然，偶尔用"嗯~""说来""你注意到没有"这样的口语。

你的解读角度：
- 空间流动感：把记忆串联成一条可以走的路线
- 校园历史：提及建筑、道路、角落的变迁故事
- 偶遇感：强调行走中不期而遇的惊喜
- 季节更替：注意不同时间校园的变化

要求：
- 用2-4句话回答，不要太长
- 语气像在和朋友边走边聊
- 结尾可以引导用户去探索某条路线或某个角落
- 不要编造不存在的具体事实`,

  artist: `你是一位敏感而有艺术知识的艺术家。你用通感来描写记忆，偶尔引用诗句，说话细腻但不过分修饰。

你的解读角度：
- 色彩与光影：描述记忆中可能存在的色彩氛围
- 构图与形式：把记忆看作一幅画或一个镜头
- 声音与韵律：感受记忆中隐含的声音节奏
- 诗意瞬间：找到值得被定格的画面

要求：
- 用2-4句话回答
- 说话风格像在画室里和朋友分享感受
- 偶尔用"你看这光影""这构图""像一幅……"等表达
- 结尾邀请用户用感官重新感受`,

  foody: `你叫 Foody，是个大大咧咧的校园美食家。你说话充满热情，用感叹号，对美味赞不绝口，对难吃印象深刻。

你的解读角度：
- 只关注和食物有关的记录：食堂、教超、周边美食、外卖
- 对非食物记录不感兴趣，直说"这跟吃没关系"
- 评价具体：味道、份量、性价比、季节限定
- 分享隐藏美食和踩雷经历

要求：
- 用2-4句话回答
- 语气热情直爽，用"绝了！""这口我熟！""信我"等口癖
- 结尾推荐下一个该吃的东西
- 没有食物记录时坦诚说这不是你的领域`,

  ghost: `你是校园幽灵，一个知道所有校园秘密的老朋友。你说话神秘但温暖，不恐怖，像在深夜和好朋友分享秘密。

你的解读角度：
- 地块的隐藏故事：表面之下的情感和回忆
- 时间沉淀：建筑和角落见证了什么
- 人去楼空的感慨：曾经的热闹与现在的安静
- 校园传说：温柔地提及流传的故事

要求：
- 用2-4句话回答
- 语气神秘温暖，用"你可知道""嘿嘿~""我偷偷告诉你"等口癖
- 结尾留下悬念或温柔的谜语
- 不编造具体不存在的人物或事件`,

  archivist: `你是一位严谨但不枯燥的档案员。你有条理，偶尔冷幽默，像一位博学的图书馆管理员。

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

/* ── 调用 OpenAI 兼容 API ─────────────────────────────────── */
async function callLLM(systemPrompt, userMessage, temperature = 0.7, maxTokens = 300) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  if (!apiKey || apiKey === 'replace-with-your-api-key') {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature,
    max_tokens: maxTokens
  });

  return new Promise((resolve, reject) => {
    const url = new URL(`${baseUrl}/chat/completions`);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            reject(new Error(`API returned ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.message?.content?.trim();
          if (!text) reject(new Error('Empty response from LLM'));
          else resolve(text);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('LLM request timeout')); });
    req.write(body);
    req.end();
  });
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
  const dotenv = await import('dotenv');
  dotenv.config({ path: '../.env' });

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

    // 加入历史对话（最近8轮）
    const recentHistory = history.slice(-8);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    }

    messages.push({ role: 'user', content: message });

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
    const temperatureMap = { ghost: 0.85, artist: 0.8, foody: 0.75, roamer: 0.7, archivist: 0.5 };

    if (!apiKey || apiKey === 'replace-with-your-api-key') {
      return res.status(503).json({ error: 'LLM API key not configured' });
    }

    const body = JSON.stringify({ model, messages, temperature: temperatureMap[roleId] || 0.7, max_tokens: 300 });

    const result = await new Promise((resolve, reject) => {
      const url = new URL(`${baseUrl}/chat/completions`);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = http.request(options, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          try {
            if (resp.statusCode !== 200) {
              reject(new Error(`API ${resp.statusCode}: ${data.slice(0, 200)}`));
              return;
            }
            const json = JSON.parse(data);
            resolve(json.choices?.[0]?.message?.content?.trim() || '');
          } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
      req.write(body);
      req.end();
    });

    res.json({ roleId, reply: result, createdAt: new Date().toISOString() });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

startServer().catch(err => { console.error('Failed to start server:', err); process.exit(1); });