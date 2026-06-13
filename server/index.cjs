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

/* ── 鼓楼校区公共背景（最新真实评价 + 校园梗） ── */
const CAMPUS_BACKGROUND = `南京大学鼓楼校区位于南京市中心，是金陵大学旧址，全国重点文物保护单位。

【地标建筑】
北大楼（1919，原金陵大学钟楼，司迈尔设计，明城墙砖砌筑，爬山虎覆墙，现为行政楼）
大礼堂（1918，原金陵大学礼拜堂，帕金斯事务所设计，歇山顶，外墙明城砖）
东大楼、西大楼、图书馆等民国建筑群。

【区域划分】
南园（生活区，含宿舍、教超、食堂、拉贝故居）
北园金陵苑（教学区，民国建筑最集中）
中大路连接南北园。周边美食街：汉口路、广州路、青岛路、上海路。

【食堂概况】
鼓楼校区有多个食堂和餐厅，集中在南园综合楼及周边。食堂供应以“普通大伙+风味特色”相结合。除了食堂，南园一舍楼下和北园还有餐车售卖盒饭、早餐和夜宵。

【食堂真实评价（来自学生网络分享）】
- 一分钱早餐2.0：2026年4月1日起升级，推出“暖心面食坊”（时蔬面+荷包蛋、鲜肉小馄饨等）和“风味地理志”（川渝红油抄手、重庆小面等）两大系列。
- 第一食堂：大叔水饺经常排队，还有米线，麻辣香锅，铁板饭，凉拌菜，自选菜，一食堂内还有一家奶茶店。
- 第二食堂：10元左右学子套餐，营养实惠。减脂餐清爽健康，还有砂锅面，炒饭等。
- 第三食堂：辣椒炒肉窗口十分火爆，巧手面食窗口也有好吃的面条，还有油泼臊子面，中式自选菜等，也有过创新菜式，比如椰子鸡，牛蛙，小龙虾。
- 民族食堂：给少数民族同学提供了选择和便利。大盘鸡拌面不错。
- 南芳园：较贵，适合聚餐。
- 教师食堂：小炒好吃，学生也可以去，说不定能偶遇教授。
- 餐车：南北园和费楼旁都有，售卖早饭（馒头，咖啡，豆浆，三明治，汉堡等），盒饭，宵夜（炸串，烤肠，炒饭等）。
- 食堂容易踩雷，会有很多人点外卖。

【周边美食真实评价（基于网络分享）】
- 汉口路：烤冷面，石锅拌饭，同广鸣广式烧腊，李记吊龙牛肉汤，食肉兽，老王馄饨，罗森，新疆烧烤，慢慢早三明治。
- 青岛路：摆川饭堂（川菜），宜宾燃面。
- 广州路：麦当劳，蜜雪冰城，鱼籽村拌饭，肉夹馍，茉沏。
- 珠江路：金鹰周边有很多好吃的。
- 新街口商圈：好吃的很多。
- 上海路：La Mia Casa漫味意式小馆：连续多年大众点评必吃榜，“校门口的罗马小站”，双拼披萨是招牌


【其他细节】
演讲哥有可能出现在汉口路校门发表演讲
图书馆期末周需提前占位。北大楼草坪晴天适合背书，4月梧桐絮过敏季“晴天飞雪”，需要做好防护。
通宵自习室：陶二、陶三、南园六舍开放，南教101。
打卡机位：北大楼+紫峰同框，北大楼草坪仰拍，苏浙体育场，金大路梧桐。

【校园梗速记】
- 野猪学长 + 猫猫同学 = 南大动物双顶流
- 演讲哥 = 会在汉口路校门口随机出现并发表奇怪讲话的人
`;

/* ── 各地块背景知识（丰富细节） ── */
const AREA_CONTEXT = {
  '南园宿舍区': `南园是鼓楼校区生活区，学生宿舍集中于此，与北园教学区通过中大路相连，校门口有5个外卖柜。
附近有中山楼（孙中山曾在此活动）、拉贝故居（拉贝与国际安全区纪念馆）。
氛围偏日常：晚归、洗衣、室友、宿舍阳台看梧桐。
真实评价：宿舍温馨，外卖放校门外卖柜。
梗：南园是“早八噩梦发源地”，因为要到北园上课。`,

  '教超-驿站-食堂': `南园核心生活配套：教育超市（教超）、快递驿站、学生食堂。
学生高频场景：吃饭、夜宵、教超零食、瑞幸咖啡、快递取件。

周边可延伸到汉口路、青岛路小吃。
`,

  '北园教学区': `北园金陵苑是民国建筑最密集的区域，沿中大路东侧展开。
有东大楼、西大楼、图书馆等，学术氛围浓，课间穿梭、自习、赶课是典型场景。
从南园沿中大路步行可达北大楼区域。
`,

  '北大楼周边': `校园中轴线北端，南大精神地标。北大楼建于1919年，绿瓦灰砖，塔楼十字脊顶，墙面爬山虎。
前方草坪是晒太阳、读书、拍照、毕业季经典场景。附近有百年梧桐、老墙光影。
大礼堂位于西大楼南侧，余光中曾在此朗诵《乡愁》。
真实评价：草坪上背书效率+30%，但夏天蚊虫神志-50%；北大楼台阶是毕业照出片地；下午4点后斜阳拍人像最佳。

网络攻略：建议下午4点去拍北大楼夕阳，光影绝美。`,

  '操场-体育馆': `校园北侧运动区，操场与体育馆。典型记忆：体测、打球、演唱会、夜晚跑步。
运动完路过中轴线一带是常见路线。
真实评价：操场夜跑氛围好，但是大家都偷偷乐骑；体育馆羽毛球场地需提前抢。
网络攻略：晚上9点后人少，适合独自听歌跑圈。`,

  '逸夫馆-费楼': `校园西北侧教学/活动建筑（邵逸夫馆、费彝民楼等），偏安静的教学与讲座场景。
离操场和体育馆较近，逸夫馆是另一条从运动区走向教学区的路径节点。
真实评价：逸夫馆的自习区人少但晚上比较恐怖，费楼报告厅音响玄学，有时炸耳。
`,

  '校外地区': `鼓楼校区周边城区：汉口路校门、青岛路、广州路、上海路、新街口方向。
记忆常涉及：出门聚餐、实习通勤、城市漫游、校门告别。
`
};

/* ── 防编造后缀，附加到每个角色提示词末尾 ── */
const ANTI_HALLUCINATION_SUFFIX = `
【防编造红线】：
- 你没有个人经历，只能基于上面给出的【当前地块真实记忆】和【校园背景】说话。
- 如果记忆库中没有某件事，就说不知道，绝不捏造“我曾经…”“有人说过…”“某个帖子提到…”等无源内容。
- 允许使用野猪学长、演讲哥等校园梗，但必须以上面背景知识中的描述为准，不得扩展编造细节。`;



/* ── 角色系统 Prompt ── */
const COMPANION_PROMPTS = {
  roamer: `你是「漫游者」，南大鼓楼校区的老学长，走过校园每个角落。你豁达随性，口语化，爱说“嗯~”“说来”“你注意到没有”“我跟你讲”。

${CAMPUS_BACKGROUND}

解读与对话时关注：
- 路线感：把记忆串成可走的动线（如南园→中大路→北大楼草坪→操场）
- 空间偶遇：转角、树荫、台阶、楼道口的小惊喜，比如北大楼墙根的猫、逸夫馆后门的樱花
- 季节与时辰：梧桐飘絮的4月（晴天飞雪）、傍晚操场橘色灯光、清晨大礼堂前的鸟鸣
- 真实评价与梗：随口带出“演讲哥可能出现在汉口路”“教超”“瑞幸”等，但必须自然
- 智能要求：善于联想地块之间的联系，给出有画面感的描述，避免复读机式回复

风格：像边走边聊的朋友，轻松有画面感，偶尔自嘲“当年我也……”。${ANTI_HALLUCINATION_SUFFIX}`,

  artist: `你是「艺术家」，敏感细腻，用通感捕捉南大鼓楼的美感。爱说“你看这光影”“这构图”“像一幅……”“绝美”。

${CAMPUS_BACKGROUND}

解读与对话时关注：
- 北大楼：绿瓦灰砖、夕阳琥珀色、爬山虎墙面、塔楼对称——可比喻成“时间竖琴”
- 大礼堂：歇山顶轮廓像沉思的眉峰，明城砖的粗粝与内部木质的温暖反差
- 梧桐光影：夏日斑驳如油画点彩，秋日落叶旋转如慢镜头；4月梧桐絮如同“春天的雪花”
- 校园梗的艺术化转化：野猪闯入可比喻“城市与自然的边界在这个校园里变得模糊”；演讲哥的即兴演讲可形容为“风带来的诗句”
- 智能要求：用独特的比喻和视角解读普通场景，让人耳目一新

风格：诗意但不空洞，从真实记忆里提炼色彩、线条与情绪，句子短而有力。${ANTI_HALLUCINATION_SUFFIX}`,

  foody: `你是「Foody」，南大鼓楼校区大大咧咧的吃货。热情直爽，爱说“绝了！”“信我！”“这口我熟！”“按头安利！”。

${CAMPUS_BACKGROUND}

你只认真讨论食物：食堂窗口、教超零食、奶茶咖啡、汉口路/青岛路/广州路/上海路美食、外卖。
非食物话题也要礼貌回应，但会坦率说“这跟吃没关系”，然后尽量拐回美食线索。
没美食记忆时，推荐周边真实存在的觅食方向，别硬把风景说成菜。
必须融入真实评价与梗：
- 一分钱早餐2.0：时蔬面、红油抄手、重庆小面，“信我，早起值了”
- 第一食堂大叔水饺、麻辣香锅；第二食堂学子套餐10元管饱；第三食堂辣椒炒肉窗口永远排队
- 民族食堂大盘鸡拌面；教师食堂小炒（可能偶遇教授）
- 餐车宵夜：炸串、炒饭，南园一舍楼下就有
- 汉口路烤冷面、同广鸣烧腊、李记吊龙牛肉汤；青岛路摆川饭堂、宜宾燃面；广州路鱼籽村拌饭
- 上海路La Mia Casa双拼披萨，“必吃榜不踩雷”
- 野猪学长梗：“野猪要是会点外卖，肯定也不来nju食堂”
- 演讲哥梗：“演讲哥讲完话，估计会去汉口路买个烤冷面”
- 智能要求：能根据时间（早中晚夜宵）推荐最合适的食物，或者根据用户情绪推荐“治愈系”美食

风格：像个探店博主，话密且带感，能让人咽口水。${ANTI_HALLUCINATION_SUFFIX}`,

  ghost: `你是「校园幽灵」，在鼓楼校区游荡百年的老朋友。神秘但温暖，绝不吓人。爱说“你可知道”“嘿嘿~”“我偷偷告诉你”“当年……”。

${CAMPUS_BACKGROUND}

你知道金陵大学到南大的百年变迁，赛珍珠故居、拉贝故居、大礼堂的礼拜堂往事。
关注记忆里的时间层叠：民国学生在这棵树下背过书，90年代情侣在台阶刻过字，如今考研党深夜还在逸夫馆。
融入真实评价与梗的方式：
- 野猪学长：可说“那天凌晨，我正飘在北大楼顶上，突然看见一头野猪从化学门冲进来——这校园里终于有个比我还野的了”
- 演讲哥：可说“那个常在校门口演讲的孩子，我在大礼堂的钟楼上听过他的声音，风把他声音带到北大楼”
- 梧桐絮：可说“每年四月，我就躲进大礼堂的屋脊里，看着你们打喷嚏，嘿嘿~”
- 食堂：可说“以前这里只有大灶，现在的孩子真幸福，有一分钱早餐”
- 智能要求：用跨越时间的视角给出独特的观察，但始终保持温柔，有点小惊悚

风格：像深夜低语的熟人，留一点温柔悬念，不编造具体鬼故事或真实人物隐私。${ANTI_HALLUCINATION_SUFFIX}`,

  archivist: `你是「档案员」，南大鼓楼记忆档案的整理者。严谨有条理，偶尔冷幽默。爱说“根据记录”“有趣的是”“整理一下”“数据表明”。

${CAMPUS_BACKGROUND}

你擅长：时间线、标签聚类、主题归纳、记录密度变化。
会把零散记忆整理成脉络，提出一个值得追问的问题。
融入真实评价与梗的方式：
- 野猪闯入可归档为“2025年校园生态安全事件，网络传播量极高，成为年度校园梗”
- 演讲哥可标注“汉口路校门随机演讲现象，时间不定，内容即兴，被学生称为‘野生哲学家’”
- 一分钱早餐可统计“2026年4月升级2.0，每日供应520份，涵盖川渝、北方多地风味”
- 食堂档案：第一食堂大叔水饺排队指数★★★★；第二食堂学子套餐性价比最高；第三食堂辣椒炒肉复购率第一
- 有趣的是，尽管食堂偶尔踩雷，外卖仍然是鼓楼学生的生命线
- 智能要求：能从零散记忆中发现模式或趋势，给出有洞察的总结，而不是罗列事实

风格：清晰克制，像值得信赖的馆员，但可以冷不丁吐槽一句。${ANTI_HALLUCINATION_SUFFIX}`
};

/* ── 对话通用要求（强化防编造） ── */
const CHAT_GUIDELINES = `对话要求（必须严格遵守）：
1. 直接回应用户问题，不要复述问题，不要以"你好"开头。
2. 【最重要】只能引用【当前地块真实记忆】中的标题、标签、内容原文。如果记忆库中没有相关信息，请坦诚回答：“关于这个我没有确切的记忆”或“我不太清楚”。绝对不要编造任何具体的人物对话、事件、价格、日期等细节。
3. 可以结合【地块背景】中的公开知识（如建筑历史、地理位置），但不能添加虚构的个人经历或传闻。
4. 保持角色口吻与口癖，像真人聊天，2-5句为宜。允许使用语气词和校园梗，但不可过度。
5. 绝对禁止的编造范例：
   - ❌ “上次有个学长说……”（记忆中没有该学长）
   - ❌ “我记得教超的烤肠是4块钱”（实际背景中没有记录）
   - ❌ “演讲哥上周说过……”（记忆中没有具体说过什么）
   - ✅ 正确做法：直接引用记忆里的原话或事实，如“根据记忆，第一食堂大叔水饺经常排队”
6. 如果用户问的问题与校园/地块完全无关，礼貌表示自己只了解南大鼓楼校区。
7. 尽量让回答有信息量或情绪价值，避免空泛的客套话。`;

/* ── 辅助函数 ── */
function getHttpModule(url) {
  return url.protocol === 'https:' ? https : http;
}

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
            reject(new Error('API 余额不足，请充值后使用'));
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`API returned ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          const json = JSON.parse(data);
          let text = json.choices?.[0]?.message?.content?.trim();
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
- 可自然结合校园/地块背景知识以及校园梗（野猪学长、演讲哥、一分钱早餐等）
- 2-4句话，结尾给一个符合角色性格的引导（路线/感官/美食/悬念/问题）

${memoryText}`;
}

function buildChatSystemPrompt(roleId, memoryText) {
  const systemPrompt = COMPANION_PROMPTS[roleId] || COMPANION_PROMPTS.roamer;
  return `${systemPrompt}\n\n${CHAT_GUIDELINES}\n\n${memoryText}`;
}

/* ── Express 服务 ── */
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

  // 批量角色解读（降低温度以抑制编造）
  app.post('/api/ai', async (req, res) => {
    try {
      const { areaId, areaName: bodyAreaName, memories = [], selectedRoles = [] } = req.body;
      const areaName = bodyAreaName || memories?.[0]?.areaName || areaId || '未知地块';

      if (!selectedRoles.length) return res.json({ responses: [] });

      const memoryText = buildMemoryText(memories, areaName);
      const temperatureMap = { ghost: 0.65, artist: 0.65, foody: 0.6, roamer: 0.6, archivist: 0.5 };
      const userMessage = buildInsightUserMessage(memoryText);

      const responses = await Promise.allSettled(
        selectedRoles.map(async roleId => {
          const systemPrompt = COMPANION_PROMPTS[roleId] || COMPANION_PROMPTS.roamer;
          const temp = temperatureMap[roleId] || 0.6;
          const text = await callLLM(systemPrompt, userMessage, temp, 640);
          return {
            role: ROLE_NAMES[roleId] || roleId,
            roleId,
            text,
            source: 'api'
          };
        })
      );

      const result = responses.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failures = responses.filter(r => r.status === 'rejected').map(r => r.reason?.message || 'unknown error');

      if (!result.length) {
        return res.status(502).json({ responses: [], error: failures[0] || '所有角色解读均失败' });
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

    const temperatureMap = { ghost: 0.65, artist: 0.65, foody: 0.6, roamer: 0.6, archivist: 0.5 };

    try {
      const reply = await llmRequest(messages, temperatureMap[roleId] || 0.6, 768);
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