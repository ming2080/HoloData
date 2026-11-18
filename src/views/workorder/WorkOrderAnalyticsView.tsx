import React, { useState, useRef, useMemo } from 'react';
import { 
  BarChart2, TrendingUp, CheckCircle, Clock, Star, Users, 
  Search, Calendar, Filter, PieChart, Activity, ShieldCheck, Zap
} from 'lucide-react';
import type {
  WorkOrderAnalyticsStatusFilter,
  WorkOrderAnalyticsTypeFilter,
} from '../../types';
import {
  WORK_ORDER_DAILY_TREND,
  WORK_ORDER_TYPE_SHARE,
  WORK_ORDER_SLA_METRICS,
  WORK_ORDER_ENGINEER_RANKING,
  WORK_ORDER_CATEGORY_TURNAROUND,
  filterTrendByDateRange,
  filterTrendByStatus,
  filterTypeShareByOrderType,
  calcTrendSummary,
  calcTypeShareTotal,
} from '../../data/workOrderAnalytics';

export const WorkOrderAnalyticsView: React.FC = () => {
  // Filter Toolbar States matching image_89ab42e8.png
  const [orderTypeFilter, setOrderTypeFilter] = useState<WorkOrderAnalyticsTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<WorkOrderAnalyticsStatusFilter>('all');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-09');

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  // Chart Style Switcher State
  const [chartStyle, setChartStyle] = useState<'area' | 'donut' | 'radar'>('area');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(5);

  // 趋势数据按时间范围与状态过滤：搜索条件真实生效，不再只弹提示
  const filteredTrend = useMemo(
    () =>
      filterTrendByStatus(
        filterTrendByDateRange(WORK_ORDER_DAILY_TREND, startDate, endDate),
        statusFilter,
      ),
    [startDate, endDate, statusFilter],
  );
  const trendSummary = useMemo(() => calcTrendSummary(filteredTrend), [filteredTrend]);
  // 类型分布按工单类型筛选：环形图中心总数与占比随筛选实时变化
  const filteredTypeShare = useMemo(
    () => filterTypeShareByOrderType(WORK_ORDER_TYPE_SHARE, orderTypeFilter),
    [orderTypeFilter],
  );
  const typeShareTotal = useMemo(() => calcTypeShareTotal(filteredTypeShare), [filteredTypeShare]);
  // 状态筛选只显示对应的曲线：已完成只看已完成，未完成类状态只看未完成
  const showCompletedCurve = statusFilter === 'all' || statusFilter === '已完成';
  const showPendingCurve = statusFilter === 'all' || statusFilter !== '已完成';

  // 趋势图坐标：纵轴上限按区间最大值向上取整到 10，曲线与面积均由数据生成
  const chartMax = Math.max(20, Math.ceil(Math.max(0, ...filteredTrend.map((pt) => pt.total)) / 10) * 10);
  const yTicks = [chartMax, Math.round(chartMax * 0.75), Math.round(chartMax * 0.5), Math.round(chartMax * 0.25), 0];
  const chartWidth = 600;
  const chartHeight = 200;
  const pointX = (idx: number) =>
    filteredTrend.length > 1 ? (idx * chartWidth) / (filteredTrend.length - 1) : chartWidth / 2;
  const pointY = (value: number) => chartHeight - (value / chartMax) * chartHeight;
  const toSmoothPath = (values: number[]) => {
    const pts = values.map((v, i) => [pointX(i), pointY(v)] as const);
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const mx = (x0 + x1) / 2;
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    return d;
  };
  const toAreaPoints = (values: number[]) =>
    `0,${chartHeight} ` +
    values.map((v, i) => `${pointX(i)},${pointY(v)}`).join(' ') +
    ` ${chartWidth},${chartHeight}`;
  const hoveredTrend =
    filteredTrend.length > 0 && hoveredPointIndex !== null
      ? filteredTrend[Math.min(hoveredPointIndex, filteredTrend.length - 1)]
      : null;

  const triggerDatePicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (!ref.current) return;
    try {
      if (typeof ref.current.showPicker === 'function') {
        ref.current.showPicker();
      } else {
        ref.current.focus();
      }
    } catch {
      // Cross-origin iframe fallback
      ref.current.focus();
      ref.current.click();
    }
  };

  const handleSearch = () => {
    const typeText = orderTypeFilter === 'all' ? '全部类型' : orderTypeFilter;
    const statusText = statusFilter === 'all' ? '全部状态' : statusFilter;
    alert(`已按条件更新工单统计看板：时间范围 [${startDate} ~ ${endDate}]，类型 [${typeText}]，状态 [${statusText}]，区间内工单 ${trendSummary.total} 单、已结案 ${trendSummary.completed} 单、结案率 ${trendSummary.closeRate}，类型分布共 ${typeShareTotal} 单`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>工单流转统计与 SLA 履约看板</span>
            <span className="text-xs font-normal text-slate-400">· 全流程图表分析</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            可视化测算工单响应时延、已完成/未完成趋势平滑曲线、类别分布与 SLA 闭环达成率
          </p>
        </div>

        {/* Chart View Style Switcher (Non-bar chart styles) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-sans">
          <button
            onClick={() => setChartStyle('area')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              chartStyle === 'area'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>平滑趋势曲线面积图</span>
          </button>
          <button
            onClick={() => setChartStyle('donut')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              chartStyle === 'donut'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>类型占比环形图</span>
          </button>
          <button
            onClick={() => setChartStyle('radar')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
              chartStyle === 'radar'
                ? 'bg-cyan-600 text-white shadow-xs font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SLA 履约雷达视图</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar matching screenshot image_89ab42e8.png */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
        {/* Dropdown 1: 全部工单类型 */}
        <select
          value={orderTypeFilter}
          onChange={(e) => setOrderTypeFilter(e.target.value as WorkOrderAnalyticsTypeFilter)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
        >
          <option value="all">全部工单类型</option>
          <option value="硬件故障报修">硬件故障报修</option>
          <option value="紧急变更单">紧急变更单</option>
          <option value="软件升级单">软件升级单</option>
          <option value="数据库调优单">数据库调优单</option>
          <option value="网络安全单">网络安全单</option>
        </select>

        {/* Dropdown 2: 全部状态 */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WorkOrderAnalyticsStatusFilter)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
        >
          <option value="all">全部状态</option>
          <option value="待分析">待分析</option>
          <option value="待审批">待审批</option>
          <option value="待实施">待实施</option>
          <option value="待验证">待验证</option>
          <option value="已完成">已完成</option>
        </select>

        {/* Date Range Picker (自主选择时间) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-sans text-xs">时间范围:</span>
          <div className="relative flex items-center">
            <input
              ref={startInputRef}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono [color-scheme:dark] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => triggerDatePicker(startInputRef)}
              className="absolute right-2.5 text-slate-400 hover:text-cyan-400 p-0.5 rounded transition-colors"
              title="点击选择日期"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-slate-500 font-mono">至</span>
          <div className="relative flex items-center">
            <input
              ref={endInputRef}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono [color-scheme:dark] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => triggerDatePicker(endInputRef)}
              className="absolute right-2.5 text-slate-400 hover:text-cyan-400 p-0.5 rounded transition-colors"
              title="点击选择日期"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 ml-1">
            <button
              type="button"
              onClick={() => {
                setStartDate('2026-11-03');
                setEndDate('2026-11-09');
              }}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-400 font-sans transition-colors"
            >
              近7天
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate('2026-10-10');
                setEndDate('2026-11-09');
              }}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-400 font-sans transition-colors"
            >
              近30天
            </button>
            <button
              type="button"
              onClick={() => {
                setStartDate('2026-11-01');
                setEndDate('2026-11-30');
              }}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-400 font-sans transition-colors"
            >
              本月
            </button>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-sans transition-colors flex items-center gap-1.5 ml-auto sm:ml-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>搜索</span>
        </button>
      </div>

      {/* Main Interactive Chart Section (Replaced Column/Bar Chart with Area Curve / Donut / Radar) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-md">
        {/* Chart Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                {chartStyle === 'area' && '近期工单完成度平滑趋势曲线 (已完成 vs 未完成)'}
                {chartStyle === 'donut' && '工单类型及来源占比全景分布 (百分比)'}
                {chartStyle === 'radar' && 'SLA 响应与闭环履约质量多维雷达图'}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {chartStyle === 'area' && `展现区间 [${startDate} ~ ${endDate}] 工单处置结案与积压演进脉络`}
              {chartStyle === 'donut' && '分析不同业务组件及工单类型的分布权重，预防特定模块单点故障'}
              {chartStyle === 'radar' && '评估首响速度、解决效率、一次修复率及满意度 5 大维度'}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            {showCompletedCurve && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-cyan-500/20" />
                <span className="text-slate-300 font-sans">已完成工单</span>
              </div>
            )}
            {showPendingCurve && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 ring-2 ring-rose-500/20" />
                <span className="text-slate-300 font-sans">未完成/处置中</span>
              </div>
            )}
          </div>
        </div>

        {/* CHART DISPLAY STYLE 1: Smooth Area Curve Chart */}
        {chartStyle === 'area' && (
          <div className="space-y-4">
            <div className="text-[11px] font-mono text-slate-500 flex justify-between">
              <span>单位: (条)</span>
              <span>时间节点: {startDate} ~ {endDate}</span>
            </div>

            {/* SVG Area Chart Element */}
            {filteredTrend.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-xs text-slate-500 font-sans">
                该时间范围内暂无工单趋势数据，请调整时间范围后重新搜索
              </div>
            ) : (
              <div className="relative h-72 w-full pt-4 pb-8 font-mono">
                {/* Y-Axis dashed grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-l border-slate-800 pl-8">
                  {yTicks.map((val) => (
                    <div key={val} className="relative w-full border-b border-slate-800/80 text-[10px] text-slate-500">
                      <span className="absolute -left-7 -top-2 font-mono">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Area SVG */}
                <svg className="w-full h-full pl-8 overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fb7185" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#fb7185" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Filled Area - Pending */}
                  {showPendingCurve && (
                    <polygon
                      fill="url(#pendingGrad)"
                      points={toAreaPoints(filteredTrend.map((pt) => pt.pending))}
                    />
                  )}

                  {/* Filled Area - Completed */}
                  {showCompletedCurve && (
                    <polygon
                      fill="url(#completedGrad)"
                      points={toAreaPoints(filteredTrend.map((pt) => pt.completed))}
                    />
                  )}

                  {/* Path Curve Line - Pending */}
                  {showPendingCurve && (
                    <path
                      d={toSmoothPath(filteredTrend.map((pt) => pt.pending))}
                      fill="none"
                      stroke="#fb7185"
                      strokeWidth="3"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* Path Curve Line - Completed */}
                  {showCompletedCurve && (
                    <path
                      d={toSmoothPath(filteredTrend.map((pt) => pt.completed))}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Interactive Points */}
                  {filteredTrend.map((pt, idx) => {
                    const x = pointX(idx);
                    const compY = pointY(pt.completed);
                    const pendY = pointY(pt.pending);
                    const isHovered = hoveredPointIndex === idx;

                    return (
                      <g key={pt.date} onMouseEnter={() => setHoveredPointIndex(idx)} className="cursor-pointer">
                        {/* Vertical Hover Line */}
                        {isHovered && (
                          <line x1={x} y1="0" x2={x} y2="200" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="2 2" />
                        )}

                        {/* Pending point dot */}
                        {showPendingCurve && (
                          <circle cx={x} cy={pendY} r={isHovered ? "6" : "4"} fill="#fb7185" className="transition-all" />
                        )}

                        {/* Completed point dot */}
                        {showCompletedCurve && (
                          <circle cx={x} cy={compY} r={isHovered ? "7" : "5"} fill="#22d3ee" stroke="#0284c7" strokeWidth="2" className="transition-all" />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between pl-8 pt-3 text-[11px] text-slate-400 font-mono">
                  {filteredTrend.map((pt) => (
                    <span key={pt.date}>{pt.date}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Hover Data Detail Card */}
            {hoveredTrend !== null && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono animate-in fade-in">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">
                    日期节点: {hoveredTrend.date}
                  </span>
                </div>

                <div className="flex items-center gap-6 font-sans">
                  {showCompletedCurve && (
                    <div>
                      <span className="text-slate-500 text-[11px] block">已完成结案:</span>
                      <span className="text-cyan-400 font-bold font-mono text-sm">
                        {hoveredTrend.completed} 单
                      </span>
                    </div>
                  )}
                  {showPendingCurve && (
                    <div>
                      <span className="text-slate-500 text-[11px] block">待处理/未完成:</span>
                      <span className="text-rose-400 font-bold font-mono text-sm">
                        {hoveredTrend.pending} 单
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500 text-[11px] block">当日工单总量:</span>
                    <span className="text-slate-200 font-bold font-mono text-sm">
                      {hoveredTrend.total} 单
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHART DISPLAY STYLE 2: Donut Distribution Chart */}
        {chartStyle === 'donut' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4 font-sans text-xs">
            {/* Donut Graphic */}
            <div className="flex items-center justify-center relative">
              <div className="w-56 h-56 rounded-full border-8 border-cyan-500/80 border-t-emerald-400 border-r-indigo-500 border-b-rose-500 flex flex-col items-center justify-center shadow-xl shadow-cyan-950/20">
                <span className="text-slate-400 text-xs">全月工单总计</span>
                <span className="text-3xl font-black text-slate-100 font-mono mt-1">{typeShareTotal}</span>
                <span className="text-[11px] text-emerald-400 font-mono mt-0.5">SLA 达标率 99.4%</span>
              </div>
            </div>

            {/* Distribution Legend */}
            <div className="space-y-3 font-mono">
              {filteredTypeShare.length === 0 ? (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500 font-sans">
                  该工单类型暂无分布数据，请更换类型后重新查看
                </div>
              ) : (
                filteredTypeShare.map((item) => (
                  <div key={item.label} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-slate-200 font-sans text-xs">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-cyan-300 font-bold">{Math.round((item.count / typeShareTotal) * 100)}%</span>
                      <span className="text-slate-500 text-[11px]">({item.count} 单)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CHART DISPLAY STYLE 3: SLA Compliance Radar View */}
        {chartStyle === 'radar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4 font-sans text-xs">
            {/* Radar Simulated Pentagon Matrix */}
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-48 h-48 border border-cyan-500/30 rounded-full flex items-center justify-center">
                <div className="w-36 h-36 border border-cyan-500/40 rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 border border-cyan-500/60 rounded-full flex items-center justify-center bg-cyan-500/10">
                    <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-cyan-300 font-mono font-bold">
                运维服务质量 SLA 综合考评: A+ 级
              </span>
            </div>

            {/* Radar Metrics Table */}
            <div className="space-y-3 font-mono">
              {WORK_ORDER_SLA_METRICS.map((m) => (
                <div key={m.metric} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-slate-200 font-sans font-bold">{m.metric}</div>
                    <div className="text-[11px] text-slate-500">承诺指标: {m.target}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold font-mono text-sm">{m.actual}</div>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-sans">
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard and Performance breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Engineer Workload Leaderboard */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-sans">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>核心运维工程师闭环效能矩阵</span>
          </h3>

          <div className="space-y-3">
            {WORK_ORDER_ENGINEER_RANKING.map((eng, idx) => (
              <div
                key={eng.name}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-cyan-400 text-[11px]">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-200 font-sans">{eng.name}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{eng.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-slate-300">
                  <span>办结: <strong className="text-emerald-400">{eng.closed}</strong> 单</span>
                  <span>均时: {eng.avgTime}</span>
                  <span className="text-amber-400 font-bold">★ {eng.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Order Category Turnaround Times */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-sans">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>各类别工单平均流转闭环时长</span>
          </h3>

          <div className="space-y-3">
            {WORK_ORDER_CATEGORY_TURNAROUND.map((cat) => (
              <div key={cat.label} className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-300 font-medium font-sans">{cat.label}</span>
                  <span className="text-slate-400">{cat.time}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${cat.color}`}
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
