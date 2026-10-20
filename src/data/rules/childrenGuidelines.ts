export const CHILDREN_GUIDELINES = {
  rules: {
    male: '男：官殺「透干」之流年，或地支主氣為官殺之流年。',
    female: '女：食傷「透干」之流年，或地支主氣為食傷之流年。',
  },
  timingTable: [
    { dayMaster: '木', gender: '女', childElement: '火', stems: '丙、丁', branches: '巳(蛇)、午(馬)' },
    { dayMaster: '木', gender: '男', childElement: '金', stems: '庚、辛', branches: '申(猴)、酉(雞)' },
    { dayMaster: '火', gender: '女', childElement: '土', stems: '戊、己', branches: '辰(龍)、戌(狗)、丑(牛)、未(羊)' },
    { dayMaster: '火', gender: '男', childElement: '水', stems: '壬、癸', branches: '亥(豬)、子(鼠)' },
    { dayMaster: '土', gender: '女', childElement: '金', stems: '庚、辛', branches: '申(猴)、酉(雞)' },
    { dayMaster: '土', gender: '男', childElement: '木', stems: '甲、乙', branches: '寅(虎)、卯(兔)' },
    { dayMaster: '金', gender: '女', childElement: '水', stems: '壬、癸', branches: '亥(豬)、子(鼠)' },
    { dayMaster: '金', gender: '男', childElement: '火', stems: '丙、丁', branches: '巳(蛇)、午(馬)' },
    { dayMaster: '水', gender: '女', childElement: '木', stems: '甲、乙', branches: '寅(虎)、卯(兔)' },
    { dayMaster: '水', gender: '男', childElement: '土', stems: '戊、己', branches: '辰(龍)、戌(狗)、丑(牛)、未(羊)' },
  ],
  cSectionIndicators: [
    '女生命盤時支與日支/月支相刑/相沖 (例如：時柱丑、日柱未，形成丑戌未相刑)',
    '女生命盤時支與流年地支相刑/相沖 (例如：時柱卯，酉年生產，形成卯酉相沖)'
  ],
  goodBirthDays: [
    '產婦平安之流日：流日（天干地支）不與產婦日柱/生肖相沖',
    '八字五行平衡日：挑選五行較平衡之流日，避免極端能量'
  ]
};
