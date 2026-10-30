// src/components/SynastryPage.tsx
// 合盤頁協調器：僅負責渲染，邏輯皆由 useSynastryLogic 提供。
import React from 'react';
import { ArrowLeft, Plus, Share2, Trash2, Users, Edit2 } from 'lucide-react';
import { BaziChart } from '../paipan';
import { PatternScores } from '../pattern';
import { PartnerChart } from '../matchmaking';
import { SynastryDetail } from '../types';
import { LECTURE_DATA } from '../data';
import {
  useSynastryLogic,
  type RelationshipType,
} from './synastry/useSynastryLogic';
import ShareImage from './share/ShareImage';
import SynastryShareCard from './share/SynastryShareCard';

interface Props {
  myChart: BaziChart | null;
  myName: string;
  myScores: PatternScores;
  onNavigate: (step: number) => void;
}

export default function SynastryPage({
  myChart,
  myName,
  myScores,
  onNavigate,
}: Props) {
  const {
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
    showSharePreview,
    setShowSharePreview,
    sharePrivateDetails,
    setSharePrivateDetails,
    analysis,
    handleDateChange,
    parseHourInput,
    handleEnterKeyDown,
    handleAdd,
    handleCancel,
    handleEditClick,
    handleDelete,
    handleCaptureReady,
    handleShare,
  } = useSynastryLogic({ myChart, myName });

  return (
    <div className="w-full max-w-4xl mx-auto pt-8 pb-32 px-4 md:px-0 text-zen-text text-sm animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => onNavigate(11)}
          className="flex items-center gap-2 text-zen-muted hover:text-zen-text transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-bold">返回探索</span>
        </button>
      </div>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <Users size={24} className="text-primary" />
        </div>
        <h2 className="text-3xl font-serif text-white font-bold mb-3">
          夥伴合盤觀測
        </h2>
        <p className="text-zinc-400">
          輸入伴侶、家人或合作夥伴的命盤，進行五行與緣分分析
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-black/50 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">夥伴列表</h3>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="p-1 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>

            {isAdding && (
              <div className="bg-zinc-900 border border-zinc-700/50 p-4 rounded-xl mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="姓名"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onKeyDown={handleEnterKeyDown}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm text-white"
                />
                <select
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      relationship: e.target.value as RelationshipType,
                    })
                  }
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
                  <button
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                    className={`flex-1 p-2 rounded-lg text-sm border ${
                      formData.gender === 'male'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-black border-zinc-800 text-zinc-400'
                    }`}
                  >
                    男
                  </button>
                  <button
                    onClick={() =>
                      setFormData({ ...formData, gender: 'female' })
                    }
                    className={`flex-1 p-2 rounded-lg text-sm border ${
                      formData.gender === 'female'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-black border-zinc-800 text-zinc-400'
                    }`}
                  >
                    女
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-zinc-500 font-bold ml-1">
                    出生日期 (YYYYMMDD)
                  </label>
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
                  <label className="text-sm text-zinc-500 font-bold ml-1">
                    出生時間 (HHmm)
                  </label>
                  <input
                    ref={timeInputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="例如: 1430"
                    value={formData._timeInput || ''}
                    onChange={(e) => parseHourInput(e.target.value)}
                    onKeyDown={handleEnterKeyDown}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-primary/50 focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2 bg-zinc-800 text-white rounded-lg text-xs"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 py-2 bg-primary text-black font-bold rounded-lg text-xs"
                  >
                    {editingPartnerId ? '儲存修改' : '新增'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {partners.length === 0 && !isAdding && (
                <p className="text-zinc-500 text-xs text-center py-4">
                  目前尚無名單，請點擊上方 + 新增
                </p>
              )}
              {partners.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedPartner?.id === p.id
                      ? 'bg-primary/10 border-primary/50'
                      : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                  onClick={() => setSelectedPartner(p)}
                >
                  <div>
                    <span className="font-bold text-white text-sm">
                      {p.name} {p.chart.gender === '男' ? '👦' : '👧'}
                    </span>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {p.relationship}・{p.chart.dayMaster}日主
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handleEditClick(e, p)}
                      aria-label={`編輯夥伴 ${p.name}`}
                      className="p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      aria-label={`刪除夥伴 ${p.name}`}
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
          {selectedPartner &&
          myChart &&
          selectedPartner.chart &&
          selectedPartner.chart.year ? (
            <div className="bg-black/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">
                {myName} <span className="text-primary mx-2">×</span>
                {selectedPartner.name}
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                    <span className="text-zinc-500 text-sm font-bold tracking-wider block mb-1">
                      您的日主
                    </span>
                    <strong className="text-2xl text-white">
                      {myChart.dayMaster}
                    </strong>
                    <span className="text-zinc-400 text-xs ml-2">
                      {myChart.day?.gan}
                      {myChart.day?.zhi}
                    </span>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                    <span className="text-zinc-500 text-sm font-bold tracking-wider block mb-1">
                      對方日主
                    </span>
                    <strong className="text-2xl text-white">
                      {selectedPartner.chart.dayMaster}
                    </strong>
                    <span className="text-zinc-400 text-xs ml-2">
                      {selectedPartner.chart.day?.gan}
                      {selectedPartner.chart.day?.zhi}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-4">
                    {analysis ? (
                      <>
                        <div className="bg-amber-950/10 p-5 rounded-2xl border border-amber-900/30 space-y-4 shadow-lg shadow-amber-900/5">
                          <h4 className="font-bold text-amber-400 text-sm flex items-center justify-between gap-2">
                            <span>
                              <span className="mr-2">✨</span> 五行磁場交流
                              (契合度 {analysis.scoreData.score}%)
                            </span>
                            <button
                              onClick={handleShare}
                              disabled={isSharing}
                              aria-label="分享合盤結果"
                              className="flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition-colors disabled:opacity-50"
                            >
                              <Share2 size={12} />
                              {isSharing ? '產生中' : '分享結果'}
                            </button>
                          </h4>
                          <div className="space-y-3">
                            {analysis.scoreData.details.map(
                              (detail: SynastryDetail, idx: number) => (
                                <div
                                  key={idx}
                                  className="bg-black/30 p-3.5 rounded-xl border border-amber-900/20"
                                >
                                  <div className="text-[13px] font-bold text-amber-300 mb-1">
                                    {detail.factor}
                                  </div>
                                  <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">
                                    {detail.desc}
                                  </div>
                                  {detail.advice && (
                                    <div className="text-sm text-amber-200/80 leading-relaxed pt-1.5 mt-1.5 border-t border-amber-900/40 border-dashed">
                                      {detail.advice}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="bg-pink-950/10 p-5 rounded-2xl border border-pink-900/30 space-y-4 shadow-lg shadow-pink-900/5">
                          <h4 className="font-bold text-pink-400 text-sm flex items-center gap-2">
                            <span>💘</span> 夥伴合盤與緣分牽絆
                          </h4>
                          <div className="space-y-3">
                            {analysis.spouseE && (
                              <div className="bg-black/30 p-3.5 rounded-xl border border-pink-900/20">
                                <div className="text-[13px] font-bold text-pink-300 mb-1">
                                  姻緣五行相同
                                </div>
                                <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">
                                  {analysis.spouseE}
                                </div>
                                <div className="text-sm text-pink-200 leading-relaxed">
                                  {
                                    LECTURE_DATA.PARTNER_MATCHING?.[
                                      '姻緣五行相同'
                                    ]
                                  }
                                </div>
                              </div>
                            )}
                            {analysis.spouseS && (
                              <div className="bg-black/30 p-3.5 rounded-xl border border-pink-900/20">
                                <div className="text-[13px] font-bold text-pink-300 mb-1">
                                  日主互為夫妻星
                                </div>
                                <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">
                                  {analysis.spouseS}
                                </div>
                                <div className="text-sm text-pink-200 leading-relaxed">
                                  {
                                    LECTURE_DATA.PARTNER_MATCHING?.[
                                      '日主互為夫妻星'
                                    ]
                                  }
                                </div>
                              </div>
                            )}
                            {analysis.daySim && (
                              <div className="bg-black/30 p-3.5 rounded-xl border border-pink-900/20">
                                <div className="text-[13px] font-bold text-pink-300 mb-1">
                                  八字/日柱結構相似
                                </div>
                                <div className="text-base text-zinc-300 leading-relaxed font-medium mb-1">
                                  {analysis.daySim}
                                </div>
                                <div className="text-sm text-pink-200 leading-relaxed">
                                  {
                                    LECTURE_DATA.PARTNER_MATCHING?.[
                                      '八字/日柱結構相似'
                                    ]
                                  }
                                </div>
                              </div>
                            )}
                            {!analysis.spouseE &&
                              !analysis.spouseS &&
                              !analysis.daySim && (
                                <p className="text-sm text-zinc-500 py-2">
                                  命盤無特殊強烈的玄學桃花牽絆，屬於需靠後天用心經營的平穩緣分。
                                </p>
                              )}
                          </div>
                        </div>

                        {/* 講義：十神特點及相處策略 */}
                        {LECTURE_DATA.PARTNER_TRAITS &&
                          LECTURE_DATA.PARTNER_TRAITS[
                            analysis.pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS
                          ] && (
                            <div className="bg-blue-950/10 p-5 rounded-2xl border border-blue-900/30 space-y-4 shadow-lg shadow-blue-900/5">
                              <h4 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                                <span>🤝</span> 夥伴相處策略與個性提醒 (對方的{' '}
                                {analysis.pMaxGod})
                              </h4>
                              <div className="space-y-3">
                                <div className="bg-black/30 p-3.5 rounded-xl border border-blue-900/20">
                                  <div className="text-[13px] font-bold text-zinc-200 mb-2">
                                    性格特徵 (優勢 / 提醒)
                                  </div>
                                  <div className="text-base text-zinc-300 leading-relaxed">
                                    <span className="text-green-400 font-bold">
                                      【優勢】
                                    </span>{' '}
                                    {
                                      LECTURE_DATA.PARTNER_TRAITS[
                                        analysis.pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS
                                      ].pros
                                    }
                                    <br />
                                    <span className="text-red-400 font-bold">
                                      【需留意】
                                    </span>{' '}
                                    {
                                      LECTURE_DATA.PARTNER_TRAITS[
                                        analysis.pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS
                                      ].cons
                                    }
                                  </div>
                                </div>

                                {analysis.familyRoleInfo && (
                                  <div className="bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
                                    <div className="text-[13px] font-bold text-purple-300 mb-2">
                                      🏠 家庭角色磁場與相處之道
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                      <div className="bg-black/40 border border-purple-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-sm text-yellow-400 mb-1">
                                          對待子女 (若為父母)
                                        </h4>
                                        <p className="text-base text-zinc-300 leading-relaxed">
                                          {
                                            analysis.familyRoleInfo
                                              .childInteraction
                                          }
                                        </p>
                                      </div>
                                      <div className="bg-black/40 border border-purple-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-sm text-green-400 mb-1">
                                          對待父母 (若為子女)
                                        </h4>
                                        <p className="text-base text-zinc-300 leading-relaxed">
                                          {
                                            analysis.familyRoleInfo
                                              .parentInteraction
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {analysis.matchingData && (
                                  <div className="bg-cyan-950/20 p-3.5 rounded-xl border border-cyan-900/30">
                                    <div className="text-[13px] font-bold text-cyan-300 mb-2">
                                      🧑‍🤝‍🧑 朋友/合作適配度與建議 (
                                      {analysis.pMaxGodType})
                                    </div>
                                    <div className="space-y-2 mt-2">
                                      <div className="bg-black/40 border border-cyan-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-sm text-green-400 mb-1">
                                          最合拍的對象 (適合搭配)
                                        </h4>
                                        <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-line">
                                          {analysis.matchingData.matching}
                                        </p>
                                      </div>
                                      <div className="bg-black/40 border border-cyan-900/20 rounded-lg p-3">
                                        <h4 className="font-bold text-base text-red-400 mb-1">
                                          需磨合的對象 (留意摩擦)
                                        </h4>
                                        <p className="text-base text-zinc-300 leading-relaxed whitespace-pre-line">
                                          {analysis.matchingData.avoid}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                                  <div className="bg-black/30 p-3 rounded-lg border border-blue-900/20">
                                    <p className="text-base font-bold text-blue-300 mb-1">
                                      職位較高 / 長輩
                                    </p>
                                    <p className="text-base text-zinc-300 leading-relaxed">
                                      {
                                        LECTURE_DATA.PARTNER_TRAITS[
                                          analysis.pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS
                                        ].boss
                                      }
                                    </p>
                                  </div>
                                  <div className="bg-black/30 p-3 rounded-lg border border-blue-900/20">
                                    <p className="text-base font-bold text-blue-300 mb-1">
                                      平輩 / 共事者
                                    </p>
                                    <p className="text-base text-zinc-300 leading-relaxed">
                                      {
                                        LECTURE_DATA.PARTNER_TRAITS[
                                          analysis.pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS
                                        ].colleague
                                      }
                                    </p>
                                  </div>
                                  <div className="bg-black/30 p-3 rounded-lg border border-blue-900/20">
                                    <p className="text-base font-bold text-blue-300 mb-1">
                                      職位較低 / 晚輩
                                    </p>
                                    <p className="text-base text-zinc-300 leading-relaxed">
                                      {
                                        LECTURE_DATA.PARTNER_TRAITS[
                                          analysis.pMaxGod as keyof typeof LECTURE_DATA.PARTNER_TRAITS
                                        ].subordinate
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="text-red-400 text-sm">
                        分析發生錯誤，請重新檢查資料。
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* [AI MOD] 分享圖（離屏擷取） */}
              {showSharePreview && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                  role="dialog"
                  aria-modal="true"
                  aria-label="合盤分享前預覽"
                >
                  <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
                    <h3 className="text-base font-bold text-white">
                      分享前隱私預覽
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      預設只分享匿名契合度與摘要，不包含雙方姓名、日主或日柱。
                    </p>
                    <label className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300">
                      <input
                        type="checkbox"
                        checked={sharePrivateDetails}
                        onChange={(event) =>
                          setSharePrivateDetails(event.target.checked)
                        }
                        className="mt-0.5"
                      />
                      <span>我已取得對方同意，仍要顯示雙方姓名與命盤細節</span>
                    </label>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setShowSharePreview(false)}
                        className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => {
                          setShowSharePreview(false);
                          setShareTarget(true);
                        }}
                        className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-zinc-950"
                      >
                        產生分享圖
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <ShareImage active={shareTarget} onReady={handleCaptureReady}>
                <SynastryShareCard
                  myName={myName || '我'}
                  partnerName={selectedPartner.name || 'TA'}
                  score={analysis?.scoreData.score ?? 70}
                  headline="匿名合盤報告"
                  myDayMaster={myChart.dayMaster}
                  partnerDayMaster={selectedPartner.chart.dayMaster}
                  myPillar={`${selectedPartner.chart.year ? myChart.day.gan : ''}${myChart.day.zhi}`}
                  partnerPillar={`${selectedPartner.chart.day.gan}${selectedPartner.chart.day.zhi}`}
                  details={
                    sharePrivateDetails
                      ? (analysis?.scoreData.details.map((detail) => ({
                          factor: detail.factor,
                          desc: detail.desc,
                        })) ?? [])
                      : []
                  }
                  siteUrl={
                    typeof window === 'undefined' ? '' : window.location.origin
                  }
                  showPrivateDetails={sharePrivateDetails}
                />
              </ShareImage>
              {lineShareUrl && (
                <button
                  onClick={() =>
                    window.open(lineShareUrl, '_blank', 'noopener')
                  }
                  className="mt-3 w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors"
                >
                  圖片已下載 · 分享到 LINE
                </button>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-6 bg-black/20 text-center">
              <div>
                <Users size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                  請從左側名單選擇一位夥伴進行觀測
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
