export const MAP_WIDTH = 1536;
export const MAP_HEIGHT = 1024;
// 夜间底图与日间底图尺寸/构图不同，overlay 需平移才能与夜图对齐（相对 1536×1024 坐标系）
export const NIGHT_OFFSET_X = 4;
export const NIGHT_OFFSET_Y = 35;
export const NIGHT_SCALE = 1.05;     

export const CAMPUS_AREAS = [
  { id: 'south-dorms', name: '南园宿舍区', polygon: [[957, 699], [1218, 700], [1246, 1002], [968, 1000], [968, 878], [1096, 878], [1096, 747], [963, 747]] },
  { id: 'teaching-supermarket-canteen', name: '教超-驿站-食堂', polygon: [[963, 747], [1096, 747], [1096, 878], [968, 878]] },
  { id: 'north-teaching-area', name: '北园教学区', polygon: [[708, 422], [873, 414], [987, 407], [997, 468], [1049, 467], [1045, 434], [1166, 422], [1218, 700], [957, 699], [697, 700]] },
  { id: 'north-building-surroundings', name: '北大楼周边', polygon: [[867, 272], [945, 262], [1126, 247], [1166, 422], [1045, 434], [1049, 467], [997, 468], [987, 407], [873, 414]] },
  { id: 'playground-gym', name: '操场-体育馆', polygon: [[723, 216], [936, 191], [945, 262], [867, 272], [873, 414], [708, 422]] },
  { id: 'yifu-fei-buildings', name: '逸夫馆-费楼', polygon: [[619, 98], [825, 105], [828, 202], [723, 216], [708, 422], [610, 426], [612, 351], [595, 214]] }
];

export const UNKNOWN_AREA = { id: 'unknown', name: '校园外' };

export const PRESET_TAGS = ['期末', '初见', '毕业', '雨天'];
export const DATE_MIN = '2026-05-01';
export const DATE_MAX = '2033-05-01';
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
