import React from 'react';
import { AlertTriangle, Bell, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { ActiveAlarmKpis } from '../../data/activeAlarms';

interface ActiveAlarmKpiCardsProps {
  kpis: ActiveAlarmKpis;
}

// 实时告警页顶部 4 张 KPI 卡片：数值全部由筛选后的告警列表实时计算后传入，
// 不在组件里写死统计值；搜索、筛选与时间范围变化时随筛选后的列表联动变化。
export const ActiveAlarmKpiCards: React.FC<ActiveAlarmKpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-slate-400 font-sans text-xs block">告警总记录数</span>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {kpis.total} <span className="text-xs font-normal text-slate-400">条</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Bell className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-slate-400 font-sans text-xs block">未确认 / 处置中告警</span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {kpis.pending} <span className="text-xs font-normal text-slate-400">条</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-slate-400 font-sans text-xs block">重大与严重告警</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {kpis.criticalOrMajor} <span className="text-xs font-normal text-slate-400">条</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <span className="text-slate-400 font-sans text-xs block">自动闭环恢复率</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {kpis.autoCloseRate.toFixed(1)}%
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
