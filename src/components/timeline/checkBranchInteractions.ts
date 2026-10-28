// checkBranchInteractions — 從 TimelinePage 抽出的純函數。
// 檢查傳入地支與命盤四柱地支的合沖刑破害關係。
import {
  checkSanHui,
  checkSanHe,
  checkLiuHe,
  checkLiuChong,
  checkXiangXing,
  checkLiuPo,
  checkLiuHai,
} from "../../matchmaking";

export interface BranchInteraction {
  pillar: string;
  pillarDomain: string;
  type: string;
  effect: string;
  remedy?: string;
  isGood: boolean;
  incomingSource?: string;
}

export function checkBranchInteractions(
  incomingZhi: string,
  targets: Array<{ name: string; domain: string; zhi: string }>,
): BranchInteraction[] {
  let interactions: BranchInteraction[] = [];

  for (const pillar of targets) {
    if (!pillar.zhi) continue;

    let hasHe =
      checkSanHui(incomingZhi, pillar.zhi) ||
      checkSanHe(incomingZhi, pillar.zhi) ||
      checkLiuHe(incomingZhi, pillar.zhi);
    if (hasHe) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: "合",
        effect: "能量凝聚、計畫易成形、易有合作或人和機會",
        isGood: true,
      });
    }

    if (checkLiuChong(incomingZhi, pillar.zhi)) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: "沖",
        effect: "動盪較大、變化多端、易有搬遷轉職或關係生變",
        remedy:
          "可主動尋求改變（如進修、出差、打掃斷捨離），或主動見血（洗牙/捐血）來應驗。",
        isGood: false,
      });
    }

    const xing = checkXiangXing(incomingZhi, pillar.zhi);
    if (xing) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: xing.includes("刑") ? xing : "刑",
        effect: "易有口舌是非、摩擦、內心煎熬或法務問題",
        remedy: "凡事退一步不強出頭，簽署文件須特別謹慎，多做善事累積福報。",
        isGood: false,
      });
    }

    if (checkLiuPo(incomingZhi, pillar.zhi)) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: "破",
        effect: "易有突發破財、關係破裂、計畫意外中斷",
        remedy: "可主動破歡喜財（買觀望已久的物品、捐款），並避免重大投資。",
        isGood: false,
      });
    }

    if (checkLiuHai(incomingZhi, pillar.zhi)) {
      interactions.push({
        pillar: pillar.name,
        pillarDomain: pillar.domain,
        type: "害",
        effect: "易遭人陷害、背後小人、難防避的困擾",
        remedy: "行事保持低調，不輕易交心倒垃圾，遠離八卦圈明哲保身。",
        isGood: false,
      });
    }
  }
  return interactions;
}
