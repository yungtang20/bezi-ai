// src/data/healthRemedies.ts

export interface HealthRemedy {
  element: string;           // 五行
  organs: string;            // 對應器官
  weakSymptoms: string;      // 太弱症狀
  excessSymptoms: string;    // 太旺症狀
  colors: string;            // 補運色彩
  direction: string;         // 補運方位
  action: string;            // 補運方法
  avoid: string;             // 避免事項
  zodiacItems: string;       // 開運小物
}

export const healthRemedies: HealthRemedy[] = [
  {
    element: "金",
    organs: "呼吸道（肺、支氣管、大腸、皮膚）",
    weakSymptoms: "過敏體質（鼻子/皮膚過敏、氣管虛、注意大腸長息肉）",
    excessSymptoms: "呼吸道、大腸、肺部、皮膚症狀",
    colors: "金、銀、白、灰",
    direction: "西方",
    action: "多泡熱水澡、游泳、泡SPA池。外出戴口罩。※避免泡溫泉（地熱、火）",
    avoid: "不宜紅、橘、黃、土色。不宜熱帶國家。",
    zodiacItems: "鼠、猴、龍、雞、牛（金屬/鋼製材質）。飾品：金飾、銀飾"
  },
  {
    element: "木",
    organs: "肝、膽、四肢（手腳）",
    weakSymptoms: "肝膽問題，易疲勞、體力差、恢復慢、手腳僵硬、四肢易扭傷",
    excessSymptoms: "肝膽問題，易疲勞、體力差、恢復慢",
    colors: "黑、綠、藍、淡綠",
    direction: "東方",
    action: "多種植物、親近大自然。多泡熱水澡、游泳。※避免泡溫泉",
    avoid: "不宜紅、橘、黃、土色。不宜熱帶國家。不宜配戴金。",
    zodiacItems: "鼠、龍、虎、兔、羊、豬（木頭材質）。木頭串珠、木製家具"
  },
  {
    element: "水",
    organs: "腎臟、膀胱、泌尿、血液循環、淋巴、婦科",
    weakSymptoms: "腎臟、婦科、泌尿系統問題。女：婦科問題（經期不順、難受孕、子宮、卵巢、乳房）；男：前列腺、腎功能、攝護腺、循環系統（甲狀腺、淋巴）",
    excessSymptoms: "腎臟、泌尿、代謝差、易水腫、疲倦、身體沉重",
    colors: "藍、黑、白、灰",
    direction: "北方",
    action: "多喝水、勿憋尿。多泡熱水澡、游泳。女性戒冰飲，多泡腳。※避免泡溫泉",
    avoid: "不宜紅、橘、黃、綠。不宜熱帶國家。",
    zodiacItems: "鼠、牛、龍、猴、雞、豬（金屬/鋼製材質）。飾品：金飾、銀飾"
  },
  {
    element: "火",
    organs: "心臟、心血管系統、眼睛",
    weakSymptoms: "心臟無力、血壓低/高、視力狀況。易貧血、頭暈、手腳冰冷、眼部病變",
    excessSymptoms: "易發炎、發燒、身體燥熱",
    colors: "紅、橘、黃、綠",
    direction: "南方",
    action: "多曬太陽、戶外運動。多泡硫磺型溫泉（立冬~立春）。有氧運動增強心肺",
    avoid: "不宜黑、藍、白、灰。不宜北方、寒帶國家。少游泳、泡澡（僅熱帶國家可玩水）",
    zodiacItems: "虎、兔、蛇、馬、羊、狗（木頭材質）。飾品：珊瑚、琥珀、玉石、蜜蠟、木頭串珠"
  },
  {
    element: "土",
    organs: "脾胃（腸胃消化系統）",
    weakSymptoms: "脾胃消化差、胃痛腹瀉、腸胃吸收消化差、吃不胖、易胃痛",
    excessSymptoms: "身體易長異物（瘤、息肉、結石）",
    colors: "紅、橘、黃、土、咖啡",
    direction: "南方",
    action: "多曬太陽、戶外運動、多踩土地。多泡硫磺型溫泉。接觸小狗。飲食清淡、定時定量",
    avoid: "不宜黑、白、灰、藍、綠。不宜北方、寒帶國家。少游泳、泡澡。拒生冷食物、暴飲暴食",
    zodiacItems: "虎、馬、狗、牛、蛇、羊、龍（玉石、瓷器、陶土材質）。飾品：珊瑚、琥珀、玉石、蜜蠟、水晶"
  }
];

// 輔助查詢函式
export function getHealthRemedy(element: string): HealthRemedy | undefined {
  return healthRemedies.find(r => r.element === element);
}
