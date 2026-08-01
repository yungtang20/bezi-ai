export interface HealthRemedy {
  element: string;
  organs: string;
  weakSymptoms: string;
  excessSymptoms: string;
}

// [AI MOD] 五行健康補運資料（來源：八字命理與健康風水知識整合手冊）
export const healthRemedies: HealthRemedy[] = [
  {
    element: '金',
    organs: '呼吸道、肺、大腸與皮膚',
    weakSymptoms: '防範鼻子皮膚過敏、感冒不癒與大腸息肉',
    excessSymptoms: '呼吸道、肺部、過敏',
  },
  {
    element: '木',
    organs: '肝、膽、四肢手腳',
    weakSymptoms: '切勿熬夜、保護肝膽；防止手腳關節僵硬與扭傷',
    excessSymptoms: '肝膽、外傷、關節易受影響',
  },
  {
    element: '水',
    organs: '腎臟、膀胱、泌尿及內分泌',
    weakSymptoms: '每天必須保持充足的飲水量，切勿憋尿；多泡足浴促進下半身血液循環，預防女性經期不順',
    excessSymptoms: '泌尿、婦科、腎功能需多注意',
  },
  {
    element: '火',
    organs: '心臟、心血管與眼睛',
    weakSymptoms: '多吃紅蘿蔔、枸杞、紅色食物；避免眼睛乾澀疲勞、視力模糊及眼部病變',
    excessSymptoms: '心血管、眼疾加重',
  },
  {
    element: '土',
    organs: '脾胃、腸胃消化系統',
    weakSymptoms: '保護脾胃；以防消化不良、胃痛胃脹與腹瀉',
    excessSymptoms: '脾胃、消化狀況易浮現',
  },
];

export function getHealthRemedy(element: string): HealthRemedy | undefined {
  return healthRemedies.find(r => r.element === element);
}
