export interface CareerMapping {
  tenGodType: string;
  tenGodName: string;
  suitableCareers: string;
  wealthStyle: string;
  partnerAdvice: string;
}

export const wealthCareers: CareerMapping[] = [
  {
    tenGodType: '財星',
    tenGodName: '正財',
    suitableCareers: '金融理財、會計、公務員、傳統產業、民生必需品業。',
    wealthStyle: '一步一腳印，穩定累積，以穩定薪水、儲蓄、保守理財為主。薪水、利息等固定收益。',
    partnerAdvice: '適合尋求能帶來穩定結構的專業人士（如官殺或印星強者）。'
  },
  {
    tenGodType: '財星',
    tenGodName: '偏財',
    suitableCareers: '業務銷售、貿易、投資理財、公關、跨國企業、創業。',
    wealthStyle: '眼光精準，善於理財與投資，對數字敏感，喜歡以較大的槓桿或多元投資獲取財富。',
    partnerAdvice: '適合尋求管理與風險控管能力強的對象合作。'
  },
  {
    tenGodType: '食傷',
    tenGodName: '食神',
    suitableCareers: '餐飲服務、教育培訓、諮詢策劃、藝術創作、文化事業。',
    wealthStyle: '才華洋溢，靠專業技能、口才及口碑賺錢，和氣生財。',
    partnerAdvice: '適合尋找執行力強或能落實想法的夥伴。'
  },
  {
    tenGodType: '食傷',
    tenGodName: '傷官',
    suitableCareers: '設計創意、演藝娛樂、研發創新、高新科技、自由業。',
    wealthStyle: '創新點子多，敢於挑戰傳統，靠獨特創意及技術帶來爆發性收入。',
    partnerAdvice: '適合尋找守規矩且能處理繁瑣細節的合夥人。'
  },
  {
    tenGodType: '印星',
    tenGodName: '正印',
    suitableCareers: '教育學術、慈善事業、宗教、行政管理、圖書出版。',
    wealthStyle: '以名望、知識和資歷帶來財富，多為細水長流型的收入。',
    partnerAdvice: '適合與擁有資源分配能力和執行力的事業夥伴合作。'
  },
  {
    tenGodType: '印星',
    tenGodName: '偏印',
    suitableCareers: '命理玄學、心理諮商、醫療衛生、偏門專業技術。',
    wealthStyle: '憑藉專業性強、冷門的獨門絕活或敏銳的洞察力獲得財富。',
    partnerAdvice: '適合尋找擅長公關、能將專業轉化為商機的對象。'
  },
  {
    tenGodType: '官殺',
    tenGodName: '正官',
    suitableCareers: '政府機關、大型企業管理、法律司法、政界。',
    wealthStyle: '藉由權力地位、組織職位的晉升而自然伴隨而來的財富。',
    partnerAdvice: '適合尋找能承擔壓力並敢於開創的夥伴。'
  },
  {
    tenGodType: '官殺',
    tenGodName: '七殺',
    suitableCareers: '軍警檢調、運動競技、開拓型事業、風險較高的職業。',
    wealthStyle: '具備冒險精神，常在危機中創造財富，富貴險中求。',
    partnerAdvice: '合夥人需具備冷靜分析且能包容其剛烈脾氣的特質。'
  },
  {
    tenGodType: '比劫',
    tenGodName: '比肩',
    suitableCareers: '合夥創業、連鎖經營、獨立工作者、專業個人工作室。',
    wealthStyle: '靠自己努力、腳踏實地，且多能因朋友、同行、人脈相助而獲利。',
    partnerAdvice: '需注意利益分配，最好合夥前白紙黑字明確規定。'
  },
  {
    tenGodType: '比劫',
    tenGodName: '劫財',
    suitableCareers: '競爭激烈的行業、直銷保險、代理商、交際公關。',
    wealthStyle: '善於運用他人資源，借力使力，但也常因人際交往而產生大筆開銷。',
    partnerAdvice: '需慎選合作對象，最好找能理性控管財務的夥伴。'
  }
];

export function getWealthCareer(maxGod: string, secGod: string | null): CareerMapping | undefined {
  const baseCareer = wealthCareers.find(wc => wc.tenGodName === maxGod);
  if (!baseCareer) return undefined;

  if (!secGod) return baseCareer;

  const typeMap: Record<string, string> = {
    '正財': '財', '偏財': '財',
    '正官': '官殺', '七殺': '官殺',
    '正印': '印星', '偏印': '印星',
    '食神': '食傷', '傷官': '食傷',
    '比肩': '比劫', '劫財': '比劫',
  };

  const t1 = typeMap[maxGod];
  const t2 = typeMap[secGod];

  if (!t1 || !t2 || t1 === t2) return baseCareer;

  const comboKey = `${t1} x ${t2}`;
  const comboDict: Record<string, string> = {
    '財 x 食傷': '以技術專業、創意、表達得財，非貨物貿易。創意型：設計、企劃、教育。溝通型：諮詢、仲介、業務、服務。',
    '財 x 官殺': '若創業宜 B2B、與政府往來、例：批發、工程建設、原材料。不適合做零售。大企業則易升官。',
    '財 x 印星': '繼承家族企業、祖產、善讀書、適合醫療產業。',
    '財 x 比劫': '團隊工作、連結人脈得財。例：獅子會、扶輪社、商會、仲介。',
    '官殺 x 財': '適合在大公司主責財務。創業者適合 B2B 生意，如批發、代理。不適合 B2C。',
    '官殺 x 食傷': '適合在大公司擔任領導職、策略規劃角色。',
    '官殺 x 印星': '長輩緣佳，使命必達。適合特助、大公司內勤、人資、行政倉管。',
    '官殺 x 比劫': '適合在大公司內帶領團隊。',
    '食傷 x 財': '技術、服務、創意、溝通得分。例：諮詢、仲介、業務、服務、翻譯。',
    '食傷 x 官殺': '領導風格鮮明，適合在大公司擔任領導者、負責策略規劃。',
    '食傷 x 印星': '耐性佳、擅多方溝通，適合有完善 SOP 的工作。例：客服、倉管物流、設計、企劃。',
    '食傷 x 比劫': '溝通協調、人脈經營型。例：專案管理、商會。收入以人脈支撐為主。',
    '印星 x 財': '適合從醫、醫療產業。',
    '印星 x 官殺': '任職大公司、擔任管理職。例：內勤部門主管、公關、特助。',
    '印星 x 食傷': '適合有完整 SOP 的工作。例：供應鏈、物流、倉儲、客服。',
    '印星 x 比劫': '重視公私界線、作息穩定。例：營運後勤、行政文書。',
    '比劫 x 財': '需透過人脈得財，善觀察市場、適合跑客戶。例：銷售、接案、房仲、保險、自營電商。',
    '比劫 x 官殺': '嚴謹制度、階級分明組織可激發管理能力。例：法務、稽核、風險控管、軍警、消防。',
    '比劫 x 食傷': '不喜管束、要有彈性。例：發揮口才、專業、創業。',
    '比劫 x 印星': '適合規律、有固定流程。例：支援、後勤、營運型、不需應變、無須對外溝通。',
  };

  if (comboDict[comboKey]) {
    return {
      ...baseCareer,
      suitableCareers: comboDict[comboKey],
    };
  }

  return baseCareer;
}

export function getWealthCareersByType(tenGodType: string): CareerMapping[] {
  return wealthCareers.filter(wc => wc.tenGodType === tenGodType);
}
