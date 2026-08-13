import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Users, Edit2 } from 'lucide-react';
import { BaziChart, calculateChart } from '../paipan';
import { parseBirthHour, validateBirthInput } from '../utils/validation';
import { PartnerChart } from '../matchmaking';
import { getPartners, savePartner, deletePartner } from '../storage';
import { checkDayStructureSimilarity, checkCommonSpouseElement, checkSpouseStar } from '../matchmaking';
import { getPrimaryPattern, determinePattern, initPatternScores, PatternScores } from '../pattern';
import { GAN_TO_ELEMENT } from '../constants';
import { getTenGodType } from '../data';
import { LECTURE_DATA, getFamilyRole, PARTNER_MATCHING_DATA } from '../data';
import { getCompatibilityScore } from './CategorySynastry';
import { SynastryDetail } from '../types';

type RelationshipType = '伴侶' | '合作夥伴' | '家人' | '其他';

interface Props {
  myChart: BaziChart | null;
  myName: string;
  myScores: PatternScores;
  onNavigate: (step: number) => void;
}

export default function SynastryPage({ myChart, myName, myScores, onNavigate }: Props) {
  const [partners, setPartners] = useState<PartnerChart[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerChart | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '伴侶' as RelationshipType,
    gender: 'female',
    date: '',
    time: '',
    _timeInput: ''
  });

  const timeInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const list = await getPartners();
      setPartners(list);
    } catch (e) {
      console.error('[AI MOD] loadPartners failed:', e);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setFormData({...formData, date: formatted});
    if (digits.length === 8) {
      setTimeout(() => timeInputRef.current?.focus(), 10);
    }
  };

  const parseHourInput = (input: string) => {
    let digits = input.replace(/\D/g, '');
    if (digits.length > 4) {
      digits = digits.slice(0, 4);
    }
    
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }
    
    if (digits === '') {
      setFormData({...formData, time: '', _timeInput: formatted});
      return;
    }
    
    const hourStr = digits.slice(0, 2);
    const hour = parseInt(hourStr, 10);
    
    if (isNaN(hour) || hour < 0 || hour > 23) {
      setFormData({...formData, time: '', _timeInput: formatted});
      return;
    }
    
    if (digits.length >= 3) {
      const minStr = digits.slice(2, 4);
      const min = parseInt(minStr, 10);
      if (min > 59) {
        setFormData({...formData, time: '', _timeInput: formatted});
        return;
      }
    }
    
    setFormData({...formData, time: hour.toString(), _timeInput: formatted});
  };

  const handleEnterKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setTimeout(() => {
        handleAdd();
      }, 50);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.date || !formData.time) {
      alert('請填寫完整資訊 (姓名、出生日期、出生時間)');
      return;
    }
    try {
      const validation = validateBirthInput({
        name: formData.name,
        gender: formData.gender === 'male' ? '男' : '女',
        birthDate: formData.date,
        birthTime: formData.time,
      });
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      const [y, m, d] = formData.date.split('-').map(Number);
      const hour = parseBirthHour(formData.time);
      if (hour === null) return;
      const pChart = calculateChart(y, m, d, hour, formData.gender === 'male' ? '男' : '女');
      
      const newPartner: PartnerChart = {
        id: editingPartnerId || Date.now().toString(),
        name: formData.name,
        relationship: formData.relationship,
        gender: formData.gender === 'male' ? '男' : '女',
        birthDate: formData.date,
        birthTime: formData.time,
        chart: pChart
      };
      await savePartner(newPartner);
      setFormData({ name: '', relationship: '伴侶', gender: 'female', date: '', time: '', _timeInput: '' });
      setIsAdding(false);
      setEditingPartnerId(null);
      loadPartners();
    } catch (e) {
      console.error("資料格式有誤或排盤失敗：" + String(e));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingPartnerId(null);
    setFormData({ name: '', relationship: '伴侶', gender: 'female', date: '', time: '', _timeInput: '' });
  };

  const handleEditClick = (e: React.MouseEvent, p: PartnerChart) => {
    e.stopPropagation();
    setFormData({
      name: p.name,
      relationship: p.relationship as RelationshipType,
      gender: p.gender === '男' ? 'male' : 'female',
      date: p.birthDate,
      time: p.birthTime,
      _timeInput: p.birthTime
    });
    setEditingPartnerId(p.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePartner(id);
      if (selectedPartner?.id === id) setSelectedPartner(null);
      loadPartners();
    } catch (e) {
      console.error('[AI MOD] handleDelete failed:', e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-8 pb-32 px-4 md:px-0 text-zen-text text-sm animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate(7)}
          className="flex items-center gap-2 text-zen-muted hover:text-zen-text transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-bold">返回專項</span>
        </button>
      </div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <Users size={24} className="text-primary" />
        </div>
        <h2 className="text-3xl font-serif text-white font-bold mb-3">夥伴合盤觀測</h2>
        <p className="text-zinc-400">輸入伴侶、家人或合作夥伴的命盤，進行五行與緣分分析</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">夥伴列表</h3>
              {!isAdding && (
                <button onClick={() => setIsAdding(true)} className="p-1 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                  <Plus size={18} />
                </button>
              )}
            </div>

            {isAdding && (
              <div className="bg-zinc-900 border border-zinc-700/50 p-4 rounded-xl mb-4 space-y-3">
                <input 
                  type="text" placeholder="姓名" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  onKeyDown={handleEnterKeyDown}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm text-white" 
                />
                <select 
                  value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value as RelationshipType})}
                  onKeyDown={handleEnterKeyDown}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm text-white"
                >
                  <option value="伴侶">伴侶</option>
                  <option value="家人">家人</option>
                  <option value="朋友">朋友</option>
                  <option value="合作夥伴">合作夥伴</option>
                  <option value="其他">其他</option>
                </select>
                <div className="flex gap-2">
                   <button onClick={() => setFormData({...formData, gender: 'male'})} className={`flex-1 p-2 rounded-lg text-sm border ${formData.gender === 'male' ? 'bg-primary/20 border-primary text-primary' : 'bg-black border-zinc-800 text-zinc-400'}`}>男</button>
                   <button onClick={() => setFormData({...formData, gender: 'female'})} className={`flex-1 p-2 rounded-lg text-sm border ${formData.gender === 'female' ? 'bg-primary/20 border-primary text-primary' : 'bg-black border-zinc-800 text-zinc-400'}`}>女</button>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-zinc-500 font-bold ml-1">出生日期 (YYYYMMDD)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="例如: 19900101"
                    value={formData.date} 
                    onChange={handleDateChange}
                    onKeyDown={handleEnterKeyDown}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-zinc-500 font-bold ml-1">出生時間 (HHmm)</label>
                  <input 
                    ref={timeInputRef}
                    type="text" 
                    inputMode="numeric"
                    placeholder="例如: 1430"
                    value={formData._timeInput || ''} 
                    onChange={e => parseHourInput(e.target.value)}
                    onKeyDown={handleEnterKeyDown}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors" 
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleCancel} className="flex-1 py-2 bg-zinc-800 text-white rounded-lg text-xs">取消</button>
                  <button onClick={handleAdd} className="flex-1 py-2 bg-primary text-black font-bold rounded-lg text-xs">{editingPartnerId ? '儲存修改' : '新增'}</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {partners.length === 0 && !isAdding && (
                <p className="text-zinc-500 text-xs text-center py-4">目前尚無名單，請點擊上方 + 新增</p>
              )}
              {partners.map(p => (
                <div 
                  key={p.id} 
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedPartner?.id === p.id ? 'bg-primary/10 border-primary/50' : 'bg-black/40 border-zinc-800 hover:border-zinc-700'}`}
                  onClick={() => setSelectedPartner(p)}
                >
                  <div>
                    <span className="font-bold text-white text-sm">{p.name} {p.chart.gender === '男' ? '👦' : '👧'}</span>
                    <p className="text-sm text-zinc-500 mt-0.5">{p.relationship}・{p.chart.dayMaster}日主</p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => handleEditClick(e, p)}
                      className="p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
                    >
                       <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="p-1.5 text-red-400/50 hover:bg-red-400/20 hover:text-red-400 rounded-lg transition-colors"
                    >
                       <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedPartner && myChart && selectedPartner.chart && selectedPartner.chart.year ? (
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">
                {myName} <span className="text-primary mx-2">×</span> {selectedPartner.name}
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                    <span className="text-zinc-500 text-sm font-bold tracking-wider block mb-1">您的日主</span>
                    <strong className="text-2xl text-white">{myChart.dayMaster}</strong>
                    <span className="text-zinc-400 text-xs ml-2">{myChart.day?.gan}{myChart.day?.zhi}</span>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                    <span className="text-zinc-500 text-sm font-bold tracking-wider block mb-1">對方日主</span>
                    <strong className="text-2xl text-white">{selectedPartner.chart.dayMaster}</strong>
                    <span className="text-zinc-400 text-xs ml-2">{selectedPartner.chart.day?.gan}{selectedPartner.chart.day?.zhi}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    try {
                      // ====== 1. 五行互補 (最強五行法) ======
                      const countMy = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
                      const countP = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
                      const mapZhi = (zhi: string) => {
                        const m: Record<string, string> = { '寅':'木','卯':'木','巳':'火','午':'火','辰':'土','戌':'土','丑':'土','未':'土','申':'金','酉':'金','亥':'水','子':'水' };
                        return m[zhi];
                      };
                      [myChart.year, myChart.month, myChart.day, myChart.hour].forEach(p => {
                        if (p?.gan) { const el = GAN_TO_ELEMENT[p.gan]; if (el) countMy[el as keyof typeof countMy]++; }
                        if (p?.zhi) { const el = mapZhi(p.zhi); if (el) countMy[el as keyof typeof countMy]++; }
                      });
                      [selectedPartner.chart.year, selectedPartner.chart.month, selectedPartner.chart.day, selectedPartner.chart.hour].forEach(p => {
                        if (p?.gan) { const el = GAN_TO_ELEMENT[p.gan]; if (el) countP[el as keyof typeof countP]++; }
                        if (p?.zhi) { const el = mapZhi(p.zhi); if (el) countP[el as keyof typeof countP]++; }
                      });
                      const myStrongest = Object.entries(countMy).sort((a,b)=>b[1]-a[1])[0][0];
                      const partnerStrongest = Object.entries(countP).sort((a,b)=>b[1]-a[1])[0][0];

                      // ====== 2. 十神特徵 (對方) ======
                      const countPGods: Record<string, number> = {};
                      (['year', 'month', 'day', 'hour'] as const).forEach(k => {
                        const pG = selectedPartner.chart[k]?.tenGod;
                        if (pG) countPGods[pG] = (countPGods[pG]||0)+1;
                      });
                      const pMaxGod = Object.entries(countPGods).sort((a,b)=>b[1]-a[1])[0]?.[0] || '正財';

                      // ====== 3. 姻緣與緣分匹配 (嚴格依照講義) ======
                      const spouseE = checkCommonSpouseElement(myChart, selectedPartner.chart);
                      const spouseS = checkSpouseStar(myChart, selectedPartner.chart);
                      const daySim = checkDayStructureSimilarity(myChart, selectedPartner.chart);

                      const familyRoleInfo = getFamilyRole(pMaxGod);
                      const pMaxGodType = getTenGodType(pMaxGod);
                      const matchingData = PARTNER_MATCHING_DATA.TEN_GODS_MATCHING[pMaxGodType as keyof typeof PARTNER_MATCHING_DATA.TEN_GODS_MATCHING];

                      const scoreData = getCompatibilityScore(myChart, selectedPartner.chart, selectedPartner.relationship);

                      return (
                        <>
                          <div className="bg-amber-950/10 p-5 rounded-2xl border border-amber-900/30 space-y-4 shadow-lg shadow-amber-900/5">
                            <h4 className="font-bold text-amber-400 text-sm flex items-center justify-between gap-2">
                              <span><span className="mr-2">✨</span>五行磁場交流 (契合度 {scoreData.score}%)</span>
                            </h4>
                            <div className="space-y-3">
                              {scoreData.details.map((detail: SynastryDetail, idx: number) => (
                                <div key={idx} className="bg-black/30 p-3.5 rounded-xl border border-amber-900/20">
                                  <div className="text-[13px] font-bold text-amber-300 mb-1">{detail.factor}</div>
                                  <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">{detail.desc}</div>
                                  {detail.advice && <div className="text-sm text-amber-200/80 leading-relaxed pt-1.5 mt-1.5 border-t border-amber-900/40 border-dashed">{detail.advice}</div>}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-pink-950/10 p-5 rounded-2xl border border-pink-900/30 space-y-4 shadow-lg shadow-pink-900/5">
                            <h4 className="font-bold text-pink-400 text-sm flex items-center gap-2">
                              <span>💘</span> 夥伴合盤與緣分牽絆
                            </h4>
                            <div className="space-y-3">
                              {spouseE && (
                                <div className="bg-black/30 p-3.5 rounded-xl border border-pink-900/20">
                                  <div className="text-[13px] font-bold text-pink-300 mb-1">姻緣五行相同</div>
                                  <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">{spouseE}</div>
                                  <div className="text-sm text-pink-200 leading-relaxed">{LECTURE_DATA.PARTNER_MATCHING?.['姻緣五行相同']}</div>
                                </div>
                              )}
                              {spouseS && (
                                <div className="bg-black/30 p-3.5 rounded-xl border border-pink-900/20">
                                  <div className="text-[13px] font-bold text-pink-300 mb-1">日主互為夫妻星</div>
                                  <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">{spouseS}</div>
                                  <div className="text-sm text-pink-200 leading-relaxed">{LECTURE_DATA.PARTNER_MATCHING?.['日主互為夫妻星']}</div>
                                </div>
                              )}
                              {daySim && (
                                <div className="bg-black/30 p-3.5 rounded-xl border border-pink-900/20">
                                  <div className="text-[13px] font-bold text-pink-300 mb-1">八字/日柱結構相似</div>
                                  <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">{daySim}</div>
                                  <div className="text-sm text-pink-200 leading-relaxed">{LECTURE_DATA.PARTNER_MATCHING?.['八字/日柱結構相似']}</div>
                                </div>
                              )}
                              {(!spouseE && !spouseS && !daySim) && (
                                <p className="text-sm text-zinc-500 py-2">命盤無特殊強烈的玄學桃花牽絆，屬於需靠後天用心經營的平穩緣分。</p>
                              )}
                            </div>
                          </div>

                          {/* 講義：十神特點及相處策略 */}
                          {LECTURE_DATA.PARTNER_TRAITS && LECTURE_DATA.PARTNER_TRAITS[pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS] && (
                            <div className="bg-blue-950/10 p-5 rounded-2xl border border-blue-900/30 space-y-4 shadow-lg shadow-blue-900/5">
                              <h4 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                                <span>🤝</span> 夥伴相處策略與個性提醒 (對方的 {pMaxGod})
                              </h4>
                              <div className="space-y-3">
                                <div className="bg-black/30 p-3.5 rounded-xl border border-blue-900/20">
                                  <div className="text-[13px] font-bold text-zinc-200 mb-2">性格特徵 (優勢 / 提醒)</div>
                                  <div className="text-base text-zinc-300 leading-relaxed">
                                    <span className="text-green-400 font-bold">【優勢】</span> {LECTURE_DATA.PARTNER_TRAITS[pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS].pros} <br/>
                                    <span className="text-red-400 font-bold">【需留意】</span> {LECTURE_DATA.PARTNER_TRAITS[pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS].cons}
                                  </div>
                                </div>

                                {familyRoleInfo && (
                                  <div className="bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
                                    <div className="text-[13px] font-bold text-purple-300 mb-2">🏠 家庭角色磁場與相處之道</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                      <div className="bg-black/40 border border-purple-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-sm text-yellow-400 mb-1">對待子女 (若為父母)</h4>
                                        <p className="text-base text-zinc-300 leading-relaxed">{familyRoleInfo.childInteraction}</p>
                                      </div>
                                      <div className="bg-black/40 border border-purple-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-sm text-green-400 mb-1">對待父母 (若為子女)</h4>
                                        <p className="text-base text-zinc-300 leading-relaxed">{familyRoleInfo.parentInteraction}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {matchingData && (
                                  <div className="bg-cyan-950/20 p-3.5 rounded-xl border border-cyan-900/30">
                                    <div className="text-[13px] font-bold text-cyan-300 mb-2">🧑‍🤝‍🧑 朋友/合作適配度與建議 ({pMaxGodType})</div>
                                    <div className="space-y-2 mt-2">
                                      <div className="bg-black/40 border border-cyan-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-sm text-green-400 mb-1">最合拍的對象 (適合搭配)</h4>
                                        <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-line">{matchingData.matching}</p>
                                      </div>
                                      <div className="bg-black/40 border border-cyan-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-base text-red-400 mb-1">需磨合的對象 (留意摩擦)</h4>
                                        <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-line">{matchingData.avoid}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                  <div className="bg-black/30 p-3 rounded-lg border border-blue-900/20">
                                    <p className="text-base font-bold text-blue-300 mb-1">職位較高 / 長輩</p>
                                    <p className="text-base text-zinc-300 leading-relaxed">{LECTURE_DATA.PARTNER_TRAITS[pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS].boss}</p>
                                  </div>
                                  <div className="bg-black/30 p-3 rounded-lg border border-blue-900/20">
                                    <p className="text-base font-bold text-blue-300 mb-1">平輩 / 共事者</p>
                                    <p className="text-base text-zinc-300 leading-relaxed">{LECTURE_DATA.PARTNER_TRAITS[pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS].colleague}</p>
                                  </div>
                                  <div className="bg-black/30 p-3 rounded-lg border border-blue-900/20">
                                    <p className="text-base font-bold text-blue-300 mb-1">職位較低 / 晚輩</p>
                                    <p className="text-base text-zinc-300 leading-relaxed">{LECTURE_DATA.PARTNER_TRAITS[pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS].subordinate}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    } catch (e) {
                      return <div className="text-red-400 text-sm">分析發生錯誤，請重新檢查資料。</div>;
                    }
                  })()}
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-6 bg-black/20 text-center">
                <div>
                   <Users size={32} className="text-zinc-700 mx-auto mb-3" />
                   <p className="text-zinc-500 text-sm">請從左側名單選擇一位夥伴進行觀測</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
