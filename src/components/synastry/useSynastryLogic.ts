// src/components/synastry/useSynastryLogic.ts
// 合盤頁計算與夥伴 CRUD 邏輯（從 SynastryPage 抽出）。
// 純資料轉換與事件處理，頁面僅負責渲染。
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { BaziChart, calculateChart } from '../../paipan';
import { PartnerChart } from '../../matchmaking';
import {
  getPartners,
  savePartner,
  deletePartner,
} from '../../storage';
import {
  checkDayStructureSimilarity,
  checkCommonSpouseElement,
  checkSpouseStar,
} from '../../matchmaking';
import { GAN_TO_ELEMENT } from '../../constants';
import {
  getTenGodType,
  getFamilyRole,
  LECTURE_DATA,
  PARTNER_MATCHING_DATA,
} from '../../data';
import { getCompatibilityScore } from '../CategorySynastry';
import { SynastryDetail } from '../../types';
import { useShareImage } from '../../hooks/useShareImage';
import { buildSynastryShareText, buildLineShareUrl } from '../../lib/shareText';
import { trackProductEvent } from '../../lib/productEvents';

export type RelationshipType = '伴侶' | '合作夥伴' | '家人' | '其他';

export interface SynastryLogicOptions {
  myChart: BaziChart | null;
  myName: string;
}

export interface PartnerFormData {
  name: string;
  relationship: RelationshipType;
  gender: string;
  date: string;
  time: string;
  _timeInput: string;
}

export interface SynastryAnalysis {
  countMy: Record<string, number>;
  countP: Record<string, number>;
  myStrongest: string;
  partnerStrongest: string;
  pMaxGod: string;
  spouseE: string | null;
  spouseS: string | null;
  daySim: string | null;
  familyRoleInfo: {
    tenGodType: string;
    tenGodName: string;
    parentInteraction: string;
    childInteraction: string;
  } | undefined;
  pMaxGodType: string;
  matchingData: {
    pros: string;
    cons: string;
    matching: string;
    avoid: string;
  } | undefined;
  scoreData: { score: number; details: SynastryDetail[] };
}

export interface SynastryLogicResult {
  // 夥伴 CRUD 狀態
  partners: PartnerChart[];
  selectedPartner: PartnerChart | null;
  isAdding: boolean;
  editingPartnerId: string | null;
  formData: PartnerFormData;
  timeInputRef: React.RefObject<HTMLInputElement | null>;
  isSharing: boolean;
  shareError: string | null;
  shareTarget: boolean;
  setShareTarget: (v: boolean) => void;
  lineShareUrl: string | null;
  setLineShareUrl: (v: string | null) => void;
  showSharePreview: boolean;
  setShowSharePreview: (v: boolean) => void;
  sharePrivateDetails: boolean;
  setSharePrivateDetails: (v: boolean) => void;
  // 合盤分析
  analysis: SynastryAnalysis | null;
  hasAnalysis: boolean;
  // 動作
  setSelectedPartner: (p: PartnerChart | null) => void;
  setIsAdding: (v: boolean) => void;
  setEditingPartnerId: (v: string | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<PartnerFormData>>;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parseHourInput: (input: string) => void;
  handleEnterKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  handleAdd: () => Promise<void>;
  handleCancel: () => void;
  handleEditClick: (e: React.MouseEvent, p: PartnerChart) => void;
  handleDelete: (id: string) => Promise<void>;
  loadPartners: () => Promise<void>;
  handleCaptureReady: (element: HTMLElement) => Promise<void>;
  handleShare: () => void;
}

export function useSynastryLogic({
  myChart,
  myName,
}: SynastryLogicOptions): SynastryLogicResult {
  const [partners, setPartners] = useState<PartnerChart[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerChart | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    relationship: '伴侶',
    gender: 'female',
    date: '',
    time: '',
    _timeInput: '',
  });

  const timeInputRef = useRef<HTMLInputElement>(null);

  // [AI MOD] 分享合盤結果（裂變：一人分享＝兩人進來）
  const { isSharing, error: shareError, share } = useShareImage();
  const [shareTarget, setShareTarget] = useState(false);
  const [lineShareUrl, setLineShareUrl] = useState<string | null>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [sharePrivateDetails, setSharePrivateDetails] = useState(false);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = useCallback(async () => {
    try {
      const list = await getPartners();
      setPartners(list);
    } catch (e) {
      console.error('[AI MOD] loadPartners failed:', e);
    }
  }, []);

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let digits = e.target.value.replace(/\D/g, '');
      if (digits.length > 8) {
        digits = digits.slice(0, 8);
      }

      let formatted = digits;
      if (digits.length >= 5 && digits.length <= 6) {
        formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
      } else if (digits.length >= 7) {
        formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
      }

      setFormData((prev) => ({ ...prev, date: formatted }));
      if (digits.length === 8) {
        setTimeout(() => timeInputRef.current?.focus(), 10);
      }
    },
    [setFormData]
  );

  const parseHourInput = useCallback((input: string) => {
    let digits = input.replace(/\D/g, '');
    if (digits.length > 4) {
      digits = digits.slice(0, 4);
    }

    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }

    if (digits === '') {
      setFormData((prev) => ({ ...prev, time: '', _timeInput: formatted }));
      return;
    }

    const hourStr = digits.slice(0, 2);
    const hour = parseInt(hourStr, 10);

    if (isNaN(hour) || hour < 0 || hour > 23) {
      setFormData((prev) => ({ ...prev, time: '', _timeInput: formatted }));
      return;
    }

    if (digits.length >= 3) {
      const minStr = digits.slice(2, 4);
      const min = parseInt(minStr, 10);
      if (min > 59) {
        setFormData((prev) => ({ ...prev, time: '', _timeInput: formatted }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, time: hour.toString(), _timeInput: formatted }));
  }, [setFormData]);

  const handleAdd = useCallback(async () => {
    if (!formData.name || !formData.date || !formData.time) {
      alert('請填寫完整資訊 (姓名、出生日期、出生時間)');
      return;
    }
    try {
      const [y, m, d] = formData.date.split('-').map(Number);
      if (isNaN(y) || isNaN(m) || isNaN(d) || formData.date.length < 10) {
        alert('請輸入完整的出生日期 (YYYYMMDD)');
        return;
      }
      const hour = parseInt(formData.time, 10);
      const pChart = calculateChart(
        y,
        m,
        d,
        hour,
        formData.gender === 'male' ? '男' : '女',
      );

      const newPartner: PartnerChart = {
        id: editingPartnerId || Date.now().toString(),
        name: formData.name,
        relationship: formData.relationship,
        gender: formData.gender === 'male' ? '男' : '女',
        birthDate: formData.date,
        birthTime: formData.time,
        chart: pChart,
      };
      await savePartner(newPartner);
      setFormData({
        name: '',
        relationship: '伴侶',
        gender: 'female',
        date: '',
        time: '',
        _timeInput: '',
      });
      setIsAdding(false);
      setEditingPartnerId(null);
      loadPartners();
    } catch (e) {
      console.error("資料格式有誤或排盤失敗：" + String(e));
    }
  }, [
    formData,
    editingPartnerId,
    setFormData,
    setIsAdding,
    setEditingPartnerId,
    loadPartners,
  ]);

  const handleEnterKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setTimeout(() => {
        handleAdd();
      }, 50);
    }
  }, [handleAdd]);

  const handleCancel = useCallback(() => {
    setIsAdding(false);
    setEditingPartnerId(null);
    setFormData({
      name: '',
      relationship: '伴侶',
      gender: 'female',
      date: '',
      time: '',
      _timeInput: '',
    });
  }, [setIsAdding, setEditingPartnerId, setFormData]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, p: PartnerChart) => {
      e.stopPropagation();
      setFormData({
        name: p.name,
        relationship: p.relationship as RelationshipType,
        gender: p.gender === '男' ? 'male' : 'female',
        date: p.birthDate,
        time: p.birthTime,
        _timeInput: p.birthTime,
      });
      setEditingPartnerId(p.id);
      setIsAdding(true);
    },
    [setFormData, setEditingPartnerId, setIsAdding]
  );

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deletePartner(id);
      if (selectedPartner?.id === id) setSelectedPartner(null);
      loadPartners();
    } catch (e) {
      console.error('[AI MOD] handleDelete failed:', e);
    }
  }, [selectedPartner, setSelectedPartner, loadPartners]);

  const handleCaptureReady = useCallback(
    async (element: HTMLElement) => {
      if (!myChart || !selectedPartner?.chart) {
        setShareTarget(false);
        return;
      }
      const scoreData = getCompatibilityScore(
        myChart,
        selectedPartner.chart,
        selectedPartner.relationship,
      );
      const siteUrl = typeof window === 'undefined' ? '' : window.location.origin;
      const text = buildSynastryShareText(
        {
          myName: sharePrivateDetails ? (myName || '我') : '我',
          partnerName: sharePrivateDetails
            ? (selectedPartner.name || 'TA')
            : '夥伴',
          score: scoreData.score,
          myDayMaster: sharePrivateDetails ? myChart.dayMaster : '',
          partnerDayMaster: sharePrivateDetails
            ? selectedPartner.chart.dayMaster
            : '',
          topFactor: sharePrivateDetails
            ? scoreData.details[0]?.factor
            : undefined,
          topDesc: sharePrivateDetails ? scoreData.details[0]?.desc : undefined,
        },
        siteUrl,
      );

      const outcome = await share(element, {
        fileName: `bezi-synastry-${Date.now()}.png`,
        title: sharePrivateDetails
          ? `${myName || '我'} × ${selectedPartner.name || 'TA'} 合盤報告`
          : '匿名合盤報告',
        text,
      });
      setShareTarget(false);
      if (outcome === 'shared' || outcome === 'downloaded') {
        trackProductEvent('share_exported');
      }
      // 桌機：已下載圖片 → 提供 LINE 文字分享按鈕（避免彈出視窗封鎖器）
      if (outcome === 'downloaded') {
        setLineShareUrl(buildLineShareUrl(text));
      }
    },
    [
      share,
      myChart,
      myName,
      selectedPartner,
      sharePrivateDetails,
      setShareTarget,
      setLineShareUrl,
    ]
  );

  const handleShare = useCallback(() => {
    if (isSharing || shareTarget) return;
    setSharePrivateDetails(false);
    setShowSharePreview(true);
    trackProductEvent('share_preview_opened');
  }, [isSharing, shareTarget, setSharePrivateDetails, setShowSharePreview]);

  // 合盤分析（僅在有 myChart 與 選定夥伴 時計算）
  const analysis = useMemo<SynastryAnalysis | null>(() => {
    if (!myChart || !selectedPartner?.chart) return null;
    try {
      // ====== 1. 五行互補 (最強五行法) ======
      const countMy = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
      const countP = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
      const mapZhi = (zhi: string) => {
        const m: Record<string, string> = {
          寅: '木',
          卯: '木',
          巳: '火',
          午: '火',
          辰: '土',
          戌: '土',
          丑: '土',
          未: '土',
          申: '金',
          酉: '金',
          亥: '水',
          子: '水',
        };
        return m[zhi];
      };
      [myChart.year, myChart.month, myChart.day, myChart.hour].forEach((p) => {
        if (p?.gan) {
          const el = GAN_TO_ELEMENT[p.gan];
          if (el) countMy[el as keyof typeof countMy]++;
        }
        if (p?.zhi) {
          const el = mapZhi(p.zhi);
          if (el) countMy[el as keyof typeof countMy]++;
        }
      });
      [
        selectedPartner.chart.year,
        selectedPartner.chart.month,
        selectedPartner.chart.day,
        selectedPartner.chart.hour,
      ].forEach((p) => {
        if (p?.gan) {
          const el = GAN_TO_ELEMENT[p.gan];
          if (el) countP[el as keyof typeof countP]++;
        }
        if (p?.zhi) {
          const el = mapZhi(p.zhi);
          if (el) countP[el as keyof typeof countP]++;
        }
      });
      const myStrongest = Object.entries(countMy)
        .sort((a, b) => b[1] - a[1])[0][0];
      const partnerStrongest = Object.entries(countP)
        .sort((a, b) => b[1] - a[1])[0][0];

      // ====== 2. 十神特徵 (對方) ======
      const countPGods: Record<string, number> = {};
      (['year', 'month', 'day', 'hour'] as const).forEach((k) => {
        const pG = selectedPartner.chart[k]?.tenGod;
        if (pG) countPGods[pG] = (countPGods[pG] || 0) + 1;
      });
      const pMaxGod =
        Object.entries(countPGods).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        '正財';

      // ====== 3. 姻緣與緣分匹配 (嚴格依照講義) ======
      const spouseE = checkCommonSpouseElement(myChart, selectedPartner.chart);
      const spouseS = checkSpouseStar(myChart, selectedPartner.chart);
      const daySim = checkDayStructureSimilarity(myChart, selectedPartner.chart);

      const familyRoleInfo = getFamilyRole(pMaxGod);
      const pMaxGodType = getTenGodType(pMaxGod);
      const matchingData =
        PARTNER_MATCHING_DATA.TEN_GODS_MATCHING[
          pMaxGodType as keyof typeof PARTNER_MATCHING_DATA.TEN_GODS_MATCHING
        ];

      const scoreData = getCompatibilityScore(
        myChart,
        selectedPartner.chart,
        selectedPartner.relationship,
      );

      return {
        countMy,
        countP,
        myStrongest,
        partnerStrongest,
        pMaxGod,
        spouseE,
        spouseS,
        daySim,
        familyRoleInfo,
        pMaxGodType,
        matchingData,
        scoreData,
      };
    } catch {
      return null;
    }
  }, [myChart, selectedPartner]);

  return {
    partners,
    selectedPartner,
    setSelectedPartner,
    isAdding,
    setIsAdding,
    editingPartnerId,
    setEditingPartnerId,
    formData,
    setFormData,
    timeInputRef,
    isSharing,
    shareError,
    shareTarget,
    setShareTarget,
    lineShareUrl,
    setLineShareUrl,
    showSharePreview,
    setShowSharePreview,
    sharePrivateDetails,
    setSharePrivateDetails,
    analysis,
    hasAnalysis: analysis !== null,
    handleDateChange,
    parseHourInput,
    handleEnterKeyDown,
    handleAdd,
    handleCancel,
    handleEditClick,
    handleDelete,
    loadPartners,
    handleCaptureReady,
    handleShare,
  };
}
