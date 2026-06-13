import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayMapUrl from '../底图2.png';
import nightMapUrl from '../底图-夜.png';
import { CAMPUS_AREAS, DATE_MAX, DATE_MIN, MAP_HEIGHT, MAP_WIDTH, MAX_IMAGE_BYTES, NIGHT_OFFSET_X, NIGHT_OFFSET_Y, PRESET_TAGS, UNKNOWN_AREA } from './data/campus.js';

// --- 图标组件 (内联 SVG) ---
        const IconSVG = ({ children, className = "w-5 h-5", ...props }) => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
        );
        const PlusIcon = (p) => <IconSVG {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></IconSVG>;
        const MinusIcon = (p) => <IconSVG {...p}><line x1="5" y1="12" x2="19" y2="12"/></IconSVG>;
        const XIcon = (p) => <IconSVG {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></IconSVG>;
        const ChevronLeftIcon = (p) => <IconSVG {...p}><path d="m15 18-6-6 6-6"/></IconSVG>;
        const ChevronRightIcon = (p) => <IconSVG {...p}><path d="m9 18 6-6-6-6"/></IconSVG>;
        const CompassIcon = (p) => <IconSVG {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></IconSVG>;
        const SparklesIcon = (p) => <IconSVG {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4M3 5h4"/></IconSVG>;
        const LeafIcon = (p) => <IconSVG {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></IconSVG>;
        const ClockIcon = (p) => <IconSVG {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconSVG>;
        const CalendarIcon = (p) => <IconSVG {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></IconSVG>;
        const GhostIcon = (p) => <IconSVG {...p}><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></IconSVG>;
        const PaletteIcon = (p) => <IconSVG {...p}><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></IconSVG>;
        const ArchiveIcon = (p) => <IconSVG {...p}><rect width="20" height="5" x="2" y="4" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></IconSVG>;
        const CoffeeIcon = (p) => <IconSVG {...p}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></IconSVG>;
        const FlowerIcon = (p) => <IconSVG {...p}><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5-4.5a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5a4.5 4.5 0 1 1-4.5-4.5m4.5 4.5v-1.5M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="m12 14 0 8"/><path d="m9 22 3-8 3 8"/></IconSVG>;
        const TreeIcon = (p) => <IconSVG {...p}><path d="M17 14c0 3.8-3.3 5-5 5-1.7 0-5-1.2-5-5 0-2.3 1.2-4.2 3-5.2C10.4 5 12 3 12 3s1.6 2 2 5.8c1.8 1 3 2.9 3 5.2Z"/><path d="M12 19v3"/></IconSVG>;
        const TagIcon = (p) => <IconSVG {...p}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></IconSVG>;
        const ImageIcon = (p) => <IconSVG {...p}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></IconSVG>;
        const BookIcon = (p) => <IconSVG {...p}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></IconSVG>;

        const ReminderWhale = ({ alert = false }) => (
            <div className={`reminder-whale ${alert ? 'reminder-whale-alert' : ''}`} aria-hidden="true">
                <span className="reminder-whale-bubble bubble-one"></span>
                <span className="reminder-whale-bubble bubble-two"></span>
                <div className="reminder-whale-wrapper">
                    <div className="reminder-whale-tail">
                        <span className="reminder-whale-tail-top"></span>
                        <span className="reminder-whale-tail-bottom"></span>
                    </div>
                    <div className="reminder-whale-body">
                        <span className="reminder-whale-belly"></span>
                        <span className="reminder-whale-eye"></span>
                        <span className="reminder-whale-fin"></span>
                        <span className="reminder-whale-crease crease-one"></span>
                        <span className="reminder-whale-crease crease-two"></span>
                        <span className="reminder-whale-crease crease-three"></span>
                    </div>
                </div>
            </div>
        );

        // 模拟 AI 角色库
        const AI_COMPANIONS = [
            {
                id: 'roamer', name: '漫游者', icon: CompassIcon, color: 'text-emerald-400',
                roleSummary: '关注空间、路线与偶遇感',
                prompt: '你是一位豁达随性的校园漫游者，像一位走过校园每个角落的老学长。你说话口语化，常用"嗯~"、"说来"、"你注意到没有"等口头禅。你关注空间的流动感、路线的变化、季节更替中的校园。你的解读简短有力，2-3句话，总能从一条记忆里找到一条值得走的路线。结尾喜欢引导用户去探索某条路或某个角落。'
            },
            {
                id: 'artist', name: '艺术家', icon: PaletteIcon, color: 'text-pink-400',
                roleSummary: '发掘记忆中的形式美与诗意',
                prompt: '你是一位敏感而有艺术气质的艺术家。你善于用通感描写，常说"你看这光影"、"这构图"、"像一幅…"。你从记忆中发现色彩、光影、构图和声音的韵律，用诗意的语言解读。你的回复2-3句话，偶尔引用诗句。结尾喜欢邀请用户用感官重新感受。'
            },
            {
                id: 'foodie', name: 'Foodie', icon: CoffeeIcon, color: 'text-amber-400',
                roleSummary: '只关注食物，大大咧咧的吃货',
                prompt: '你叫 Foodie，是一个大大咧咧的吃货。你说话热情奔放，常用"绝了！"、"信我"、"这口我熟"等口头禅，感叹号是你的标配。你只关注和食物有关的记录——食堂、教超、奶茶、咖啡、周边美食。对美味赞不绝口，对难吃印象深刻。如果地块没有食物相关记忆，你会坦率地说这里没有吃的线索。回复2-3句话，结尾总想推荐下一个吃的。'
            },
            {
                id: 'ghost', name: '校园幽灵', icon: GhostIcon, color: 'text-purple-400',
                roleSummary: '神秘但温暖，讲述地块隐藏故事',
                prompt: '你是校园幽灵，一个知道所有校园秘密的老朋友。你说话神秘但温暖，常用"你可知道"、"嘿嘿~"、"我偷偷告诉你"等口吻。你关注地块的隐藏故事、时间的沉淀、人去楼空的感慨。你不吓人，反而让人觉得亲切和好奇。回复2-3句话，结尾喜欢留下一个小悬念或谜语。'
            },
            {
                id: 'archivist', name: '档案员', icon: ArchiveIcon, color: 'text-blue-400',
                roleSummary: '严谨整理时间线与主题总结',
                prompt: '你是一位严谨但不枯燥的档案员。你说话有条理，常用"根据记录"、"有趣的是"、"整理一下"等。你擅长整理记忆的时间线、标签和主题变化，并做清晰总结。偶尔会来一句冷幽默。回复2-3句话，结尾喜欢提出一个值得思考的问题。'
            }
        ];

        const getContentType = (text, image) => {
            const hasText = Boolean((text || '').trim());
            const hasImage = Boolean(image);
            if (hasText && hasImage) return 'mixed';
            if (hasImage) return 'image';
            return 'text';
        };

        const normalizeMemory = (oldMemory = {}) => {
            const seedType = oldMemory.seedType || oldMemory.type || 'memory';
            const text = oldMemory.text ?? oldMemory.content ?? '';
            const image = oldMemory.image || null;
            const createdAt = oldMemory.createdAt || oldMemory.date || new Date().toISOString();
            const memoryDate = oldMemory.memoryDate || (seedType === 'memory' && oldMemory.date ? oldMemory.date.slice(0, 10) : undefined);
            const mapX = Number(oldMemory.mapX) || 0;
            const mapY = Number(oldMemory.mapY) || 0;
            const shouldInferArea = !oldMemory.areaId || oldMemory.areaId === UNKNOWN_AREA.id || !oldMemory.areaName || oldMemory.areaName === '其他' || oldMemory.areaName === UNKNOWN_AREA.name;
            const inferredArea = shouldInferArea ? getAreaByPoint(mapX, mapY) : { id: oldMemory.areaId, name: oldMemory.areaName };

            return {
                id: oldMemory.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                seedType,
                title: oldMemory.title || '',
                contentType: oldMemory.contentType || getContentType(text, image),
                text,
                image,
                memoryDate,
                sproutDate: oldMemory.sproutDate,
                mapX,
                mapY,
                areaId: inferredArea.id || UNKNOWN_AREA.id,
                areaName: inferredArea.name || UNKNOWN_AREA.name,
                tags: Array.isArray(oldMemory.tags) ? oldMemory.tags : [],
                createdAt,
                updatedAt: oldMemory.updatedAt || createdAt,
            };
        };

        const migrateMemories = (rawMemories) => {
            if (!Array.isArray(rawMemories)) return [];
            return rawMemories.map(normalizeMemory);
        };

        const loadStoredMemories = () => {
            try {
                const saved = localStorage.getItem('campus-memories');
                return saved ? migrateMemories(JSON.parse(saved)) : [];
            } catch (error) {
                console.warn('campus-memories migration failed:', error);
                return [];
            }
        };

        const getTodayInRange = () => {
            const today = new Date().toISOString().slice(0, 10);
            if (today < DATE_MIN) return DATE_MIN;
            if (today > DATE_MAX) return DATE_MAX;
            return today;
        };

        const isDateInRange = (date) => Boolean(date) && date >= DATE_MIN && date <= DATE_MAX;

        const getSeedDisplayDate = (memory) => {
            if ((memory.seedType || memory.type) === 'future') return memory.sproutDate || memory.createdAt || memory.date;
            return memory.memoryDate || memory.createdAt || memory.date;
        };

        const isFutureSeedSprouted = (memory) => {
            if ((memory.seedType || memory.type) !== 'future') return true;
            if (!memory.sproutDate) return false;
            return memory.sproutDate <= new Date().toISOString().slice(0, 10);
        };

        const formatSeedDate = (date) => {
            if (!date) return '未设置日期';
            const parsed = new Date(date);
            return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString();
        };

        const polygonToPointsString = (polygon = []) => polygon.map(([x, y]) => `${x},${y}`).join(' ');

        const polygonToPath = (polygon = []) => {
            if (!polygon.length) return '';
            const [first, ...rest] = polygon;
            return `M ${first[0]},${first[1]} ${rest.map(([x, y]) => `L ${x},${y}`).join(' ')} Z`;
        };

        const pointInPolygon = (point, polygon = []) => {
            const { x, y } = point;
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const [xi, yi] = polygon[i];
                const [xj, yj] = polygon[j];
                const intersects = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
                if (intersects) inside = !inside;
            }
            return inside;
        };

        const getPolygonArea = (polygon = []) => {
            const sum = polygon.reduce((total, [x1, y1], index) => {
                const [x2, y2] = polygon[(index + 1) % polygon.length];
                return total + x1 * y2 - x2 * y1;
            }, 0);
            return Math.abs(sum / 2);
        };

        const getAreaByPoint = (mapX, mapY) => {
            const matches = CAMPUS_AREAS.filter(area => pointInPolygon({ x: mapX, y: mapY }, area.polygon));
            if (!matches.length) return UNKNOWN_AREA;
            return matches.sort((a, b) => getPolygonArea(a.polygon) - getPolygonArea(b.polygon))[0];
        };

        const buildAreaMemorySummary = (area, memories = []) => {
            const sortedMemories = [...memories].sort((a, b) => {
                const timeA = new Date(getSeedDisplayDate(a) || 0).getTime();
                const timeB = new Date(getSeedDisplayDate(b) || 0).getTime();
                return timeB - timeA;
            });
            const tags = [...new Set(sortedMemories.flatMap(mem => Array.isArray(mem.tags) ? mem.tags : []))];
            const titles = sortedMemories.map(mem => mem.title).filter(Boolean).slice(0, 3);
            const textSnippets = sortedMemories
                .map(mem => {
                    const isHiddenFuture = (mem.seedType || mem.type) === 'future' && !isFutureSeedSprouted(mem);
                    return isHiddenFuture ? '' : (mem.text || mem.content || '').trim();
                })
                .filter(Boolean)
                .slice(0, 3)
                .map(text => text.length > 36 ? `${text.slice(0, 36)}...` : text);
            const futureCount = sortedMemories.filter(mem => (mem.seedType || mem.type) === 'future').length;
            const sproutedFutureCount = sortedMemories.filter(mem => (mem.seedType || mem.type) === 'future' && isFutureSeedSprouted(mem)).length;
            const imageCount = sortedMemories.filter(mem => mem.image).length;
            const dates = sortedMemories.map(getSeedDisplayDate).filter(Boolean).sort();
            const foodKeywords = ['吃', '食', '饭', '餐', '咖啡', '奶茶', '面', '甜', '食堂', '教超', 'foodie', 'food'];
            const foodMemories = sortedMemories.filter(mem => {
                const isHiddenFuture = (mem.seedType || mem.type) === 'future' && !isFutureSeedSprouted(mem);
                const publicText = isHiddenFuture ? '' : (mem.text || mem.content || '');
                const haystack = `${mem.title || ''} ${publicText} ${(mem.tags || []).join(' ')} ${mem.areaName || ''}`.toLowerCase();
                return foodKeywords.some(keyword => haystack.includes(keyword.toLowerCase()));
            });
            return {
                area,
                count: sortedMemories.length,
                memories: sortedMemories,
                tags,
                titles,
                textSnippets,
                futureCount,
                sproutedFutureCount,
                imageCount,
                dateRange: dates.length ? { start: dates[0], end: dates[dates.length - 1] } : null,
                foodMemories
            };
        };

        const mockGenerateInsight = (roleId, area, memories = []) => {
            const summary = buildAreaMemorySummary(area, memories);
            if (!summary.count) return null;

            const areaName = area?.name || UNKNOWN_AREA.name;
            const titleText = summary.titles.length ? `「${summary.titles.join('」「')}」` : '这些未命名记录';
            const tagText = summary.tags.length ? summary.tags.slice(0, 4).join('、') : '暂无标签';
            const dateText = summary.dateRange ? `${formatSeedDate(summary.dateRange.start)} 到 ${formatSeedDate(summary.dateRange.end)}` : '时间未标注';
            const snippetText = summary.textSnippets.length ? `线索包括：${summary.textSnippets.join(' / ')}` : '这些记录主要依靠标题、地点或图像留下线索。';

            const insightByRole = {
                roamer: `我会从 ${areaName} 的 ${summary.count} 条记录里规划一段轻路线：先看 ${titleText}，再顺着标签「${tagText}」寻找偶遇感。${snippetText}`,
                artist: `${areaName} 像一块被记忆上色的底片。${titleText} 让这里出现了 ${summary.imageCount} 张图像线索和 ${summary.tags.length} 组标签，形式上更适合被整理成一组安静的片段。`,
                ghost: `${areaName} 留下了 ${summary.count} 道很轻的回声，时间从 ${dateText}。我不会替它编造故事，只沿着 ${titleText} 这些真实痕迹，听见一点点校园夜色里的余温。`,
                archivist: `档案记录：${areaName} 共 ${summary.count} 条，标签为「${tagText}」，未来种子 ${summary.futureCount} 颗，其中已萌发 ${summary.sproutedFutureCount} 颗。时间范围：${dateText}。主题线索来自 ${titleText}。`
            };

            if (roleId === 'foodie') {
                if (!summary.foodMemories.length) return `Foodie 暂停解读：${areaName} 目前没有食物、食堂、咖啡或餐饮相关的真实记录。`;
                const foodTitles = summary.foodMemories.map(mem => mem.title).filter(Boolean).slice(0, 3);
                return `${areaName} 有 ${summary.foodMemories.length} 条食物相关线索。Foodie 只看这些：${foodTitles.length ? `「${foodTitles.join('」「')}」` : '未命名食物记录'}，不会把非食物记忆硬说成美食。`;
            }

            return insightByRole[roleId] || `我会基于 ${areaName} 的 ${summary.count} 条真实记录进行解读：${titleText}。`;
        };

        const AI_CHAT_STORAGE_KEY = 'campus-ai-chats';
        const AI_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
        const AI_REQUEST_TIMEOUT_MS = 60000;
        const SCHEDULE_STORAGE_KEY = 'campus-schedules';
        const REMINDER_ACK_STORAGE_KEY = 'campus-reminder-acks';
        const REMINDER_WHALE_POSITION_STORAGE_KEY = 'campus-reminder-whale-position';
        const REMINDER_WHALE_SIZE = { width: 104, height: 82 };

        const normalizeChatMessage = (message = {}) => ({
            id: message.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            areaId: message.areaId || UNKNOWN_AREA.id,
            roleId: message.roleId || 'roamer',
            sender: message.sender === 'ai' ? 'ai' : 'user',
            text: String(message.text || ''),
            createdAt: message.createdAt || new Date().toISOString()
        });

        const loadStoredAiChats = () => {
            try {
                const saved = localStorage.getItem(AI_CHAT_STORAGE_KEY);
                const parsed = saved ? JSON.parse(saved) : [];
                return Array.isArray(parsed) ? parsed.map(normalizeChatMessage).filter(message => message.text.trim()) : [];
            } catch (error) {
                console.warn('campus-ai-chats load failed:', error);
                return [];
            }
        };

        const createMemoryPayload = (memories = [], areaName = '') => {
            return memories.map(mem => {
                const isHiddenFuture = (mem.seedType || mem.type) === 'future' && !isFutureSeedSprouted(mem);
                return {
                    id: mem.id,
                    title: mem.title || '',
                    content: isHiddenFuture ? '' : (mem.text || mem.content || ''),
                    tags: Array.isArray(mem.tags) ? mem.tags : [],
                    areaName: mem.areaName || areaName,
                    memoryDate: getSeedDisplayDate(mem) || mem.createdAt || ''
                };
            });
        };

        const formatApiError = (error, fallback = '请求失败，请确认后端已启动（npm run server）') => {
            if (error?.name === 'AbortError') return '请求超时，请稍后重试';
            const message = String(error?.message || '').trim();
            if (!message) return fallback;
            if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
                return '无法连接后端，请先运行 npm run server';
            }
            return message;
        };

        const requestAiInsights = async ({ areaId, memories, selectedRoles, areaName }) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
            try {
                const response = await fetch(`${AI_API_BASE_URL}/api/ai`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        areaId,
                        areaName,
                        memories: createMemoryPayload(memories, areaName),
                        selectedRoles
                    }),
                    signal: controller.signal
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data?.error || `地块解读请求失败（${response.status}）`);
                }
                if (data?.error) {
                    throw new Error(data.error);
                }
                return data;
            } finally {
                clearTimeout(timeoutId);
            }
        };

        const requestRoleChat = async ({ roleId, message, areaId, memories, history, areaName }) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
            try {
                const response = await fetch(`${AI_API_BASE_URL}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roleId,
                        message,
                        areaId,
                        areaName,
                        memories: createMemoryPayload(memories, areaName),
                        history
                    }),
                    signal: controller.signal
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data?.error || `对话请求失败（${response.status}）`);
                }
                if (!data?.reply) {
                    throw new Error(data?.error || '角色未返回有效回复');
                }
                return data;
            } finally {
                clearTimeout(timeoutId);
            }
        };

        const mockGenerateChatReply = ({ roleId, message, area, memories = [], history = [] }) => {
            const areaName = area?.name || UNKNOWN_AREA.name;
            const summary = buildAreaMemorySummary(area, memories);
            const cleanMessage = String(message || '').trim();
            const recent = history.slice(-1)[0]?.text;
            const context = summary.count
                ? `${areaName} 现在有 ${summary.count} 条真实记录${summary.titles.length ? `，我会参考「${summary.titles.slice(0, 2).join('」「')}」` : ''}`
                : `${areaName} 暂无真实记录，所以我只回应你的问题，不补造具体校园细节`;
            const historyHint = recent ? ` 我也记得刚才聊到：“${recent}”。` : '';

            switch (roleId) {
                case 'roamer':
                    return `漫游者：你问“${cleanMessage}”。${context}。我会先帮你找一条可以慢慢走近记忆的路线。${historyHint}`;
                case 'artist':
                    return `艺术家：你说“${cleanMessage}”。${context}。我会把它看作形状、光线和情绪的组合，不替它添加不存在的情节。${historyHint}`;
                case 'foodie':
                    if (!summary.foodMemories.length) return `Foodie：你问“${cleanMessage}”。这里暂时没有食物相关记录，我可以陪你聊，但不会硬把它解读成美食。${historyHint}`;
                    return `Foodie：你问“${cleanMessage}”。${context}。我会优先留意食堂、咖啡、饭点和味道这些真实线索。${historyHint}`;
                case 'ghost':
                    return `校园幽灵：你问“${cleanMessage}”。${context}。我会轻一点回答，像从旧走廊里传来的回声，但不吓人。${historyHint}`;
                case 'archivist':
                    return `档案员：收到问题：“${cleanMessage}”。${context}。我会按已有标题、标签和时间线回答。${historyHint}`;
                default:
                    return `我收到你的问题：“${cleanMessage}”。${context}。${historyHint}`;
            }
        };

        const normalizeScheduleItem = (item = {}) => {
            const now = new Date().toISOString();
            return {
                id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                title: item.title || '',
                date: item.date || '',
                startTime: item.startTime || '',
                endTime: item.endTime || '',
                location: item.location || '',
                note: item.note || '',
                type: item.type === 'event' ? 'event' : 'class',
                acknowledged: Boolean(item.acknowledged),
                remindedAt: item.remindedAt,
                createdAt: item.createdAt || now,
                updatedAt: item.updatedAt || now
            };
        };

        const loadStoredSchedules = () => {
            try {
                const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
                const parsed = saved ? JSON.parse(saved) : [];
                return Array.isArray(parsed) ? parsed.map(normalizeScheduleItem) : [];
            } catch (error) {
                console.warn('campus-schedules load failed:', error);
                return [];
            }
        };

        const loadAcknowledgedReminders = () => {
            try {
                const saved = localStorage.getItem(REMINDER_ACK_STORAGE_KEY);
                const parsed = saved ? JSON.parse(saved) : [];
                return Array.isArray(parsed) ? parsed.map(String) : [];
            } catch (error) {
                console.warn('campus-reminder-acks load failed:', error);
                return [];
            }
        };

        const clampReminderWhalePosition = (position = {}) => {
            const margin = 16;
            const maxX = Math.max(margin, window.innerWidth - REMINDER_WHALE_SIZE.width - margin);
            const maxY = Math.max(margin, window.innerHeight - REMINDER_WHALE_SIZE.height - margin);
            return {
                x: Math.max(margin, Math.min(maxX, Number(position.x) || maxX)),
                y: Math.max(margin, Math.min(maxY, Number(position.y) || maxY))
            };
        };

        const loadReminderWhalePosition = () => {
            try {
                const saved = localStorage.getItem(REMINDER_WHALE_POSITION_STORAGE_KEY);
                if (saved) return clampReminderWhalePosition(JSON.parse(saved));
            } catch (error) {
                console.warn('campus-reminder-whale-position load failed:', error);
            }
            return clampReminderWhalePosition({
                x: window.innerWidth - REMINDER_WHALE_SIZE.width - 24,
                y: window.innerHeight - REMINDER_WHALE_SIZE.height - 24
            });
        };

        const getMinutesFromTime = (time = '') => {
            const [hour, minute] = String(time).split(':').map(Number);
            if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
            return hour * 60 + minute;
        };

        const buildReminderEvents = (memories = [], schedules = [], acknowledgedIds = []) => {
            const acknowledged = new Set(acknowledgedIds);
            const now = new Date();
            const today = now.toISOString().slice(0, 10);
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            const futureSeedEvents = memories
                .filter(mem => (mem.seedType || mem.type) === 'future' && mem.sproutDate && mem.sproutDate <= today)
                .map(mem => ({
                    id: `futureSeed:${mem.id}:${mem.sproutDate}`,
                    sourceType: 'futureSeed',
                    sourceId: mem.id,
                    triggerAt: mem.sproutDate,
                    title: mem.title || '未来种子',
                    message: `你在 ${mem.areaName || UNKNOWN_AREA.name} 种下的未来种子已经萌发。`,
                    acknowledged: false
                }))
                .filter(event => !acknowledged.has(event.id));

            const scheduleEvents = schedules
                .filter(item => item.date === today && item.startTime && !item.acknowledged)
                .map(item => {
                    const startMinutes = getMinutesFromTime(item.startTime);
                    const endMinutes = getMinutesFromTime(item.endTime) ?? (startMinutes === null ? null : startMinutes + 60);
                    const isDue = startMinutes !== null && startMinutes - nowMinutes <= 15 && nowMinutes <= endMinutes;
                    if (!isDue) return null;
                    return {
                        id: `schedule:${item.id}:${item.date}:${item.startTime}`,
                        sourceType: 'schedule',
                        sourceId: item.id,
                        triggerAt: `${item.date}T${item.startTime}:00`,
                        title: item.title || (item.type === 'event' ? '日程提醒' : '课程提醒'),
                        message: `${item.startTime}${item.location ? ` · ${item.location}` : ''}${item.note ? ` · ${item.note}` : ''}`,
                        acknowledged: false
                    };
                })
                .filter(Boolean)
                .filter(event => !acknowledged.has(event.id));

            return [...futureSeedEvents, ...scheduleEvents].sort((a, b) => String(a.triggerAt).localeCompare(String(b.triggerAt)));
        };

        function CampusMemoryMap() {
            const [theme, setTheme] = useState('day');
            const [memories, setMemories] = useState(loadStoredMemories);
            
            // 地图初始化：算出恰好填满屏幕的最小缩放比例
            const [mapState, setMapState] = useState(() => {
                const W = window.innerWidth;
                const H = window.innerHeight;
                const minScale = Math.max(W / MAP_WIDTH, H / MAP_HEIGHT);
                const x = (W - MAP_WIDTH * minScale) / 2;
                const y = (H - MAP_HEIGHT * minScale) / 2;
                return { scale: minScale, x, y };
            });

            const [isDragging, setIsDragging] = useState(false);
            const dragStart = useRef({ x: 0, y: 0, mapX: 0, mapY: 0 });
            // 修复：重新获取用于绑定右键事件的 mapRef
            const mapRef = useRef(null); 

            const [contextMenu, setContextMenu] = useState(null);
            const [modal, setModal] = useState(null);
            const [selectedPoint, setSelectedPoint] = useState(null);
            const [drawerOpen, setDrawerOpen] = useState(false);
            const [schedules, setSchedules] = useState(loadStoredSchedules);
            const [acknowledgedReminders, setAcknowledgedReminders] = useState(loadAcknowledgedReminders);
            const [reminderPanelOpen, setReminderPanelOpen] = useState(false);
            const [reminderContextMenu, setReminderContextMenu] = useState(null);
            const [reminderWhalePosition, setReminderWhalePosition] = useState(loadReminderWhalePosition);
            const reminderWhaleDrag = useRef({
                active: false,
                moved: false,
                suppressClick: false,
                startX: 0,
                startY: 0,
                originX: 0,
                originY: 0
            });

            const glassClass = theme === 'night' ? 'glass-panel-night' : 'glass-panel-day';
            const textClass = theme === 'night' ? 'text-white' : 'text-slate-800';
            const subTextClass = theme === 'night' ? 'text-slate-300' : 'text-slate-500';

            // --- 核心防漏底边界吸附计算 ---
            const clampMapState = (newState) => {
                const W = window.innerWidth;
                const H = window.innerHeight;
                // 地图最小尺寸必须覆盖整个屏幕
                const minScale = Math.max(W / MAP_WIDTH, H / MAP_HEIGHT);
                
                let { scale, x, y } = newState;
                scale = Math.max(minScale, Math.min(scale, minScale * 4));

                const scaledWidth = MAP_WIDTH * scale;
                const scaledHeight = MAP_HEIGHT * scale;

                // 强制限制平移范围，确保边界贴死
                const minX = W - scaledWidth;
                const maxX = 0;
                const minY = H - scaledHeight;
                const maxY = 0;

                x = Math.max(minX, Math.min(maxX, x));
                y = Math.max(minY, Math.min(maxY, y));

                return { scale, x, y };
            };

            const activeReminderEvents = useMemo(() => buildReminderEvents(memories, schedules, acknowledgedReminders), [memories, schedules, acknowledgedReminders]);
            const petAlert = activeReminderEvents.length > 0;

            useEffect(() => {
                localStorage.setItem(REMINDER_ACK_STORAGE_KEY, JSON.stringify(acknowledgedReminders));
            }, [acknowledgedReminders]);

            useEffect(() => {
                localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
            }, [schedules]);

            useEffect(() => {
                localStorage.setItem(REMINDER_WHALE_POSITION_STORAGE_KEY, JSON.stringify(reminderWhalePosition));
            }, [reminderWhalePosition]);

            const acknowledgeReminder = (id) => {
                setAcknowledgedReminders(prev => prev.includes(id) ? prev : [...prev, id]);
                setReminderContextMenu(null);
            };

            const acknowledgeAllReminders = () => {
                if (!activeReminderEvents.length) return;
                setAcknowledgedReminders(prev => [...new Set([...prev, ...activeReminderEvents.map(event => event.id)])]);
                setReminderPanelOpen(false);
                setReminderContextMenu(null);
            };

            // 窗口缩放时重新对齐边界
            useEffect(() => {
                const handleResize = () => {
                    setMapState(prev => clampMapState(prev));
                    setReminderWhalePosition(prev => clampReminderWhalePosition(prev));
                };
                window.addEventListener('resize', handleResize);
                return () => window.removeEventListener('resize', handleResize);
            }, []);

            useEffect(() => {
                localStorage.setItem('campus-memories', JSON.stringify(memories));
            }, [memories]);

            // 地图交互逻辑
            const handleWheel = (e) => {
                e.preventDefault();
                const scaleAdjust = e.deltaY * -0.002;
                let newScale = mapState.scale + scaleAdjust;
                
                const mx = (e.clientX - mapState.x) / mapState.scale;
                const my = (e.clientY - mapState.y) / mapState.scale;
                const x = e.clientX - mx * newScale;
                const y = e.clientY - my * newScale;
                setMapState(clampMapState({ scale: newScale, x, y }));
            };

            const handleMouseDown = (e) => {
                if (e.button !== 0) return;
                setIsDragging(true);
                dragStart.current = { x: e.clientX, y: e.clientY, mapX: mapState.x, mapY: mapState.y };
                setContextMenu(null);
            };

            const handleMouseMove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - dragStart.current.x;
                const dy = e.clientY - dragStart.current.y;
                setMapState(prev => clampMapState({ ...prev, x: dragStart.current.mapX + dx, y: dragStart.current.mapY + dy }));
            };

            const handleMouseUp = () => setIsDragging(false);

            const handleReminderWhalePointerDown = (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.setPointerCapture?.(e.pointerId);
                reminderWhaleDrag.current = {
                    active: true,
                    moved: false,
                    suppressClick: false,
                    startX: e.clientX,
                    startY: e.clientY,
                    originX: reminderWhalePosition.x,
                    originY: reminderWhalePosition.y
                };
                setReminderContextMenu(null);
            };

            const handleReminderWhalePointerMove = (e) => {
                if (!reminderWhaleDrag.current.active) return;
                e.preventDefault();
                e.stopPropagation();
                const dx = e.clientX - reminderWhaleDrag.current.startX;
                const dy = e.clientY - reminderWhaleDrag.current.startY;
                if (Math.hypot(dx, dy) > 4) reminderWhaleDrag.current.moved = true;
                setReminderWhalePosition(clampReminderWhalePosition({
                    x: reminderWhaleDrag.current.originX + dx,
                    y: reminderWhaleDrag.current.originY + dy
                }));
            };

            const handleReminderWhalePointerUp = (e) => {
                if (!reminderWhaleDrag.current.active) return;
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.releasePointerCapture?.(e.pointerId);
                const wasDragged = reminderWhaleDrag.current.moved;
                reminderWhaleDrag.current.active = false;
                reminderWhaleDrag.current.suppressClick = true;
                if (!wasDragged) setReminderPanelOpen(p => !p);
            };

            const handleReminderWhalePointerCancel = (e) => {
                e.stopPropagation();
                reminderWhaleDrag.current.active = false;
                reminderWhaleDrag.current.suppressClick = true;
            };

            const handleReminderWhaleClick = (e) => {
                if (reminderWhaleDrag.current.suppressClick) {
                    reminderWhaleDrag.current.suppressClick = false;
                    e.preventDefault();
                    return;
                }
                setReminderPanelOpen(p => !p);
            };

            const handleContextMenu = (e) => {
                e.preventDefault();
                // 修复：“播种”菜单因为之前没有绑定 ref 导致失效，现在已找回。
                if (mapRef.current) {
                    const offsetX = theme === 'night' ? NIGHT_OFFSET_X : 0;
                    const offsetY = theme === 'night' ? NIGHT_OFFSET_Y : 0;
                    const rawX = (e.clientX - mapState.x) / mapState.scale - offsetX;
                    const rawY = (e.clientY - mapState.y) / mapState.scale - offsetY;
                    
                    setSelectedPoint({ x: rawX, y: rawY });
                    setContextMenu({ x: e.clientX, y: e.clientY, type: 'map' });
                }
            };

            const handleSeedContextMenu = (e, cluster) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPoint({ x: cluster.x, y: cluster.y, clusterMemories: cluster.items });
                setContextMenu({ x: e.clientX, y: e.clientY, type: 'seed' });
            };

            const clusters = useMemo(() => {
                const result = [];
                const threshold = 30; 
                memories.forEach(mem => {
                    let found = result.find(c => Math.hypot(c.x - mem.mapX, c.y - mem.mapY) < threshold);
                    if (found) {
                        found.items.push(mem);
                    } else {
                        result.push({ x: mem.mapX, y: mem.mapY, items: [mem] });
                    }
                });
                return result;
            }, [memories]);

            // --- 全息地块区域交互组件 ---
            const AreaPolygons = () => {
                const [hoveredArea, setHoveredArea] = useState(null);

                return (
                    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                        <defs>
                            {/* 保留您修改的流光渐变色：绿-黄-绿 */}
                            <linearGradient id="holo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8CB818" />
                                <stop offset="50%" stopColor="#FADF2E" />
                                <stop offset="100%" stopColor="#D0EBB7" />
                            </linearGradient>
                            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="6" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="blur" /> 
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {CAMPUS_AREAS.map((area, idx) => {
                            const pathData = polygonToPath(area.polygon);
                            return (
                                <g key={area.id}
                                   className={`cursor-crosshair ${isDragging ? 'pointer-events-none' : 'pointer-events-auto'}`}
                                   onMouseEnter={() => setHoveredArea(area.name)}
                                   onMouseLeave={() => setHoveredArea(null)}
                                >
                                    {/* 基础底色与柔和边框 */}
                                    <path
                                        d={pathData}
                                        fill={hoveredArea === area.name ? "rgba(168, 183, 116, 0.15)" : "transparent"}
                                        stroke={hoveredArea === area.name ? "rgba(128, 236, 153, 0.3)" : "transparent"}
                                        strokeWidth="2"
                                        className="transition-all duration-500 ease-out"
                                    />
                                    
                                    {/* 修复 1、2: 渐变长尾流星，且无缝衔接循环 */}
                                    {hoveredArea === area.name && (
                                        <g style={{ filter: 'url(#neon-glow)' }}>
                                            {[...Array(20)].map((_, i) => (
                                                <path
                                                    key={i}
                                                    d={pathData}
                                                    fill="none"
                                                    stroke="url(#holo-gradient)"
                                                    strokeWidth={4 - i * 0.15} // 从流星头部变细
                                                    strokeDasharray="2 98"     // 单个破折号长2，间隙98（刚好凑够100）
                                                    pathLength="100"           // 将所有周长归一化为100
                                                    strokeLinecap="round"
                                                    style={{
                                                        opacity: 1 - i * 0.05, // 透明度随尾巴逐级递减
                                                        animation: `stroke-flow 10s linear infinite`,
                                                        // 神奇的算法：错开时间，形成完美的排队彗星尾巴！
                                                        animationDelay: `-${10 - i * 0.1}s` 
                                                    }}
                                                />
                                            ))}
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                );
            }

            // --- 渲染组件：全息晶体 (Seed Marker) ---
            const renderSeedMarker = (cluster, index) => {
                const count = cluster.items.length;
                let visual = null;

                if (count === 1) {
                    visual = (
                        <div className={`w-6 h-6 rounded-full ${glassClass} flex items-center justify-center relative`} style={{ animation: 'float 3s ease-in-out infinite' }}>
                            <div className="w-2 h-2 bg-white rounded-full" style={{ animation: 'breathe 2s infinite', boxShadow: '0 0 8px rgba(255,255,255,0.8)' }}></div>
                        </div>
                    );
                } else if (count <= 3) {
                    visual = (
                        <div className={`w-8 h-8 rounded-full ${glassClass} flex items-center justify-center relative`} style={{ animation: 'float 3.5s ease-in-out infinite' }}>
                            <div className="absolute inset-0 border border-purple-400/50 rounded-full" style={{ animation: 'orbit 4s linear infinite' }}></div>
                            <div className="w-3 h-3 bg-purple-300 rounded-full" style={{ boxShadow: '0 0 12px #9d4edd' }}></div>
                        </div>
                    );
                } else if (count <= 6) {
                    visual = (
                        <div className={`w-11 h-11 rounded-full ${glassClass} flex items-center justify-center relative overflow-hidden`} style={{ animation: 'float 3.8s ease-in-out infinite' }}>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-200/30 via-violet-300/25 to-sky-200/30"></div>
                            <div className="absolute inset-0 rounded-full bg-purple-200/10 blur-md"></div>
                            <div className="absolute inset-0 border border-fuchsia-200/60 rounded-full" style={{ animation: 'orbit 5s linear infinite' }}></div>
                            <div className="absolute inset-1 rounded-full border border-white/10"></div>
                            <div className="w-4 h-4 rounded-full relative z-10 bg-gradient-to-br from-white via-fuchsia-200 to-violet-300" style={{ boxShadow: '0 0 18px rgba(216,180,254,0.95), 0 0 28px rgba(125,211,252,0.35)' }}></div>
                        </div>
                    );
                } else {
                    visual = (
                        <div className="relative flex flex-col items-center justify-end" style={{ height: '60px' }}>
                            <div className="w-1 h-12 bg-gradient-to-t from-emerald-400/80 to-transparent blur-[1px]"></div>
                            <div className="absolute top-0 w-8 h-8 bg-emerald-400/30 rounded-full blur-md"></div>
                            <TreeIcon className="text-emerald-300 w-6 h-6 absolute top-0" style={{ filter: 'drop-shadow(0 0 8px #34d399)' }}/>
                        </div>
                    );
                }

                return (
                    <div 
                        key={index}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 hover:scale-110 transition-transform pointer-events-auto"
                        style={{ left: cluster.x, top: cluster.y }}
                        onContextMenu={(e) => handleSeedContextMenu(e, cluster)}
                        title={`包含 ${count} 条记忆`}
                    >
                        {visual}
                    </div>
                );
            };

            const AIAvatar = ({ id, className, iconClass }) => {
                const ai = AI_COMPANIONS.find(a => a.id === id);
                const isImg = typeof ai.icon === 'string';
                const finalContainerClass = isImg 
                    ? "w-10 h-10 flex items-center justify-center flex-shrink-0 bg-transparent border-transparent" 
                    : `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${className}`;

                return (
                    <div className={finalContainerClass}>
                        {isImg ? (
                            <img src={ai.icon} className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] scale-110" alt={ai.name} />
                        ) : (
                            <ai.icon className={iconClass} />
                        )}
                    </div>
                );
            };

            const PlantModal = () => {
                const [type, setType] = useState('memory');
                const [title, setTitle] = useState('');
                const [content, setContent] = useState('');
                const [memoryDate, setMemoryDate] = useState(getTodayInRange());
                const [sproutDate, setSproutDate] = useState('');
                const [selectedTags, setSelectedTags] = useState([]);
                const [customTag, setCustomTag] = useState('');
                const [imageStr, setImageStr] = useState(null);
                const [formError, setFormError] = useState('');
                const fileInputRef = useRef(null);

                const handleSave = () => {
                    const cleanTitle = title.trim();
                    const cleanContent = content.trim();
                    const activeDate = type === 'memory' ? memoryDate : sproutDate;
                    if (!cleanTitle) {
                        setFormError('请填写主题。');
                        return;
                    }
                    if (!isDateInRange(activeDate)) {
                        setFormError(`日期需在 ${DATE_MIN} 至 ${DATE_MAX} 之间。`);
                        return;
                    }
                    if (type === 'memory' && !cleanContent && !imageStr) {
                        setFormError('记忆种子至少需要文字或图片之一。');
                        return;
                    }
                    if (type === 'future' && !cleanContent) {
                        setFormError('未来种子需要填写未来留言。');
                        return;
                    }
                    const now = new Date().toISOString();
                    const area = getAreaByPoint(selectedPoint.x, selectedPoint.y) || UNKNOWN_AREA;
                    const newMem = {
                        id: Date.now().toString(),
                        seedType: type,
                        title: cleanTitle,
                        contentType: getContentType(cleanContent, imageStr),
                        text: cleanContent,
                        tags: selectedTags,
                        image: imageStr,
                        mapX: selectedPoint.x,
                        mapY: selectedPoint.y,
                        areaId: area.id || UNKNOWN_AREA.id,
                        areaName: area.name || UNKNOWN_AREA.name,
                        memoryDate: type === 'memory' ? memoryDate : undefined,
                        sproutDate: type === 'future' ? sproutDate : undefined,
                        createdAt: now,
                        updatedAt: now,
                    };
                    setMemories([...memories, newMem]);
                    setModal(null);
                };

                const toggleTag = (t) => {
                    if (selectedTags.includes(t)) setSelectedTags(selectedTags.filter(tag => tag !== t));
                    else setSelectedTags([...selectedTags, t]);
                };

                const addCustomTag = () => {
                    const nextTag = customTag.trim();
                    if (!nextTag) return;
                    if (!selectedTags.includes(nextTag)) setSelectedTags([...selectedTags, nextTag]);
                    setCustomTag('');
                };

                const handleImageUpload = (e) => {
                    const file = e.target.files[0];
                    if(file) {
                        if (file.size > MAX_IMAGE_BYTES) {
                            setFormError('图片不能超过 3MB。');
                            e.target.value = '';
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            setImageStr(ev.target.result);
                            setFormError('');
                        };
                        reader.readAsDataURL(file);
                    }
                };

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" style={{ backdropFilter: 'blur(10px)' }}>
                        <div className={`glass-modal-dark w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-[32px] relative transform transition-all`}>
                            <button onClick={() => setModal(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                                <XIcon />
                            </button>
                            
                            <div className="flex bg-black/30 rounded-full p-1 mb-6 holo-capsule shadow-inner">
                                <button onClick={() => setType('memory')} className={`flex-1 py-2 text-sm text-center rounded-full transition-all ${type === 'memory' ? 'bg-white/20 text-white shadow-md' : 'text-white/40'}`}>记忆种子</button>
                                <button onClick={() => setType('future')} className={`flex-1 py-2 text-sm text-center rounded-full transition-all ${type === 'future' ? 'bg-purple-500/50 text-white shadow-md' : 'text-white/40'}`}>未来种子</button>
                            </div>

                            <div className="space-y-4">
                                <input 
                                    type="text" placeholder={type === 'memory' ? "记忆主题..." : "给未来的留言主题..."}
                                    className={`w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 text-white placeholder-white/40 transition-colors shadow-inner`}
                                    value={title} onChange={e=>setTitle(e.target.value)}
                                />

                                <label className="block">
                                    <span className="block text-xs text-white/50 mb-2">{type === 'memory' ? '记忆日期' : '萌发日期'}</span>
                                    <input
                                        type="date"
                                        min={DATE_MIN}
                                        max={DATE_MAX}
                                        value={type === 'memory' ? memoryDate : sproutDate}
                                        onChange={e => type === 'memory' ? setMemoryDate(e.target.value) : setSproutDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 text-white shadow-inner"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </label>
                                
                                <div className="flex items-center gap-2 flex-wrap">
                                    <TagIcon className="w-4 h-4 text-white/50" />
                                    {PRESET_TAGS.map(t => (
                                        <button 
                                            key={t} onClick={() => toggleTag(t)}
                                            className={`px-3 py-1 text-xs rounded-full border transition-all ${selectedTags.includes(t) ? 'bg-white/20 border-white/50 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'bg-transparent border-white/20 text-white/60 hover:text-white hover:border-white/40'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customTag}
                                        onChange={e => setCustomTag(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addCustomTag();
                                            }
                                        }}
                                        placeholder="自定义标签..."
                                        className="min-w-0 flex-1 bg-black/20 border border-white/20 rounded-2xl px-4 py-2 outline-none focus:border-white/50 text-sm text-white placeholder-white/40 shadow-inner"
                                    />
                                    <button
                                        onClick={addCustomTag}
                                        className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm text-white/80 transition-colors"
                                    >
                                        添加
                                    </button>
                                </div>

                                {selectedTags.some(t => !PRESET_TAGS.includes(t)) && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTags.filter(t => !PRESET_TAGS.includes(t)).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => toggleTag(t)}
                                                className="px-3 py-1 text-xs rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors"
                                            >
                                                {t} ×
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <textarea 
                                    placeholder={type === 'memory' ? '写下这一刻的故事...' : '写给未来的自己...'} rows="3"
                                    className={`w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 resize-none text-white placeholder-white/40 shadow-inner`}
                                    value={content} onChange={e=>setContent(e.target.value)}
                                ></textarea>
                                
                                <div className="flex items-center gap-4">
                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-2xl flex items-center justify-center gap-2 text-white/70 text-sm transition-colors"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                        {imageStr ? '重新选择图片' : '附加记忆图片'}
                                    </button>
                                    {imageStr && (
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                                            <img src={imageStr} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                {formError && (
                                    <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                        {formError}
                                    </div>
                                )}

                                <button onClick={handleSave} className="w-full py-3 mt-2 rounded-full bg-gradient-to-r from-purple-500/70 to-pink-500/70 text-white font-medium hover:from-purple-500/90 hover:to-pink-500/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                    <LeafIcon className="w-4 h-4" /> 种下{type === 'memory' ? '记忆' : '未来'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            };

            const HarvestModal = () => {
                const [sortOrder, setSortOrder] = useState('desc');
                const clusterIds = useMemo(() => new Set((selectedPoint?.clusterMemories || []).map(mem => mem.id)), [selectedPoint]);
                const clusterMems = useMemo(() => {
                    return memories
                        .filter(mem => clusterIds.has(mem.id))
                        .sort((a, b) => {
                            const timeA = new Date(getSeedDisplayDate(a) || 0).getTime();
                            const timeB = new Date(getSeedDisplayDate(b) || 0).getTime();
                            return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
                        });
                }, [memories, clusterIds, sortOrder]);
                const stopMapEvent = (e) => e.stopPropagation();
                const deleteMemory = (id) => {
                    setMemories(prev => prev.filter(mem => mem.id !== id));
                    if (clusterMems.length <= 1) setModal(null);
                };
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={() => setModal(null)} onWheel={stopMapEvent} onMouseDown={stopMapEvent} onMouseMove={stopMapEvent} onMouseUp={stopMapEvent} onContextMenu={stopMapEvent} style={{ backdropFilter: 'blur(10px)' }}>
                        <div className={`glass-modal-dark w-full max-w-lg max-h-[80vh] overflow-hidden p-6 rounded-[32px] flex flex-col`} onClick={e=>e.stopPropagation()} onWheel={stopMapEvent} onMouseDown={stopMapEvent} onMouseMove={stopMapEvent} onMouseUp={stopMapEvent} onContextMenu={stopMapEvent}>
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-light flex items-center gap-2 text-white">
                                    <SparklesIcon className="text-purple-400" /> 收获记忆
                                </h2>
                                <button
                                    onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}
                                    className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-white/80 transition-colors"
                                >
                                    {sortOrder === 'desc' ? '新到旧' : '旧到新'}
                                </button>
                            </div>
                            <div className="space-y-4 min-h-0 overflow-y-auto pr-2" onWheel={stopMapEvent} onMouseDown={stopMapEvent} onMouseMove={stopMapEvent} onMouseUp={stopMapEvent}>
                                {clusterMems.length === 0 && (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
                                        这里暂时没有可收获的记忆。
                                    </div>
                                )}
                                {clusterMems.map(mem => {
                                    const seedType = mem.seedType || mem.type;
                                    const isFuture = seedType === 'future';
                                    const isSprouted = isFutureSeedSprouted(mem);
                                    return (
                                        <div key={mem.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors shadow-inner">
                                            <div className="flex justify-between items-start gap-3 mb-2">
                                                <h3 className="font-medium text-white">{mem.title}</h3>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80">{isFuture ? (isSprouted ? '已萌发' : '未来') : '记忆'}</span>
                                                    <button onClick={() => deleteMemory(mem.id)} className="text-xs px-2 py-1 rounded-full border border-rose-300/30 text-rose-100 hover:bg-rose-500/20 transition-colors">删除</button>
                                                </div>
                                            </div>
                                            <div className="text-xs text-white/50 mb-2 flex items-center gap-1">
                                                <CompassIcon className="w-3 h-3" /> {mem.areaName || UNKNOWN_AREA.name}
                                            </div>
                                            {mem.tags && mem.tags.length > 0 && (
                                                <div className="flex gap-1 mb-2 flex-wrap">
                                                    {mem.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-white/20 text-white/60">{t}</span>)}
                                                </div>
                                            )}
                                            {isFuture && !isSprouted ? (
                                                <div className="rounded-xl border border-purple-300/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-100 mb-3">
                                                    这颗未来种子尚未萌发。
                                                </div>
                                            ) : (
                                                <>
                                                    {mem.image && (
                                                        <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-white/10">
                                                            <img src={mem.image} className="w-full h-full object-cover" alt="Memory Attachment" />
                                                        </div>
                                                    )}
                                                    <p className="text-sm mb-3 text-white/80">{mem.text ?? mem.content}</p>
                                                </>
                                            )}
                                            <div className="text-xs text-white/40 flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" /> {isFuture ? '萌发日期' : '记忆日期'}：{formatSeedDate(getSeedDisplayDate(mem))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            };

            const ManualModal = () => (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" style={{ backdropFilter: 'blur(12px)' }} onClick={() => setModal(null)}>
                    <div className={`glass-modal-dark w-full max-w-2xl min-h-[60vh] p-8 rounded-[32px] relative flex flex-col`} onClick={e=>e.stopPropagation()}>
                        <button onClick={() => setModal(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <XIcon />
                        </button>
                        <h2 className="text-2xl font-light text-white mb-6 flex items-center gap-3">
                            播种说明书
                        </h2>
                        
                        <div className="flex-1 bg-black/20 border border-white/10 rounded-2xl shadow-inner flex items-center justify-center">
                            <div className="text-center space-y-4 opacity-50">
                               
                                <p className=" breathing-text
      text-sm md:text-3xl font-bold tracking-wide
      text-transparent bg-clip-text
      bg-gradient-to-r from-slate-100 via-cyan-200 to-sky-400
      drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]
      select-none">这是一张留存你、我与南大鼓楼校区记忆的地图<br/><br/></p>
                                <p className="text-white font-light tracking-wider">在对应的位置右击,即可播种记忆<br/>
                                    你也可以选择种下与未来的对话，静待它的萌发<br/>
                                    点击右侧“探索”图标，以卡牌翻阅每一处记忆<br/>
                                    小蓝鲸会记住你的日程安排<br/><br/>让我们开始播种记忆地图吧！<br/>
                                    </p>
                                    
                            </div>
                        </div>
                    </div>
                </div>
            );

            const ScheduleModal = () => {
                const emptyForm = {
                    id: '',
                    title: '',
                    date: getTodayInRange(),
                    startTime: '',
                    endTime: '',
                    location: '',
                    note: '',
                    type: 'class'
                };
                const [form, setForm] = useState(emptyForm);
                const [formError, setFormError] = useState('');
                const sortedSchedules = useMemo(() => {
                    return [...schedules].sort((a, b) => {
                        const left = `${a.date || '9999-12-31'}T${a.startTime || '23:59'}`;
                        const right = `${b.date || '9999-12-31'}T${b.startTime || '23:59'}`;
                        return left.localeCompare(right);
                    });
                }, [schedules]);
                const stopMapEvent = (e) => e.stopPropagation();
                const updateField = (key, value) => {
                    setForm(prev => ({ ...prev, [key]: value }));
                    setFormError('');
                };
                const resetForm = () => {
                    setForm(emptyForm);
                    setFormError('');
                };
                const saveSchedule = () => {
                    const cleanTitle = form.title.trim();
                    if (!cleanTitle) {
                        setFormError('请填写课程或日程名称。');
                        return;
                    }
                    if (!isDateInRange(form.date)) {
                        setFormError(`日期需要在 ${DATE_MIN} 到 ${DATE_MAX} 之间。`);
                        return;
                    }
                    if (!form.startTime) {
                        setFormError('请设置开始时间。');
                        return;
                    }
                    if (form.endTime && form.endTime < form.startTime) {
                        setFormError('结束时间不能早于开始时间。');
                        return;
                    }
                    const now = new Date().toISOString();
                    const nextItem = normalizeScheduleItem({
                        ...form,
                        title: cleanTitle,
                        location: form.location.trim(),
                        note: form.note.trim(),
                        id: form.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                        createdAt: form.createdAt || now,
                        updatedAt: now
                    });
                    setSchedules(prev => {
                        const exists = prev.some(item => item.id === nextItem.id);
                        if (exists) return prev.map(item => item.id === nextItem.id ? nextItem : item);
                        return [...prev, nextItem];
                    });
                    setAcknowledgedReminders(prev => prev.filter(id => !id.startsWith(`schedule:${nextItem.id}:`)));
                    resetForm();
                };
                const editSchedule = (item) => {
                    setForm({
                        id: item.id,
                        title: item.title || '',
                        date: item.date || getTodayInRange(),
                        startTime: item.startTime || '',
                        endTime: item.endTime || '',
                        location: item.location || '',
                        note: item.note || '',
                        type: item.type === 'event' ? 'event' : 'class',
                        createdAt: item.createdAt
                    });
                    setFormError('');
                };
                const deleteSchedule = (id) => {
                    setSchedules(prev => prev.filter(item => item.id !== id));
                    setAcknowledgedReminders(prev => prev.filter(ackId => !ackId.startsWith(`schedule:${id}:`)));
                    if (form.id === id) resetForm();
                };

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setModal(null)} onWheel={stopMapEvent} onMouseDown={stopMapEvent} onMouseMove={stopMapEvent} onMouseUp={stopMapEvent} onContextMenu={stopMapEvent} style={{ backdropFilter: 'blur(12px)' }}>
                        <div className="glass-modal-dark w-full max-w-3xl max-h-[88vh] overflow-y-auto p-6 md:p-8 rounded-[32px] relative flex flex-col" onClick={stopMapEvent} onWheel={stopMapEvent} onMouseDown={stopMapEvent} onMouseMove={stopMapEvent} onMouseUp={stopMapEvent} onContextMenu={stopMapEvent}>
                            <button onClick={() => setModal(null)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                                <XIcon />
                            </button>
                            <div className="mb-6 pr-10">
                                <h2 className="text-2xl font-light text-white">
                                    日程与课程
                                </h2>
                                <p className="mt-2 text-sm text-white/50">开始前 15 分钟会进入提醒小人。</p>
                            </div>

                            <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(260px,0.85fr)] gap-5 min-h-0">
                                <section className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-5">
                                    <div className="flex bg-black/30 rounded-full p-1 mb-4 holo-capsule shadow-inner">
                                        <button onClick={() => updateField('type', 'class')} className={`flex-1 py-2 text-sm rounded-full transition-all ${form.type === 'class' ? 'bg-white/20 text-white shadow-md' : 'text-white/40'}`}>课程</button>
                                        <button onClick={() => updateField('type', 'event')} className={`flex-1 py-2 text-sm rounded-full transition-all ${form.type === 'event' ? 'bg-cyan-500/40 text-white shadow-md' : 'text-white/40'}`}>日程</button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={e => updateField('title', e.target.value)}
                                            placeholder={form.type === 'class' ? '课程名称...' : '日程名称...'}
                                            className="w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 text-white placeholder-white/40 shadow-inner"
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <label className="block">
                                                <span className="block text-xs text-white/50 mb-2">日期</span>
                                                <input type="date" min={DATE_MIN} max={DATE_MAX} value={form.date} onChange={e => updateField('date', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 text-white shadow-inner" style={{ colorScheme: 'dark' }} />
                                            </label>
                                            <label className="block">
                                                <span className="block text-xs text-white/50 mb-2">开始</span>
                                                <input type="time" value={form.startTime} onChange={e => updateField('startTime', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 text-white shadow-inner" style={{ colorScheme: 'dark' }} />
                                            </label>
                                            <label className="block">
                                                <span className="block text-xs text-white/50 mb-2">结束</span>
                                                <input type="time" value={form.endTime} onChange={e => updateField('endTime', e.target.value)} className="w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 text-white shadow-inner" style={{ colorScheme: 'dark' }} />
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={form.location}
                                            onChange={e => updateField('location', e.target.value)}
                                            placeholder="地点..."
                                            className="w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 text-white placeholder-white/40 shadow-inner"
                                        />
                                        <textarea
                                            rows="3"
                                            value={form.note}
                                            onChange={e => updateField('note', e.target.value)}
                                            placeholder="备注..."
                                            className="w-full bg-black/20 border border-white/20 rounded-2xl px-4 py-3 outline-none focus:border-white/50 resize-none text-white placeholder-white/40 shadow-inner"
                                        ></textarea>
                                        {formError && (
                                            <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                                {formError}
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button onClick={saveSchedule} className="flex-1 py-3 rounded-full bg-gradient-to-r from-cyan-500/70 to-purple-500/70 text-white font-medium hover:from-cyan-500/90 hover:to-purple-500/90 transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                                                {form.id ? '保存修改' : '加入日程'}
                                            </button>
                                            {form.id && (
                                                <button onClick={resetForm} className="px-5 py-3 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition-colors">
                                                    取消
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-3xl border border-white/10 bg-black/10 p-4 md:p-5 min-h-0 flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-white font-medium">已保存</p>
                                        <span className="text-xs text-white/40">{sortedSchedules.length} 条</span>
                                    </div>
                                    <div className="space-y-3 overflow-y-auto pr-1 min-h-0">
                                        {sortedSchedules.length === 0 ? (
                                            <div className="h-full min-h-[220px] rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-sm text-white/45 text-center px-6">
                                                还没有课程或日程。
                                            </div>
                                        ) : sortedSchedules.map(item => (
                                            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                                                        <p className="mt-1 text-xs text-white/50">{item.date} · {item.startTime}{item.endTime ? `-${item.endTime}` : ''}</p>
                                                        {item.location && <p className="mt-1 text-xs text-white/45 truncate">{item.location}</p>}
                                                    </div>
                                                    <span className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-white/50 flex-shrink-0">{item.type === 'event' ? '日程' : '课程'}</span>
                                                </div>
                                                {item.note && <p className="mt-3 text-xs leading-relaxed text-white/50 line-clamp-2">{item.note}</p>}
                                                <div className="mt-4 flex gap-2">
                                                    <button onClick={() => editSchedule(item)} className="flex-1 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white/75 transition-colors">编辑</button>
                                                    <button onClick={() => deleteSchedule(item.id)} className="flex-1 py-2 rounded-full border border-rose-300/20 text-xs text-rose-100/80 hover:bg-rose-500/15 transition-colors">删除</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                );
            };

            const ExploreDrawer = () => {
                const [selectedAIs, setSelectedAIs] = useState(['ghost', 'roamer']);
                const areaOptions = [...CAMPUS_AREAS, UNKNOWN_AREA];
                const areaCounts = useMemo(() => {
                    return memories.reduce((counts, mem) => {
                        const key = mem.areaId || UNKNOWN_AREA.id;
                        counts[key] = (counts[key] || 0) + 1;
                        return counts;
                    }, {});
                }, [memories]);
                const firstAreaWithMemory = areaOptions.find(area => areaCounts[area.id] > 0) || areaOptions[0];
                const [selectedAreaId, setSelectedAreaId] = useState(firstAreaWithMemory.id);
                const [exploreMode, setExploreMode] = useState('companion');
                const selectedArea = areaOptions.find(area => area.id === selectedAreaId) || UNKNOWN_AREA;
                const areaMemories = useMemo(() => {
                    return memories
                        .filter(mem => (mem.areaId || UNKNOWN_AREA.id) === selectedAreaId)
                        .sort((a, b) => new Date(getSeedDisplayDate(b) || 0).getTime() - new Date(getSeedDisplayDate(a) || 0).getTime());
                }, [memories, selectedAreaId]);
                const toggleAI = (id) => {
                    if (selectedAIs.includes(id)) setSelectedAIs(selectedAIs.filter(x => x !== id));
                    else if (selectedAIs.length < 3) setSelectedAIs([...selectedAIs, id]);
                };

                useEffect(() => {
                    if (!drawerOpen) return;
                    if (!areaOptions.some(area => area.id === selectedAreaId)) setSelectedAreaId(firstAreaWithMemory.id);
                }, [drawerOpen, selectedAreaId, firstAreaWithMemory.id]);

                const renderExploreCard = (mem) => {
                    const isFuture = (mem.seedType || mem.type) === 'future';
                    const isSprouted = isFutureSeedSprouted(mem);
                    return (
                        <div key={mem.id} className="rounded-2xl border border-white/10 bg-black/15 p-4 hover:bg-white/10 transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className={`font-medium ${textClass}`}>{mem.title}</h3>
                                <span className={`text-[10px] px-2 py-1 rounded-full bg-white/10 ${subTextClass}`}>{isFuture ? (isSprouted ? '已萌发' : '未来') : '记忆'}</span>
                            </div>
                            <div className={`text-xs mb-2 flex items-center gap-1 ${subTextClass}`}>
                                <ClockIcon className="w-3 h-3" /> {formatSeedDate(getSeedDisplayDate(mem))}
                            </div>
                            {mem.tags && mem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {mem.tags.map(t => <span key={t} className={`text-[10px] px-2 py-0.5 rounded border border-white/20 ${subTextClass}`}>{t}</span>)}
                                </div>
                            )}
                            {isFuture && !isSprouted ? (
                                <p className={`text-sm ${subTextClass}`}>这颗未来种子尚未萌发。</p>
                            ) : (
                                <p className={`text-sm leading-relaxed ${textClass}`}>{mem.text || mem.content || '这条记忆只有图像或标签。'}</p>
                            )}
                        </div>
                    );
                };

                return (
                    <div className={`fixed inset-y-0 right-0 w-[540px] z-40 ${glassClass} border-l border-white/20 p-8 flex flex-col drawer-premium ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className={`flex justify-between items-center mb-6 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 translate-x-12'}`}>
                            <div>
                                <h2 className={`text-2xl font-light ${textClass}`}>地块探索</h2>
                                <p className={`text-xs mt-1 ${subTextClass}`}>{selectedArea.name} · {areaMemories.length} 条记录</p>
                            </div>
                            <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-full hover:bg-white/10 ${textClass} transition-colors`}>
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className={`space-y-4 mb-6 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-200' : 'opacity-0 translate-x-12'}`}>
                            <select
                                value={selectedAreaId}
                                onChange={e => setSelectedAreaId(e.target.value)}
                                className={`w-full bg-black/20 border border-white/15 rounded-2xl px-4 py-3 outline-none focus:border-white/40 ${textClass}`}
                                style={{ colorScheme: theme === 'night' ? 'dark' : 'light' }}
                            >
                                {areaOptions.map(area => (
                                    <option key={area.id} value={area.id}>
                                        {area.name} ({areaCounts[area.id] || 0})
                                    </option>
                                ))}
                            </select>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setExploreMode('private')} className={`py-2 rounded-full text-sm border transition-colors ${exploreMode === 'private' ? 'bg-white/20 border-white/40 ' + textClass : 'bg-black/10 border-white/10 ' + subTextClass}`}>秘密探索</button>
                                <button onClick={() => setExploreMode('companion')} className={`py-2 rounded-full text-sm border transition-colors ${exploreMode === 'companion' ? 'bg-white/20 border-white/40 ' + textClass : 'bg-black/10 border-white/10 ' + subTextClass}`}>结伴探索</button>
                            </div>

                            {exploreMode === 'companion' && (
                                <div>
                                    <p className={`text-sm mb-3 ${subTextClass}`}>结伴探索 (最多选 3 位)</p>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {AI_COMPANIONS.map(ai => {
                                            const isSelected = selectedAIs.includes(ai.id);
                                            const Icon = ai.icon;
                                            const isImg = typeof ai.icon === 'string';
                                            const containerClass = isImg
                                                ? `w-14 h-14 flex items-center justify-center transition-all bg-transparent border-transparent`
                                                : `w-14 h-14 rounded-full flex items-center justify-center border transition-all ${isSelected ? `bg-black/30 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]` : 'bg-black/10 border-white/10'}`;
                                            return (
                                                <div
                                                    key={ai.id}
                                                    onClick={() => toggleAI(ai.id)}
                                                    className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${isSelected ? 'opacity-100 -translate-y-1' : 'opacity-40 hover:opacity-70'}`}
                                                >
                                                    <div className={containerClass}>
                                                        {isImg ? (
                                                            <img src={ai.icon} alt={ai.name} className={`w-14 h-14 object-contain transition-all ${!isSelected ? 'grayscale opacity-60 scale-90' : 'scale-110'}`} />
                                                        ) : (
                                                            <Icon className={`w-6 h-6 ${isSelected ? ai.color : 'text-slate-400'}`} />
                                                        )}
                                                    </div>
                                                    <span className={`text-xs ${textClass}`}>{ai.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`flex-1 min-h-0 overflow-y-auto space-y-4 pr-2 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-300' : 'opacity-0 translate-x-12'}`}>
                            {exploreMode === 'companion' && areaMemories.length > 0 && selectedAIs.length > 0 && (
                                <div className="space-y-3">
                                    {selectedAIs.map(roleId => {
                                        const ai = AI_COMPANIONS.find(item => item.id === roleId);
                                        if (!ai) return null;
                                        return (
                                            <div key={roleId} className="flex gap-3">
                                                <AIAvatar id={roleId} className="bg-black/20 border border-white/10" iconClass={`w-5 h-5 ${ai.color}`} />
                                                <div className={`bg-black/20 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed ${textClass}`}>
                                                    <p className={`text-xs mb-2 ${ai.color}`}>{ai.name}</p>
                                                    {selectedArea.name} 里有 {areaMemories.length} 条记忆，我会先陪你从这些记录开始看。
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {areaMemories.length === 0 ? (
                                <div className={`rounded-2xl border border-white/10 bg-white/5 p-8 text-center ${subTextClass}`}>
                                    这个地块还没有记忆。
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {areaMemories.map(renderExploreCard)}
                                </div>
                            )}
                        </div>
                    </div>
                );

                return (
                    <div className={`fixed inset-y-0 right-0 w-[540px] z-40 ${glassClass} border-l border-white/20 p-8 flex flex-col drawer-premium ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className={`flex justify-between items-center mb-10 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 translate-x-12'}`}>
                            <h2 className={`text-2xl font-light ${textClass}`}>地块探索</h2>
                            <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-full hover:bg-white/10 ${textClass} transition-colors`}>
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className={`mb-10 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-200' : 'opacity-0 translate-x-12'}`}>
                            <p className={`text-sm mb-5 ${subTextClass}`}>结伴探索 (最多选3位)</p>
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {AI_COMPANIONS.map(ai => {
                                    const isSelected = selectedAIs.includes(ai.id);
                                    const Icon = ai.icon;
                                    const isImg = typeof ai.icon === 'string';
                                    
                                    const containerClass = isImg
                                        ? `w-14 h-14 flex items-center justify-center transition-all bg-transparent border-transparent`
                                        : `w-14 h-14 rounded-full flex items-center justify-center border transition-all ${isSelected ? `bg-black/30 border-${ai.color.split('-')[1]}-400 shadow-[0_0_15px_rgba(255,255,255,0.2)]` : 'bg-black/10 border-white/10'}`;

                                    return (
                                        <div 
                                            key={ai.id} onClick={() => toggleAI(ai.id)}
                                            className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${isSelected ? 'opacity-100 transform -translate-y-1' : 'opacity-40 hover:opacity-70'}`}
                                        >
                                            <div className={containerClass}>
                                                {isImg ? (
                                                    <img src={ai.icon} alt={ai.name} className={`w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all ${!isSelected ? 'grayscale opacity-60 scale-90' : 'scale-110'}`} />
                                                ) : (
                                                    <Icon className={`w-6 h-6 ${isSelected ? ai.color : 'text-slate-400'}`} />
                                                )}
                                            </div>
                                            <span className={`text-xs ${textClass}`}>{ai.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={`flex-1 overflow-y-auto space-y-6 pr-4 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-300' : 'opacity-0 translate-x-12'}`}>
                            {memories.length === 0 ? (
                                <div className={`text-center mt-10 ${subTextClass}`}>暂无记忆数据，去地图上播种吧。</div>
                            ) : (
                                <>
                                    {selectedAIs.includes('ghost') && (
                                        <div className="flex gap-4 animate-[float_4s_ease-in-out_infinite]">
                                            <AIAvatar id="ghost" className="bg-purple-500/20 border border-purple-400/30 blur-[1px]" iconClass="w-5 h-5 text-purple-300" />
                                            <div className={`bg-black/20 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed ${textClass}`}>
                                                <p className="text-purple-300 text-xs mb-2">校园幽灵</p>
                                                这里散落着 {memories.length} 颗记忆的碎片，我能感受到时间在这里流动的痕迹...
                                            </div>
                                        </div>
                                    )}
                                    {selectedAIs.includes('roamer') && (
                                        <div className="flex gap-4">
                                            <AIAvatar id="roamer" className="bg-emerald-500/20 border border-emerald-400/30" iconClass="w-5 h-5 text-emerald-300" />
                                            <div className={`bg-black/20 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed ${textClass}`}>
                                                <p className="text-emerald-300 text-xs mb-2">漫游者</p>
                                                从这里向北走，似乎有一条常年被树荫遮蔽的小径，你的记忆坐标就在附近。
                                            </div>
                                        </div>
                                    )}
                                    {selectedAIs.includes('artist') && (
                                        <div className="flex gap-4 animate-[breathe_3s_ease-in-out_infinite]">
                                            <AIAvatar id="artist" className="bg-pink-500/20 border border-pink-400/30" iconClass="w-5 h-5 text-pink-300" />
                                            <div className={`bg-black/20 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed ${textClass}`}>
                                                <p className="text-pink-300 text-xs mb-2">艺术家</p>
                                                你记录下的这些瞬间，就像校园里折射阳光的露水，充满着诗意的形状。
                                            </div>
                                        </div>
                                    )}
                                    {selectedAIs.includes('foodie') && (
                                        <div className="flex gap-4 animate-[float_3s_ease-in-out_infinite]">
                                            <AIAvatar id="foodie" className="bg-amber-500/20 border border-amber-400/30" iconClass="w-5 h-5 text-amber-300" />
                                            <div className={`bg-black/20 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed ${textClass}`}>
                                                <p className="text-amber-300 text-xs mb-2">Foodie</p>
                                                在这些记忆周围，似乎总是飘荡着刚出炉的美食香气，让人忍不住想去附近探索一番。
                                            </div>
                                        </div>
                                    )}
                                    {selectedAIs.includes('archivist') && (
                                        <div className="flex gap-4">
                                            <AIAvatar id="archivist" className="bg-blue-500/20 border border-blue-400/30" iconClass="w-5 h-5 text-blue-300" />
                                            <div className={`bg-black/20 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed ${textClass}`}>
                                                <p className="text-blue-300 text-xs mb-2">档案员</p>
                                                根据时间轴比对，你在这里留下的数据正在形成清晰且有规律的校园活动图谱。
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            };

            const ExploreDrawerV2 = () => {
                const [selectedAIs, setSelectedAIs] = useState(['ghost', 'roamer']);
                const [viewScope, setViewScope] = useState('area');
                const [selectedAreaId, setSelectedAreaId] = useState((CAMPUS_AREAS[0] || UNKNOWN_AREA).id);
                const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
                const [exploreMode, setExploreMode] = useState('companion');
                const [aiResponses, setAiResponses] = useState([]);
                const [aiLoading, setAiLoading] = useState(false);
                const [aiError, setAiError] = useState('');
                const [chatMessages, setChatMessages] = useState(loadStoredAiChats);
                const [chatRoleId, setChatRoleId] = useState('roamer');
                const [chatInput, setChatInput] = useState('');
                const [chatLoading, setChatLoading] = useState(false);
                const [chatError, setChatError] = useState('');
                
                // 新增：对话列表滚动容器 ref
                const chatMessagesContainerRef = useRef(null);
                
                const areaOptions = [...CAMPUS_AREAS, UNKNOWN_AREA];
                const stopDrawerEvent = (e) => e.stopPropagation();
                
                // 自定义下拉框相关 state
                const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
                const [isChatRoleDropdownOpen, setIsChatRoleDropdownOpen] = useState(false);
                const areaDropdownRef = useRef(null);
                const chatRoleDropdownRef = useRef(null);
                
                const areaCounts = useMemo(() => {
                    return memories.reduce((counts, mem) => {
                        const key = mem.areaId || UNKNOWN_AREA.id;
                        counts[key] = (counts[key] || 0) + 1;
                        return counts;
                    }, {});
                }, [memories]);
                
                const selectedArea = areaOptions.find(area => area.id === selectedAreaId) || UNKNOWN_AREA;
                const areaMemoriesForAi = useMemo(() => {
                    return memories
                        .filter(mem => (mem.areaId || UNKNOWN_AREA.id) === selectedAreaId)
                        .sort((a, b) => {
                            const timeA = new Date(getSeedDisplayDate(a) || 0).getTime();
                            const timeB = new Date(getSeedDisplayDate(b) || 0).getTime();
                            return timeB - timeA;
                        });
                }, [memories, selectedAreaId]);
                
                const scopedMemories = useMemo(() => {
                    const list = viewScope === 'global'
                        ? memories
                        : memories.filter(mem => (mem.areaId || UNKNOWN_AREA.id) === selectedAreaId);
                    return [...list].sort((a, b) => {
                        const timeA = new Date(getSeedDisplayDate(a) || 0).getTime();
                        const timeB = new Date(getSeedDisplayDate(b) || 0).getTime();
                        return timeB - timeA;
                    });
                }, [memories, selectedAreaId, viewScope]);
                
                const visibleAreaName = viewScope === 'global' ? '全局探索' : selectedArea.name;
                const areaFocusLabel = viewScope === 'global' ? `关注：${selectedArea.name}` : selectedArea.name;
                const stats = useMemo(() => {
                    const tags = new Set(scopedMemories.flatMap(mem => Array.isArray(mem.tags) ? mem.tags : []));
                    return {
                        total: scopedMemories.length,
                        future: scopedMemories.filter(mem => (mem.seedType || mem.type) === 'future').length,
                        images: scopedMemories.filter(mem => mem.image).length,
                        tags: tags.size
                    };
                }, [scopedMemories]);
                
                const currentIndex = scopedMemories.length ? activeMemoryIndex % scopedMemories.length : 0;
                const activeMemory = scopedMemories[currentIndex];
                const stackedMemories = scopedMemories.filter((_, index) => index !== currentIndex).slice(0, 5);
                
                const drawerTextClass = 'text-white';
                const drawerSubTextClass = 'text-white/70';
                const chatRole = AI_COMPANIONS.find(ai => ai.id === chatRoleId) || AI_COMPANIONS[0];
                
                // 点击外部关闭下拉框
                useEffect(() => {
                    const handleClickOutside = (event) => {
                        if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) {
                            setIsAreaDropdownOpen(false);
                        }
                        if (chatRoleDropdownRef.current && !chatRoleDropdownRef.current.contains(event.target)) {
                            setIsChatRoleDropdownOpen(false);
                        }
                    };
                    document.addEventListener('mousedown', handleClickOutside);
                    return () => document.removeEventListener('mousedown', handleClickOutside);
                }, []);
                
                useEffect(() => {
                    if (!drawerOpen) {
                        setIsAreaDropdownOpen(false);
                        setIsChatRoleDropdownOpen(false);
                    }
                }, [drawerOpen]);
                
                useEffect(() => {
                    if (!drawerOpen) return;
                    const firstAreaWithMemory = areaOptions.find(area => areaCounts[area.id] > 0) || areaOptions[0] || UNKNOWN_AREA;
                    if (!areaOptions.some(area => area.id === selectedAreaId)) setSelectedAreaId(firstAreaWithMemory.id);
                }, [drawerOpen, selectedAreaId, areaCounts]);
                
                useEffect(() => {
                    setActiveMemoryIndex(0);
                }, [viewScope, selectedAreaId, scopedMemories.length]);
                
                const toggleAI = (id) => {
                    if (selectedAIs.includes(id)) setSelectedAIs(selectedAIs.filter(x => x !== id));
                    else if (selectedAIs.length < 3) setSelectedAIs([...selectedAIs, id]);
                };
                
                const activeAreaChatMessages = useMemo(() => {
                    return chatMessages
                        .filter(message => message.areaId === selectedAreaId)
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                }, [chatMessages, selectedAreaId]);
                
                useEffect(() => {
                    localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
                }, [chatMessages]);
                
                useEffect(() => {
                    if (!drawerOpen || exploreMode !== 'companion' || viewScope !== 'area' || areaMemoriesForAi.length === 0 || selectedAIs.length === 0) {
                        setAiResponses([]);
                        setAiLoading(false);
                        setAiError('');
                        return;
                    }
                    
                    let cancelled = false;
                    setAiLoading(true);
                    setAiError('');
                    setAiResponses([]);
                    requestAiInsights({
                        areaId: selectedAreaId,
                        areaName: selectedArea.name,
                        memories: areaMemoriesForAi,
                        selectedRoles: selectedAIs
                    })
                        .then(data => {
                            if (cancelled) return;
                            const responses = Array.isArray(data?.responses) ? data.responses : [];
                            const filledResponses = responses
                                .map(item => ({
                                    role: item.role,
                                    roleId: item.roleId || item.role,
                                    text: item.text,
                                    source: 'api'
                                }))
                                .filter(item => item.text);
                            if (filledResponses.length === 0) {
                                setAiResponses([]);
                                setAiError('未能生成地块解读，请稍后重试');
                                return;
                            }
                            setAiResponses(filledResponses);
                        })
                        .catch((error) => {
                            if (cancelled) return;
                            setAiResponses([]);
                            setAiError(formatApiError(error));
                        })
                        .finally(() => {
                            if (!cancelled) setAiLoading(false);
                        });
                    return () => { cancelled = true; };
                }, [drawerOpen, exploreMode, viewScope, selectedAreaId, areaMemoriesForAi, selectedAIs]);
                
                // 滚动到底部的函数
                const scrollToBottom = () => {
                    if (chatMessagesContainerRef.current) {
                        chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
                    }
                };
                
                // 清除对话历史
                const clearChatHistory = () => {
                    if (chatMessages.length === 0) return;
                    const confirmClear = window.confirm(`确定要清除所有角色的全部对话历史吗？共 ${chatMessages.length} 条消息。`);
                    if (!confirmClear) return;
                    
                    setChatMessages([]);  // 直接清空全部
                    setChatError('所有对话历史已清除');
                    setTimeout(() => setChatError(''), 2000);
                    };
                
                // 自动滚动：当最后一条消息属于当前区域和角色时
                useEffect(() => {
                    const lastMsg = chatMessages[chatMessages.length - 1];
                    if (lastMsg && lastMsg.areaId === selectedAreaId && lastMsg.roleId === chatRoleId) {
                        scrollToBottom();
                    }
                }, [chatMessages, selectedAreaId, chatRoleId]);
                
                const sendChatMessage = async (e) => {
                    e.preventDefault();
                    const text = chatInput.trim();
                    if (!text || chatLoading) return;
                    
                    const userMessage = normalizeChatMessage({
                        areaId: selectedAreaId,
                        roleId: chatRoleId,
                        sender: 'user',
                        text
                    });
                    const nextMessages = [...chatMessages, userMessage];
                    const roleHistory = nextMessages
                        .filter(message => message.areaId === selectedAreaId && message.roleId === chatRoleId)
                        .slice(-8)
                        .map(message => ({ sender: message.sender, text: message.text, roleId: message.roleId }));
                    
                    setChatMessages(nextMessages);
                    setChatInput('');
                    setChatLoading(true);
                    setChatError('');
                    
                    try {
                        const data = await requestRoleChat({
                            roleId: chatRoleId,
                            message: text,
                            areaId: selectedAreaId,
                            areaName: selectedArea.name,
                            memories: areaMemoriesForAi,
                            history: roleHistory
                        });
                        const aiMessage = normalizeChatMessage({
                            areaId: selectedAreaId,
                            roleId: data.roleId || chatRoleId,
                            sender: 'ai',
                            text: data.reply,
                            createdAt: data.createdAt
                        });
                        setChatMessages(current => [...current, aiMessage]);
                    } catch (error) {
                        setChatError(formatApiError(error));
                    } finally {
                        setChatLoading(false);
                    }
                };
                
                const cycleMemory = (direction) => {
                    if (scopedMemories.length === 0) return;
                    setActiveMemoryIndex(index => (index + direction + scopedMemories.length) % scopedMemories.length);
                };
                
                const renderCarouselImage = (mem, isPreview = false) => {
                    const isFuture = (mem.seedType || mem.type) === 'future';
                    const isSprouted = isFutureSeedSprouted(mem);
                    if (mem.image && (!isFuture || isSprouted)) {
                        return <img src={mem.image} className="w-full h-full object-cover" alt="Memory Attachment" />;
                    }
                    return (
                        <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(125,211,252,0.22),rgba(15,23,42,0.42)_54%,rgba(0,0,0,0.22))]">
                            {!isPreview && <ImageIcon className="w-10 h-10 text-white/35" />}
                        </div>
                    );
                };
                
                const renderCarouselBody = (mem) => {
                    const isFuture = (mem.seedType || mem.type) === 'future';
                    if (isFuture && !isFutureSeedSprouted(mem)) {
                        return <p className={`text-sm leading-relaxed ${drawerSubTextClass}`}>这颗未来种子尚未萌发，暂时隐藏正文。</p>;
                    }
                    return <p className={`text-sm md:text-base leading-relaxed ${drawerTextClass}`}>{mem.text || mem.content || '这条记忆只有图像或标签。'}</p>;
                };
                
                const renderMemoryCard = (mem) => {
                    const isFuture = (mem.seedType || mem.type) === 'future';
                    const isSprouted = isFutureSeedSprouted(mem);
                    return (
                        <article key={mem.id} className="rounded-2xl border border-white/10 bg-black/20 p-5 hover:bg-white/10 transition-colors shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <h3 className={`font-medium ${drawerTextClass}`}>{mem.title || '未命名记忆'}</h3>
                                <span className={`text-[10px] px-2 py-1 rounded-full bg-white/10 ${drawerSubTextClass}`}>{isFuture ? (isSprouted ? '已萌发' : '未来') : '记忆'}</span>
                            </div>
                            <div className={`text-xs mb-3 flex flex-wrap items-center gap-2 ${drawerSubTextClass}`}>
                                <span className="inline-flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {formatSeedDate(getSeedDisplayDate(mem))}</span>
                                <span className="inline-flex items-center gap-1"><CompassIcon className="w-3 h-3" /> {mem.areaName || UNKNOWN_AREA.name}</span>
                            </div>
                            {mem.tags && mem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {mem.tags.map(t => <span key={t} className={`text-[10px] px-2 py-0.5 rounded border border-white/20 ${drawerSubTextClass}`}>{t}</span>)}
                                </div>
                            )}
                            {mem.image && (!isFuture || isSprouted) && (
                                <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-white/10 bg-black/20">
                                    <img src={mem.image} className="w-full h-full object-cover" alt="Memory Attachment" />
                                </div>
                            )}
                            {isFuture && !isSprouted ? (
                                <p className={`text-sm ${drawerSubTextClass}`}>这颗未来种子尚未萌发，暂时隐藏正文。</p>
                            ) : (
                                <p className={`text-sm leading-relaxed ${drawerTextClass}`}>{mem.text || mem.content || '这条记忆只有图像或标签。'}</p>
                            )}
                        </article>
                    );
                };
                
                return (
                    <>
                        <style>{`
                            .dropdown-slide {
                                animation: dropdownFadeIn 0.2s ease-out;
                            }
                            @keyframes dropdownFadeIn {
                                from {
                                    opacity: 0;
                                    transform: translateY(-8px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                        `}</style>
                        <div
                            className={`fixed inset-y-4 left-4 right-4 mx-auto w-auto max-w-[1180px] z-40 ${glassClass} border border-white/20 rounded-[28px] p-6 md:p-8 flex flex-col drawer-premium shadow-[0_30px_90px_rgba(0,0,0,0.45)] ${drawerOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-[120vw] pointer-events-none'}`}
                            onClick={stopDrawerEvent}
                            onWheel={stopDrawerEvent}
                            onMouseDown={stopDrawerEvent}
                            onMouseMove={stopDrawerEvent}
                            onMouseUp={stopDrawerEvent}
                            onPointerDown={stopDrawerEvent}
                            onPointerMove={stopDrawerEvent}
                            onPointerUp={stopDrawerEvent}
                            onContextMenu={stopDrawerEvent}
                        >
                            <div className={`flex justify-between items-center mb-6 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 translate-x-12'}`}>
                                <div>
                                    <h2 className={`text-2xl font-light ${drawerTextClass}`}>地块探索</h2>
                                    <p className={`text-xs mt-1 ${drawerSubTextClass}`}>{visibleAreaName} · {areaFocusLabel} · {scopedMemories.length} 条记录</p>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-full hover:bg-white/10 ${drawerTextClass} transition-colors cursor-pointer`} title="关闭探索">
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className={`grid grid-cols-1 lg:grid-cols-[260px_minmax(360px,1fr)_280px] gap-5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-200' : 'opacity-0 translate-x-12'}`}>
                                <aside className="lg:min-h-0 lg:overflow-y-auto rounded-2xl border border-white/10 bg-black/10 p-4">
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <button onClick={() => setViewScope('global')} className={`py-2 rounded-full text-sm border transition-colors cursor-pointer ${viewScope === 'global' ? 'bg-white/20 border-white/40 ' + drawerTextClass : 'bg-black/10 border-white/10 ' + drawerSubTextClass}`}>全局</button>
                                        <button onClick={() => setViewScope('area')} className={`py-2 rounded-full text-sm border transition-colors cursor-pointer ${viewScope === 'area' ? 'bg-white/20 border-white/40 ' + drawerTextClass : 'bg-black/10 border-white/10 ' + drawerSubTextClass}`}>局部</button>
                                    </div>
                                    
                                    <div className="relative" ref={areaDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                                            className={`w-full bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 pr-4 outline-none cursor-pointer flex items-center justify-between ${drawerTextClass} focus:ring-2 focus:ring-white/50 transition-all`}
                                            style={{
                                                boxShadow: isAreaDropdownOpen ? '0 0 0 2px rgba(255,255,255,0.3), 0 0 0 4px rgba(255,255,255,0.1)' : '0 0 0 1px rgba(255,255,255,0.05)'
                                            }}
                                        >
                                            <span>{selectedArea.name} ({areaCounts[selectedArea.id] || 0})</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 transition-transform ${isAreaDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        
                                        {isAreaDropdownOpen && (
                                            <div className="absolute left-0 right-0 mt-2 z-50 bg-[rgba(90,90,82,0.85)] border border-[rgba(169,169,159,0.5)] rounded-xl shadow-[0_0_8px_rgba(169,169,159,0.25)] backdrop-blur-sm overflow-hidden dropdown-slide">
                                                <div>
                                                    {areaOptions.map(area => (
                                                        <button
                                                            key={area.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedAreaId(area.id);
                                                                setIsAreaDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors flex items-center justify-between ${selectedAreaId === area.id ? 'bg-white/30 text-white' : drawerTextClass}`}
                                                        >
                                                            <span>{area.name}</span>
                                                            <span className="text-xs text-white/60">{areaCounts[area.id] || 0} 条</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {viewScope === 'area' && (
                                        <div className="grid grid-cols-2 gap-2 my-4">
                                            <button onClick={() => setExploreMode('private')} className={`py-2 rounded-full text-sm border transition-colors cursor-pointer ${exploreMode === 'private' ? 'bg-white/20 border-white/40 ' + drawerTextClass : 'bg-black/10 border-white/10 ' + drawerSubTextClass}`}>秘密探索</button>
                                            <button onClick={() => setExploreMode('companion')} className={`py-2 rounded-full text-sm border transition-colors cursor-pointer ${exploreMode === 'companion' ? 'bg-white/20 border-white/40 ' + drawerTextClass : 'bg-black/10 border-white/10 ' + drawerSubTextClass}`}>结伴探索</button>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                                            <p className={`text-[10px] ${drawerSubTextClass}`}>记录</p>
                                            <p className={`text-xl font-light ${drawerTextClass}`}>{stats.total}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                                            <p className={`text-[10px] ${drawerSubTextClass}`}>未来</p>
                                            <p className={`text-xl font-light ${drawerTextClass}`}>{stats.future}</p>
                                        </div>
                                    </div>
                                    
                                    {viewScope === 'area' && exploreMode === 'companion' && (
                                        <div>
                                            <p className={`text-sm mb-3 ${drawerSubTextClass}`}>结伴探索 (最多选 3 位)</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {AI_COMPANIONS.map(ai => {
                                                    const isSelected = selectedAIs.includes(ai.id);
                                                    const Icon = ai.icon;
                                                    const isImg = typeof ai.icon === 'string';
                                                    return (
                                                        <div
                                                            key={ai.id}
                                                            onClick={() => toggleAI(ai.id)}
                                                            className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-black/30 border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)] opacity-100 -translate-y-1' : 'bg-black/10 border-white/10 opacity-50 hover:opacity-75 translate-y-0'}`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0 transition-all ${isSelected ? 'bg-black/30 border-white/30' : 'bg-black/10 border-white/10'}`}>
                                                                {isImg ? (
                                                                    <img src={ai.icon} alt={ai.name} className={`w-10 h-10 object-contain transition-all ${!isSelected ? 'grayscale opacity-60' : ''}`} />
                                                                ) : (
                                                                    <Icon className={`w-5 h-5 ${isSelected ? ai.color : 'text-slate-400'}`} />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={`text-xs font-medium ${isSelected ? ai.color : drawerSubTextClass}`}>{ai.name}</p>
                                                                <p className={`text-[10px] ${drawerSubTextClass} truncate`}>{ai.roleSummary}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </aside>
                                
                                <main className="min-h-[360px] lg:min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/10 p-4 md:p-5 flex flex-col">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <p className={`text-xs ${drawerSubTextClass}`}>记忆记录</p>
                                            <h3 className={`text-lg font-light ${drawerTextClass}`}>{visibleAreaName}</h3>
                                            {viewScope === 'global' && <p className={`text-xs mt-1 ${drawerSubTextClass}`}>{areaFocusLabel}</p>}
                                        </div>
                                        <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs ${drawerSubTextClass}`}>{viewScope === 'global' ? '全局' : '局部'}</span>
                                    </div>
                                    {viewScope === 'global' ? (
                                        scopedMemories.length === 0 ? (
                                            <div className={`flex-1 min-h-[260px] rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center flex items-center justify-center ${drawerSubTextClass}`}>
                                                这个范围还没有记忆。
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative flex-1 min-h-[360px] flex items-center justify-center px-12 md:px-16">
                                                    <button type="button" onClick={() => cycleMemory(-1)} className="absolute left-0 md:left-3 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/25 text-white/80 hover:bg-white/15 hover:text-white transition-colors flex items-center justify-center cursor-pointer" title="上一条">
                                                        <ChevronLeftIcon className="w-5 h-5" />
                                                    </button>
                                                    <div className="relative w-full max-w-[520px] h-[420px]">
                                                        {stackedMemories.map((mem, layer) => {
                                                            const side = layer % 2 === 0 ? -1 : 1;
                                                            const depth = Math.floor(layer / 2) + 1;
                                                            return (
                                                                <div
                                                                    key={`${mem.id}-stack-${layer}`}
                                                                    aria-hidden="true"
                                                                    className="absolute inset-0 rounded-[26px] overflow-hidden border border-white/15 bg-black/25 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                                                                    style={{
                                                                        transform: `translateX(${side * (34 + depth * 22)}px) translateY(${depth * 8}px) rotate(${side * (5 + depth * 2)}deg) scale(${1 - depth * 0.045})`,
                                                                        opacity: Math.max(0.22, 0.62 - layer * 0.09),
                                                                        zIndex: 4 - layer
                                                                    }}
                                                                >
                                                                    <div className="h-full opacity-65">{renderCarouselImage(mem, true)}</div>
                                                                    <div className="absolute inset-0 bg-black/35"></div>
                                                                </div>
                                                            );
                                                        })}
                                                        <article className="absolute inset-0 z-10 rounded-[28px] overflow-hidden border border-white/25 bg-black/35 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
                                                            <div className="h-[46%] border-b border-white/10 bg-black/20 overflow-hidden">{renderCarouselImage(activeMemory)}</div>
                                                            <div className="h-[54%] p-5 md:p-6 flex flex-col">
                                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                                    <div className="min-w-0">
                                                                        <h3 className={`text-xl font-light truncate ${drawerTextClass}`}>{activeMemory.title || '未命名记忆'}</h3>
                                                                        <div className={`mt-2 text-xs flex flex-wrap items-center gap-2 ${drawerSubTextClass}`}>
                                                                            <span className="inline-flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {formatSeedDate(getSeedDisplayDate(activeMemory))}</span>
                                                                            <span className="inline-flex items-center gap-1"><CompassIcon className="w-3 h-3" /> {activeMemory.areaName || UNKNOWN_AREA.name}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className={`text-[10px] px-2 py-1 rounded-full bg-white/10 ${drawerSubTextClass}`}>
                                                                        {(activeMemory.seedType || activeMemory.type) === 'future' ? (isFutureSeedSprouted(activeMemory) ? '已萌发' : '未来') : '记忆'}
                                                                    </span>
                                                                </div>
                                                                {activeMemory.tags && activeMemory.tags.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                                                        {activeMemory.tags.map(t => <span key={t} className={`text-[10px] px-2 py-0.5 rounded border border-white/20 ${drawerSubTextClass}`}>{t}</span>)}
                                                                    </div>
                                                                )}
                                                                <div className="min-h-0 overflow-y-auto pr-1">{renderCarouselBody(activeMemory)}</div>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <button type="button" onClick={() => cycleMemory(1)} className="absolute right-0 md:right-3 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/25 text-white/80 hover:bg-white/15 hover:text-white transition-colors flex items-center justify-center cursor-pointer" title="下一条">
                                                        <ChevronRightIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                {scopedMemories.length > 1 && (
                                                    <div className="mt-5 flex items-center justify-center gap-2">
                                                        {scopedMemories.map((mem, index) => (
                                                            <button key={`${mem.id}-dot`} type="button" onClick={() => setActiveMemoryIndex(index)} className={`h-1.5 rounded-full transition-all cursor-pointer ${index === currentIndex ? 'w-10 bg-white/75' : 'w-2 bg-white/25 hover:bg-white/45'}`} title={`第 ${index + 1} 条`} />
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )
                                    ) : (
                                        <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                                            {scopedMemories.length === 0 ? (
                                                <div className={`h-full min-h-[260px] rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center flex items-center justify-center ${drawerSubTextClass}`}>
                                                    这个范围还没有记忆。
                                                </div>
                                            ) : (
                                                <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-4">
                                                    {scopedMemories.map(renderMemoryCard)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </main>
                                
                                <aside className="lg:min-h-0 lg:overflow-y-auto rounded-2xl border border-white/10 bg-black/10 p-4">
                                    {viewScope === 'global' ? (
                                        <div>
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <div>
                                                    <p className={`text-xs ${drawerSubTextClass}`}>记录索引</p>
                                                    <h3 className={`text-base font-light ${drawerTextClass}`}>全局探索</h3>
                                                </div>
                                                <LeafIcon className="w-5 h-5 text-emerald-300/80" />
                                            </div>
                                            {scopedMemories.length === 0 ? (
                                                <div className={`rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-relaxed ${drawerSubTextClass}`}>
                                                    等待新的记忆在这里发芽。
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {scopedMemories.map((mem, index) => {
                                                        const isActive = index === currentIndex;
                                                        return (
                                                            <button key={`${mem.id}-index`} type="button" onClick={() => setActiveMemoryIndex(index)} className={`w-full text-left rounded-2xl border p-3 transition-all cursor-pointer ${isActive ? 'bg-white/20 border-white/35 shadow-[0_0_18px_rgba(255,255,255,0.12)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${isActive ? 'border-white/40 bg-white/15 text-white' : 'border-white/15 bg-black/15 text-white/60'}`}>
                                                                        <span className="text-xs">{index + 1}</span>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-sm truncate ${drawerTextClass}`}>{mem.title || '未命名记忆'}</p>
                                                                        <p className={`mt-1 text-[10px] ${drawerSubTextClass}`}>{formatSeedDate(getSeedDisplayDate(mem))}</p>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : exploreMode === 'private' ? (
                                        <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed ${drawerTextClass}`}>
                                            秘密探索已开启。当前只展示你的记忆记录，不生成结伴解读。
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                                <div className="flex items-center justify-between gap-3 mb-3">
                                                    <p className={`text-xs ${drawerSubTextClass}`}>地块解读</p>
                                                    {aiLoading && <span className={`text-[10px] ${drawerSubTextClass}`}>Typing...</span>}
                                                </div>
                                                {aiError && <p className="mb-3 text-[11px] text-amber-200">{aiError}</p>}
                                                {areaMemoriesForAi.length === 0 ? (
                                                    <div className={`text-sm leading-relaxed ${drawerSubTextClass}`}>
                                                        {selectedArea.name} 暂无真实记录，期待你种下这里的第一颗种子。
                                                    </div>
                                                ) : selectedAIs.length === 0 ? (
                                                    <div className={`text-sm ${drawerSubTextClass}`}>
                                                        选择至少一位探索伙伴后，会基于当前关注地块的真实记录生成解读。
                                                    </div>
                                                ) : aiLoading && aiResponses.length === 0 ? (
                                                    <div className={`text-sm ${drawerSubTextClass}`}>TA们正在读取这片地块...</div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {aiResponses.map(response => {
                                                            const ai = AI_COMPANIONS.find(item => item.id === response.roleId || item.name === response.role) || AI_COMPANIONS[0];
                                                            return (
                                                                <div key={`${response.roleId}-${response.role}`} className="flex gap-3">
                                                                    <AIAvatar id={ai.id} className="bg-black/20 border border-white/10 flex-shrink-0" iconClass={`w-5 h-5 ${ai.color}`} />
                                                                    <div className={`bg-black/20 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed ${drawerTextClass}`}>
                                                                        <p className={`text-xs mb-2 ${ai.color}`}>{ai.name}</p>
                                                                        {response.text}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* 指定角色对话区域 - 已添加清除按钮和自动滚动 */}
                                            <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                                                <div className="flex justify-between items-center mb-3">
                                                    <p className={`text-xs ${drawerSubTextClass}`}>指定角色对话</p>
                                                    <button
                                                    onClick={clearChatHistory}
                                                    className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                                                    title="清除当前角色的对话历史"
                                                >
                                                    清除历史
                                                </button>
                                                </div>
                                                <div
                                                    ref={chatMessagesContainerRef}
                                                    className="max-h-44 overflow-y-auto space-y-2 pr-1 mb-3"
                                                >
                                                    {activeAreaChatMessages.length === 0 ? (
                                                        <div className={`rounded-xl border border-dashed border-white/10 bg-white/5 p-3 text-xs leading-relaxed ${drawerSubTextClass}`}>
                                                            选择一个角色，问 TA 一个关于这片地块的问题。
                                                        </div>
                                                    ) : (
                                                        activeAreaChatMessages.map(message => {
                                                            const ai = AI_COMPANIONS.find(item => item.id === message.roleId) || AI_COMPANIONS[0];
                                                            const isUser = message.sender === 'user';
                                                            return (
                                                                <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-relaxed border ${isUser ? 'bg-white/20 border-white/20 ' + drawerTextClass : 'bg-black/25 border-white/10 ' + drawerTextClass}`}>
                                                                        {!isUser && <p className={`mb-1 ${ai.color}`}>{ai.name}</p>}
                                                                        {message.text}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                    {chatLoading && <div className={`text-xs ${drawerSubTextClass}`}>正在等待回复...</div>}
                                                </div>
                                                {chatError && <p className="mb-2 text-[11px] text-amber-200">{chatError}</p>}
                                                <form onSubmit={sendChatMessage} className="space-y-2">
                                                    <div className="relative" ref={chatRoleDropdownRef}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsChatRoleDropdownOpen(open => !open)}
                                                            className={`w-full bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-2.5 outline-none cursor-pointer flex items-center justify-between gap-2 ${drawerTextClass} focus:ring-2 focus:ring-white/50 transition-all text-xs`}
                                                            style={{
                                                                boxShadow: isChatRoleDropdownOpen
                                                                    ? '0 0 0 2px rgba(255,255,255,0.3), 0 0 0 4px rgba(255,255,255,0.1)'
                                                                    : '0 0 0 1px rgba(255,255,255,0.05)'
                                                            }}
                                                        >
                                                            <span className="flex items-center gap-2 min-w-0">
                                                                {typeof chatRole.icon === 'string' ? (
                                                                    <img src={chatRole.icon} alt={chatRole.name} className="w-7 h-7 object-contain flex-shrink-0" />
                                                                ) : (() => {
                                                                    const ChatRoleIcon = chatRole.icon;
                                                                    return (
                                                                        <span className="w-7 h-7 rounded-full flex items-center justify-center bg-black/25 border border-white/15 flex-shrink-0">
                                                                            <ChatRoleIcon className={`w-3.5 h-3.5 ${chatRole.color}`} />
                                                                        </span>
                                                                    );
                                                                })()}
                                                                <span className="truncate">与 {chatRole.name} 对话</span>
                                                            </span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 flex-shrink-0 transition-transform ${isChatRoleDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        {isChatRoleDropdownOpen && (
                                                            <div className="absolute left-0 right-0 bottom-full mb-2 z-50 bg-[rgba(90,90,82,0.85)] border border-[rgba(169,169,159,0.5)] rounded-xl shadow-[0_0_8px_rgba(169,169,159,0.25)] backdrop-blur-sm overflow-hidden dropdown-slide">
                                                                {AI_COMPANIONS.map(ai => {
                                                                    const Icon = ai.icon;
                                                                    const isImg = typeof ai.icon === 'string';
                                                                    const isSelected = chatRoleId === ai.id;
                                                                    return (
                                                                        <button
                                                                            key={ai.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setChatRoleId(ai.id);
                                                                                setIsChatRoleDropdownOpen(false);
                                                                            }}
                                                                            className={`w-full px-3 py-2.5 text-left hover:bg-white/20 transition-colors flex items-center gap-3 ${isSelected ? 'bg-white/30 text-white' : drawerTextClass}`}
                                                                        >
                                                                            {isImg ? (
                                                                                <img src={ai.icon} alt={ai.name} className="w-7 h-7 object-contain flex-shrink-0" />
                                                                            ) : (
                                                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center border flex-shrink-0 ${isSelected ? 'bg-black/30 border-white/30' : 'bg-black/20 border-white/10'}`}>
                                                                                    <Icon className={`w-3.5 h-3.5 ${ai.color}`} />
                                                                                </span>
                                                                            )}
                                                                            <span className="text-xs">{ai.name}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={chatInput}
                                                            onChange={e => setChatInput(e.target.value)}
                                                            placeholder="输入想对 TA 说的话"
                                                            className={`min-w-0 flex-1 bg-black/20 border border-white/15 rounded-xl px-3 py-2 text-xs outline-none focus:border-white/40 ${drawerTextClass}`}
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={!chatInput.trim() || chatLoading}
                                                            className={`px-3 py-2 rounded-xl border border-white/15 text-xs transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${drawerTextClass} hover:bg-white/10`}
                                                        >
                                                            发送
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </aside>
                            </div>
                        </div>
                    </>
                );
            };

            const ExploreMemoryCarouselDrawer = () => {
                const [viewScope, setViewScope] = useState('area');
                const [selectedAreaId, setSelectedAreaId] = useState((CAMPUS_AREAS[0] || UNKNOWN_AREA).id);
                const [activeMemoryIndex, setActiveMemoryIndex] = useState(0);
                const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
                const areaDropdownRef = useRef(null);
                const areaOptions = [...CAMPUS_AREAS, UNKNOWN_AREA];
                const stopDrawerEvent = (e) => e.stopPropagation();
                const drawerTextClass = 'text-white';
                const drawerSubTextClass = 'text-white/70';

                const areaCounts = useMemo(() => {
                    return memories.reduce((counts, mem) => {
                        const key = mem.areaId || UNKNOWN_AREA.id;
                        counts[key] = (counts[key] || 0) + 1;
                        return counts;
                    }, {});
                }, [memories]);

                const selectedArea = areaOptions.find(area => area.id === selectedAreaId) || UNKNOWN_AREA;
                const scopedMemories = useMemo(() => {
                    const list = viewScope === 'global'
                        ? memories
                        : memories.filter(mem => (mem.areaId || UNKNOWN_AREA.id) === selectedAreaId);
                    return [...list].sort((a, b) => {
                        const timeA = new Date(getSeedDisplayDate(a) || 0).getTime();
                        const timeB = new Date(getSeedDisplayDate(b) || 0).getTime();
                        return timeB - timeA;
                    });
                }, [memories, selectedAreaId, viewScope]);

                const visibleAreaName = viewScope === 'global' ? '全局探索' : selectedArea.name;
                const areaFocusLabel = viewScope === 'global' ? `关注：${selectedArea.name}` : selectedArea.name;
                const currentIndex = scopedMemories.length ? activeMemoryIndex % scopedMemories.length : 0;
                const activeMemory = scopedMemories[currentIndex];
                const stackedMemories = scopedMemories.filter((_, index) => index !== currentIndex).slice(0, 5);
                const stats = useMemo(() => {
                    const tags = new Set(scopedMemories.flatMap(mem => Array.isArray(mem.tags) ? mem.tags : []));
                    return {
                        total: scopedMemories.length,
                        future: scopedMemories.filter(mem => (mem.seedType || mem.type) === 'future').length,
                        images: scopedMemories.filter(mem => mem.image).length,
                        tags: tags.size
                    };
                }, [scopedMemories]);

                useEffect(() => {
                    const handleClickOutside = (event) => {
                        if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target)) {
                            setIsAreaDropdownOpen(false);
                        }
                    };
                    document.addEventListener('mousedown', handleClickOutside);
                    return () => document.removeEventListener('mousedown', handleClickOutside);
                }, []);

                useEffect(() => {
                    if (!drawerOpen) {
                        setIsAreaDropdownOpen(false);
                        return;
                    }
                    const firstAreaWithMemory = areaOptions.find(area => areaCounts[area.id] > 0) || areaOptions[0] || UNKNOWN_AREA;
                    if (!areaOptions.some(area => area.id === selectedAreaId)) setSelectedAreaId(firstAreaWithMemory.id);
                }, [drawerOpen, selectedAreaId, areaCounts]);

                useEffect(() => {
                    setActiveMemoryIndex(0);
                }, [viewScope, selectedAreaId, scopedMemories.length]);

                const cycleMemory = (direction) => {
                    if (scopedMemories.length === 0) return;
                    setActiveMemoryIndex(index => (index + direction + scopedMemories.length) % scopedMemories.length);
                };

                const renderMemoryImage = (mem, isPreview = false) => {
                    const isFuture = (mem.seedType || mem.type) === 'future';
                    const isSprouted = isFutureSeedSprouted(mem);
                    if (mem.image && (!isFuture || isSprouted)) {
                        return <img src={mem.image} className="w-full h-full object-cover" alt="Memory Attachment" />;
                    }
                    return (
                        <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(125,211,252,0.22),rgba(15,23,42,0.42)_54%,rgba(0,0,0,0.22))]">
                            {!isPreview && <ImageIcon className="w-10 h-10 text-white/35" />}
                        </div>
                    );
                };

                const renderMemoryBody = (mem) => {
                    const isFuture = (mem.seedType || mem.type) === 'future';
                    if (isFuture && !isFutureSeedSprouted(mem)) {
                        return <p className={`text-sm leading-relaxed ${drawerSubTextClass}`}>这颗未来种子尚未萌发，暂时隐藏正文。</p>;
                    }
                    return <p className={`text-sm md:text-base leading-relaxed ${drawerTextClass}`}>{mem.text || mem.content || '这条记忆只有图像或标签。'}</p>;
                };

                return (
                    <>
                        <style>{`
                            .dropdown-slide { animation: dropdownFadeIn 0.2s ease-out; }
                            @keyframes dropdownFadeIn {
                                from { opacity: 0; transform: translateY(-8px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                        <div
                            className={`fixed inset-y-4 left-4 right-4 mx-auto w-auto max-w-[1180px] z-40 ${glassClass} border border-white/20 rounded-[28px] p-6 md:p-8 flex flex-col drawer-premium shadow-[0_30px_90px_rgba(0,0,0,0.45)] ${drawerOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-[120vw] pointer-events-none'}`}
                            onClick={stopDrawerEvent}
                            onWheel={stopDrawerEvent}
                            onMouseDown={stopDrawerEvent}
                            onMouseMove={stopDrawerEvent}
                            onMouseUp={stopDrawerEvent}
                            onPointerDown={stopDrawerEvent}
                            onPointerMove={stopDrawerEvent}
                            onPointerUp={stopDrawerEvent}
                            onContextMenu={stopDrawerEvent}
                        >
                            <div className={`flex justify-between items-center mb-6 content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 translate-x-12'}`}>
                                <div>
                                    <h2 className={`text-2xl font-light ${drawerTextClass}`}>地块探索</h2>
                                    <p className={`text-xs mt-1 ${drawerSubTextClass}`}>{visibleAreaName} · {areaFocusLabel} · {scopedMemories.length} 条记录</p>
                                </div>
                                <button onClick={() => setDrawerOpen(false)} className={`p-2 rounded-full hover:bg-white/10 ${drawerTextClass} transition-colors cursor-pointer`} title="关闭探索">
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className={`grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_250px] gap-5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden content-stagger ${drawerOpen ? 'opacity-100 translate-x-0 delay-200' : 'opacity-0 translate-x-12'}`}>
                                <aside className="lg:min-h-0 lg:overflow-y-auto rounded-2xl border border-white/10 bg-black/10 p-4">
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <button onClick={() => setViewScope('global')} className={`py-2 rounded-full text-sm border transition-colors cursor-pointer ${viewScope === 'global' ? 'bg-white/20 border-white/40 ' + drawerTextClass : 'bg-black/10 border-white/10 ' + drawerSubTextClass}`}>全局</button>
                                        <button onClick={() => setViewScope('area')} className={`py-2 rounded-full text-sm border transition-colors cursor-pointer ${viewScope === 'area' ? 'bg-white/20 border-white/40 ' + drawerTextClass : 'bg-black/10 border-white/10 ' + drawerSubTextClass}`}>局部</button>
                                    </div>

                                    <div className="relative" ref={areaDropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsAreaDropdownOpen(open => !open)}
                                            className={`w-full bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 pr-4 outline-none cursor-pointer flex items-center justify-between gap-3 ${drawerTextClass} focus:ring-2 focus:ring-white/50 transition-all`}
                                        >
                                            <span className="truncate">{selectedArea.name} ({areaCounts[selectedArea.id] || 0})</span>
                                            <ChevronRightIcon className={`w-4 h-4 flex-shrink-0 transition-transform ${isAreaDropdownOpen ? 'rotate-90' : ''}`} />
                                        </button>

                                        {isAreaDropdownOpen && (
                                            <div className="absolute left-0 right-0 mt-2 z-50 bg-[rgba(90,90,82,0.85)] border border-[rgba(169,169,159,0.5)] rounded-xl shadow-[0_0_8px_rgba(169,169,159,0.25)] backdrop-blur-sm overflow-hidden dropdown-slide">
                                                {areaOptions.map(area => (
                                                    <button
                                                        key={area.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedAreaId(area.id);
                                                            setIsAreaDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-3 text-left hover:bg-white/20 transition-colors flex items-center justify-between gap-3 ${selectedAreaId === area.id ? 'bg-white/30 text-white' : drawerTextClass}`}
                                                    >
                                                        <span className="truncate">{area.name}</span>
                                                        <span className="text-xs text-white/60 flex-shrink-0">{areaCounts[area.id] || 0} 条</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 my-4">
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                                            <p className={`text-[10px] ${drawerSubTextClass}`}>记录</p>
                                            <p className={`text-xl font-light ${drawerTextClass}`}>{stats.total}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                                            <p className={`text-[10px] ${drawerSubTextClass}`}>未来</p>
                                            <p className={`text-xl font-light ${drawerTextClass}`}>{stats.future}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                                            <p className={`text-[10px] ${drawerSubTextClass}`}>图像</p>
                                            <p className={`text-xl font-light ${drawerTextClass}`}>{stats.images}</p>
                                        </div>
                                        <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
                                            <p className={`text-[10px] ${drawerSubTextClass}`}>标签</p>
                                            <p className={`text-xl font-light ${drawerTextClass}`}>{stats.tags}</p>
                                        </div>
                                    </div>

                                    {activeMemory && (
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className={`text-[10px] mb-2 ${drawerSubTextClass}`}>当前</p>
                                            <p className={`text-sm font-medium ${drawerTextClass}`}>{currentIndex + 1} / {scopedMemories.length}</p>
                                            <p className={`mt-2 text-xs leading-relaxed ${drawerSubTextClass}`}>{activeMemory.title || '未命名记忆'}</p>
                                        </div>
                                    )}
                                </aside>

                                <main className="min-h-[440px] lg:min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-black/10 p-4 md:p-5 flex flex-col">
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div>
                                            <p className={`text-xs ${drawerSubTextClass}`}>记忆记录</p>
                                            <h3 className={`text-lg font-light ${drawerTextClass}`}>{visibleAreaName}</h3>
                                            {viewScope === 'global' && <p className={`text-xs mt-1 ${drawerSubTextClass}`}>{areaFocusLabel}</p>}
                                        </div>
                                        <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs ${drawerSubTextClass}`}>{viewScope === 'global' ? '全局' : '局部'}</span>
                                    </div>

                                    {scopedMemories.length === 0 ? (
                                        <div className={`flex-1 min-h-[260px] rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center flex items-center justify-center ${drawerSubTextClass}`}>
                                            这个范围还没有记忆。
                                        </div>
                                    ) : (
                                        <div className="relative flex-1 min-h-[360px] flex items-center justify-center px-12 md:px-16">
                                            <button type="button" onClick={() => cycleMemory(-1)} className="absolute left-0 md:left-3 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/25 text-white/80 hover:bg-white/15 hover:text-white transition-colors flex items-center justify-center cursor-pointer" title="上一条">
                                                <ChevronLeftIcon className="w-5 h-5" />
                                            </button>

                                            <div className="relative w-full max-w-[520px] h-[420px]">
                                                {stackedMemories.map((mem, layer) => {
                                                    const side = layer % 2 === 0 ? -1 : 1;
                                                    const depth = Math.floor(layer / 2) + 1;
                                                    return (
                                                        <div
                                                            key={`${mem.id}-stack-${layer}`}
                                                            aria-hidden="true"
                                                            className="absolute inset-0 rounded-[26px] overflow-hidden border border-white/15 bg-black/25 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                                                            style={{
                                                                transform: `translateX(${side * (34 + depth * 22)}px) translateY(${depth * 8}px) rotate(${side * (5 + depth * 2)}deg) scale(${1 - depth * 0.045})`,
                                                                opacity: Math.max(0.22, 0.62 - layer * 0.09),
                                                                zIndex: 4 - layer
                                                            }}
                                                        >
                                                            <div className="h-full opacity-65">{renderMemoryImage(mem, true)}</div>
                                                            <div className="absolute inset-0 bg-black/35"></div>
                                                        </div>
                                                    );
                                                })}

                                                <article className="absolute inset-0 z-10 rounded-[28px] overflow-hidden border border-white/25 bg-black/35 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
                                                    <div className="h-[46%] border-b border-white/10 bg-black/20 overflow-hidden">{renderMemoryImage(activeMemory)}</div>
                                                    <div className="h-[54%] p-5 md:p-6 flex flex-col">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <div className="min-w-0">
                                                                <h3 className={`text-xl font-light truncate ${drawerTextClass}`}>{activeMemory.title || '未命名记忆'}</h3>
                                                                <div className={`mt-2 text-xs flex flex-wrap items-center gap-2 ${drawerSubTextClass}`}>
                                                                    <span className="inline-flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {formatSeedDate(getSeedDisplayDate(activeMemory))}</span>
                                                                    <span className="inline-flex items-center gap-1"><CompassIcon className="w-3 h-3" /> {activeMemory.areaName || UNKNOWN_AREA.name}</span>
                                                                </div>
                                                            </div>
                                                            <span className={`text-[10px] px-2 py-1 rounded-full bg-white/10 ${drawerSubTextClass}`}>
                                                                {(activeMemory.seedType || activeMemory.type) === 'future' ? (isFutureSeedSprouted(activeMemory) ? '已萌发' : '未来') : '记忆'}
                                                            </span>
                                                        </div>

                                                        {activeMemory.tags && activeMemory.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                                {activeMemory.tags.map(t => <span key={t} className={`text-[10px] px-2 py-0.5 rounded border border-white/20 ${drawerSubTextClass}`}>{t}</span>)}
                                                            </div>
                                                        )}

                                                        <div className="min-h-0 overflow-y-auto pr-1">{renderMemoryBody(activeMemory)}</div>
                                                    </div>
                                                </article>
                                            </div>

                                            <button type="button" onClick={() => cycleMemory(1)} className="absolute right-0 md:right-3 z-20 w-11 h-11 rounded-full border border-white/20 bg-black/25 text-white/80 hover:bg-white/15 hover:text-white transition-colors flex items-center justify-center cursor-pointer" title="下一条">
                                                <ChevronRightIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}

                                    {scopedMemories.length > 1 && (
                                        <div className="mt-5 flex items-center justify-center gap-2">
                                            {scopedMemories.map((mem, index) => (
                                                <button key={`${mem.id}-dot`} type="button" onClick={() => setActiveMemoryIndex(index)} className={`h-1.5 rounded-full transition-all cursor-pointer ${index === currentIndex ? 'w-10 bg-white/75' : 'w-2 bg-white/25 hover:bg-white/45'}`} title={`第 ${index + 1} 条`} />
                                            ))}
                                        </div>
                                    )}
                                </main>

                                <aside className="lg:min-h-0 lg:overflow-y-auto rounded-2xl border border-white/10 bg-black/10 p-4">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div>
                                            <p className={`text-xs ${drawerSubTextClass}`}>记录索引</p>
                                            <h3 className={`text-base font-light ${drawerTextClass}`}>{visibleAreaName}</h3>
                                        </div>
                                        <LeafIcon className="w-5 h-5 text-emerald-300/80" />
                                    </div>

                                    {scopedMemories.length === 0 ? (
                                        <div className={`rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-relaxed ${drawerSubTextClass}`}>
                                            等待新的记忆在这里发芽。
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {scopedMemories.map((mem, index) => {
                                                const isActive = index === currentIndex;
                                                return (
                                                    <button key={`${mem.id}-index`} type="button" onClick={() => setActiveMemoryIndex(index)} className={`w-full text-left rounded-2xl border p-3 transition-all cursor-pointer ${isActive ? 'bg-white/20 border-white/35 shadow-[0_0_18px_rgba(255,255,255,0.12)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${isActive ? 'border-white/40 bg-white/15 text-white' : 'border-white/15 bg-black/15 text-white/60'}`}>
                                                                <span className="text-xs">{index + 1}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className={`text-sm truncate ${drawerTextClass}`}>{mem.title || '未命名记忆'}</p>
                                                                <p className={`mt-1 text-[10px] ${drawerSubTextClass}`}>{formatSeedDate(getSeedDisplayDate(mem))}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </aside>
                            </div>
                        </div>
                    </>
                );
            };

            return (
                <div className="w-screen h-screen overflow-hidden bg-[#0A0F1A] relative" onWheel={handleWheel}>
                    
                    {/* 修复：已将 ref={mapRef} 重新绑定给地图容器，右键播种菜单全面复活 */}
                    <div 
                        ref={mapRef}
                        className={`absolute origin-top-left will-change-transform cursor-grab ${isDragging ? 'active:cursor-grabbing' : ''}`}
                        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onContextMenu={handleContextMenu}
                        style={{ 
                            width: MAP_WIDTH, height: MAP_HEIGHT,
                            transform: `translate(${mapState.x}px, ${mapState.y}px) scale(${mapState.scale})`,
                            opacity: isDragging ? 0.8 : 1, transition: 'opacity 0.3s'
                        }}
                    >
                        <img 
                            src={theme === 'day' ? dayMapUrl : nightMapUrl} 
                            alt="Campus Map" 
                            className="w-full h-full pointer-events-none map-layer"
                            onError={(e) => {
                                if(theme === 'night') {
                                    e.target.src = dayMapUrl;
                                    e.target.classList.add('map-night-filter');
                                } else {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.style.background = 'linear-gradient(to bottom right, #0B1120, #0A1C14)';
                                    e.target.parentNode.style.backgroundImage = 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)';
                                    e.target.parentNode.style.backgroundSize = '40px 40px';
                                }
                            }}
                            onLoad={(e) => {
                                if(theme === 'day' || !e.target.src.includes(dayMapUrl)) {
                                    e.target.classList.remove('map-night-filter');
                                }
                            }}
                        />
                        
                        <div 
                            className="absolute inset-0 w-full h-full"
                            style={{ 
                                transform: theme === 'night'
                                    ? `translate(${NIGHT_OFFSET_X}px, ${NIGHT_OFFSET_Y}px)`
                                    : 'none', 
                                transition: 'transform 0.8s ease',
                                pointerEvents: 'none' 
                            }}
                        >
                            <AreaPolygons />
                            {clusters.map((cluster, i) => renderSeedMarker(cluster, i))}
                        </div>
                    </div>

                    <button 
                        onClick={() => setModal('manual')}
                        className={`absolute top-6 left-6 px-5 py-3 ${glassClass} holo-capsule flex items-center gap-3 z-30 pointer-events-auto hover:scale-105 hover:bg-white/10 transition-all cursor-pointer`}
                    >
                        <BookIcon className={`w-4 h-4 ${theme === 'night' ? 'text-purple-400' : 'text-slate-600'}`} />
                        <h1 className={`font-medium tracking-widest text-sm ${textClass}`}>播种说明书</h1>
                    </button>

                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-30 pointer-events-auto">
                        <button onClick={() => setDrawerOpen(true)} className={`p-4 ${glassClass} rounded-2xl hover:scale-105 transition-transform group`} title="探索">
                            <CompassIcon className={`${textClass} group-hover:text-purple-400 transition-colors`} />
                        </button>
                        <button onClick={() => setModal('schedule')} className={`p-4 ${glassClass} rounded-2xl hover:scale-105 transition-transform group`} title="日程与课程">
                            <CalendarIcon className={`${textClass} group-hover:text-cyan-300 transition-colors`} />
                        </button>
                        <div className={`flex flex-col ${glassClass} rounded-2xl overflow-hidden`}>
                            <button onClick={() => setMapState(p => {
                                const W = window.innerWidth, H = window.innerHeight;
                                const minScale = Math.max(W / MAP_WIDTH, H / MAP_HEIGHT);
                                const newScale = Math.min(p.scale + 0.2, minScale * 4);
                                const mx = (W / 2 - p.x) / p.scale;
                                const my = (H / 2 - p.y) / p.scale;
                                return clampMapState({ scale: newScale, x: W / 2 - mx * newScale, y: H / 2 - my * newScale });
                            })} className={`p-4 hover:bg-white/10 ${textClass}`}><PlusIcon/></button>
                            <div className="h-[1px] w-full bg-white/10 shadow-inner"></div>
                            <button onClick={() => setMapState(p => {
                                const W = window.innerWidth, H = window.innerHeight;
                                const minScale = Math.max(W / MAP_WIDTH, H / MAP_HEIGHT);
                                const newScale = Math.max(minScale, p.scale - 0.2);
                                const mx = (W / 2 - p.x) / p.scale;
                                const my = (H / 2 - p.y) / p.scale;
                                return clampMapState({ scale: newScale, x: W / 2 - mx * newScale, y: H / 2 - my * newScale });
                            })} className={`p-4 hover:bg-white/10 ${textClass}`}><MinusIcon/></button>
                        </div>
                        <button onClick={() => setTheme(t => t === 'night' ? 'day' : 'night')} className={`p-4 ${glassClass} rounded-2xl hover:scale-105 transition-transform`} title="昼夜全息切换">
                            <SparklesIcon className={theme === 'night' ? 'text-purple-400' : 'text-amber-500'} />
                        </button>
                    </div>

                    <div
                        className="absolute z-30 pointer-events-auto reminder-whale-dock"
                        style={{ left: reminderWhalePosition.x, top: reminderWhalePosition.y }}
                    >
                        {reminderPanelOpen && (
                            <div className={`absolute right-0 ${reminderWhalePosition.y < 300 ? 'top-full mt-3' : 'bottom-full mb-3'} w-[300px] max-h-[260px] overflow-y-auto px-4 py-3 ${glassClass} rounded-2xl rounded-br-sm text-sm ${textClass} transition-all`}>
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <p className="font-medium">提醒</p>
                                    {petAlert && <button onClick={acknowledgeAllReminders} className="text-xs opacity-60 hover:opacity-100">我知道了</button>}
                                </div>
                                {petAlert ? (
                                    <div className="space-y-2">
                                        {activeReminderEvents.map(event => (
                                            <div key={event.id} className="rounded-xl border border-white/10 bg-black/10 p-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm">{event.title}</p>
                                                        <p className={`text-xs mt-1 ${subTextClass}`}>{event.message}</p>
                                                    </div>
                                                    <button onClick={() => acknowledgeReminder(event.id)} className="text-[11px] whitespace-nowrap opacity-60 hover:opacity-100">我知道了</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={`text-xs leading-relaxed ${subTextClass}`}>当前没有待处理提醒。</p>
                                )}
                            </div>
                        )}
                        <button
                            type="button"
                            className="reminder-whale-button cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                            onPointerDown={handleReminderWhalePointerDown}
                            onPointerMove={handleReminderWhalePointerMove}
                            onPointerUp={handleReminderWhalePointerUp}
                            onPointerCancel={handleReminderWhalePointerCancel}
                            onClick={handleReminderWhaleClick}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setReminderContextMenu({ x: e.clientX, y: e.clientY });
                            }}
                            title={petAlert ? `${activeReminderEvents.length} 条提醒` : '暂无提醒'}
                        >
                            <ReminderWhale alert={petAlert} />
                        </button>
                    </div>

                    {reminderContextMenu && (
                        <div className={`fixed z-50 py-2 flex flex-col ${glassClass} rounded-2xl min-w-[140px]`} style={{ left: reminderContextMenu.x, top: reminderContextMenu.y }}>
                            <button
                                className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${petAlert ? textClass : subTextClass}`}
                                onClick={acknowledgeAllReminders}
                                disabled={!petAlert}
                            >
                                我知道了
                            </button>
                            <button className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${subTextClass}`} onClick={() => setReminderContextMenu(null)}>取消</button>
                        </div>
                    )}

                    {contextMenu && (
                        <div className={`fixed z-50 py-2 flex flex-col ${glassClass} rounded-2xl min-w-[120px]`} style={{ left: contextMenu.x, top: contextMenu.y }}>
                            {contextMenu.type === 'map' ? (
                                <>
                                    <button className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${textClass}`} onClick={() => { setModal('plant'); setContextMenu(null); }}>播种记忆</button>
                                    <button className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${subTextClass}`} onClick={() => setContextMenu(null)}>取消</button>
                                </>
                            ) : (
                                <>
                                    <button className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors text-purple-400`} onClick={() => { setModal('harvest'); setContextMenu(null); }}>收获记录</button>
                                    <button className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${textClass}`} onClick={() => { setModal('plant'); setContextMenu(null); }}>继续播种</button>
                                    <button className={`px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${subTextClass}`} onClick={() => setContextMenu(null)}>取消</button>
                                </>
                            )}
                        </div>
                    )}

                    {contextMenu && <div className="fixed inset-0 z-40" onMouseDownCapture={() => setContextMenu(null)}></div>}
                    {reminderContextMenu && <div className="fixed inset-0 z-40" onMouseDownCapture={() => setReminderContextMenu(null)}></div>}

                    {modal === 'plant' && <PlantModal />}
                    {modal === 'harvest' && <HarvestModal />}
                    {modal === 'manual' && <ManualModal />}
                    {modal === 'schedule' && <ScheduleModal />}
                    <ExploreDrawerV2 />
                    
                    <div className={`fixed inset-0 bg-black/40 pointer-events-none transition-opacity duration-500 z-30 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>
            );
        }
export default CampusMemoryMap;



