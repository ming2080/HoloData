import React, { useMemo, useState } from 'react';
import { Activity, Clock, ShieldCheck, Download, BarChart2, TrendingUp } from 'lucide-react';
import type { AlarmHistoryRange } from '../../types';
import {
  ALARM_HISTORY_BY_RANGE,
  ALARM_HISTORY_RANGES,
  ALARM_MONTHLY_TREND,
} from '../../data/alarmHistory';

export const AlarmHistoryView: React.FC = () => {
  const [range, setRange] = useState<AlarmHistoryRange>('30d');

  const { rootCauses, sla } = ALARM_HISTORY_BY_RANGE[range];

  // 根因占比由事件次数实时计算，避免手写百分比与次数对不上
  const totalEvents = useMemo(
    () => rootCauses.reduce((sum, item) => sum + item.count, 0),
    [rootCauses],
  );
  const rangeLabel = ALARM_HISTORY_RANGES.find((r) => r.value === range)?.label ?? '近 30 天';

  const handleExport = () => {
    alert(`正在生成 2026 年度大数据基础设施运维告警与 SLA 归档报告 (${rangeLabel}，PDF/CSV)...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>历史告警趋势与 SLA 归档分析</span>
            <span className="text-xs font-normal text-slate-400">· 根因归纳与 MTTA / MTTR</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            对历史异常事件进行生命周期闭环追溯，评估告警收敛比、平均响应时间与根因类型分布
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 时间范围切换：根因分布与 SLA 指标随范围联动 */}
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-mono">
            {ALARM_HISTORY_RANGES.map((item) => (
              <button
                key={item.value}
                onClick={() => setRange(item.value)}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                  range === item.value
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            导出 SLA 追溯台账
          </button>
        </div>
      </div>

      {/* KPI SLA Strips：数值随所选时间范围联动 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-slate-400 block">平均告警响应时间 (MTTA)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{sla.mttaMinutes.toFixed(1)} <span className="text-xs font-normal text-slate-400">分钟</span></div>
          <span className="text-slate-500 text-[11px]">SLA 达标率 {sla.mttaSlaRate.toFixed(1)}% (目标 &lt; {sla.mttaTargetMinutes}m)</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-slate-400 block">平均故障恢复时间 (MTTR)</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{sla.mttrMinutes.toFixed(1)} <span className="text-xs font-normal text-slate-400">分钟</span></div>
          <span className="text-slate-500 text-[11px]">较上月提速 {sla.mttrImprovementPct.toFixed(1)}%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-slate-400 block">告警智能收敛抑制比</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{sla.convergencePct.toFixed(1)}%</div>
          <span className="text-slate-500 text-[11px]">有效过滤风暴级连续同源事件</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <span className="text-slate-400 block">年度告警闭环率</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{sla.closurePct.toFixed(1)}%</div>
          <span className="text-slate-500 text-[11px]">所有致命事件 100% 沉淀工单</span>
        </div>
      </div>

      {/* Root Cause Distribution Bars：占比由次数实时计算 */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span>历史故障根因分类分布 ({rangeLabel}统计，共 {totalEvents} 次事件)</span>
        </h3>

        <div className="space-y-3">
          {rootCauses.map((item, idx) => {
            const pct = totalEvents === 0 ? 0 : (item.count / totalEvents) * 100;
            return (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <span className="text-slate-400">
                    {pct.toFixed(0)}% ({item.count} 次事件)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly MTTA / MTTR Trend */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>月度 MTTA / MTTR 趋势（近 6 个月）</span>
          <span className="text-[11px] font-normal text-slate-400 font-mono">
            MTTR 逐月收窄 · 当月 {ALARM_MONTHLY_TREND[ALARM_MONTHLY_TREND.length - 1].mttrMinutes.toFixed(1)} 分钟
          </span>
        </h3>

        <div className="space-y-3">
          {ALARM_MONTHLY_TREND.map((item) => {
            const maxMttr = Math.max(...ALARM_MONTHLY_TREND.map((t) => t.mttrMinutes));
            const maxMtta = Math.max(...ALARM_MONTHLY_TREND.map((t) => t.mttaMinutes));
            return (
              <div key={item.month} className="grid grid-cols-[64px_1fr] sm:grid-cols-[64px_1fr_1fr] items-center gap-3 text-xs">
                <span className="text-slate-400 font-mono">{item.month}</span>
                <div className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-right text-cyan-300 font-mono">MTTR</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${(item.mttrMinutes / maxMttr) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-slate-300 font-mono">{item.mttrMinutes.toFixed(1)} 分钟</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="w-10 shrink-0 text-right text-emerald-300 font-mono">MTTA</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(item.mttaMinutes / maxMtta) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-slate-300 font-mono">{item.mttaMinutes.toFixed(1)} 分钟</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            MTTR 由 26.4 分钟收窄至 18.2 分钟
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            MTTA 由 2.3 分钟收窄至 1.4 分钟
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            致命事件 100% 沉淀工单
          </span>
        </div>
      </div>
    </div>
  );
};
