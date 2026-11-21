import type {
  AlarmHistoryRange,
  AlarmMonthlyTrend,
  AlarmRootCauseStat,
  AlarmSlaSummary,
} from '../types';

/** 历史告警趋势：时间范围选项 */
export const ALARM_HISTORY_RANGES: { value: AlarmHistoryRange; label: string }[] = [
  { value: '7d', label: '近 7 天' },
  { value: '30d', label: '近 30 天' },
  { value: '90d', label: '近 90 天' },
];

/** 根因分类：五类固定口径，各时间范围只维护事件次数，占比由次数实时计算 */
const ROOT_CAUSE_LABELS: { label: string; color: string }[] = [
  { label: '硬件散热与高负载温度尖刺 (Thermal / Fans)', color: 'bg-rose-500' },
  { label: '存储介质坏块与磁盘阵列冗余校验 (Bad Sector / RAID)', color: 'bg-amber-500' },
  { label: '分布式 OLAP 慢查询及大表扫描 (Slow Query / Memory Peak)', color: 'bg-purple-500' },
  { label: '实时消息队列消费组处理堆积 (Consumer Lag Spikes)', color: 'bg-cyan-500' },
  { label: '网络微突发流量与 RoCE 拥塞 (Microburst Drops)', color: 'bg-indigo-500' },
];

const buildRootCauses = (counts: number[]): AlarmRootCauseStat[] =>
  ROOT_CAUSE_LABELS.map((item, idx) => ({ ...item, count: counts[idx] }));

/** 各时间范围的历史告警数据：近 30 天口径与原静态展示一致（18 / 14 / 11 / 8 / 6 次） */
export const ALARM_HISTORY_BY_RANGE: Record<
  AlarmHistoryRange,
  { rootCauses: AlarmRootCauseStat[]; sla: AlarmSlaSummary }
> = {
  '7d': {
    rootCauses: buildRootCauses([5, 4, 3, 2, 1]),
    sla: {
      mttaMinutes: 1.1,
      mttaTargetMinutes: 5,
      mttaSlaRate: 99.9,
      mttrMinutes: 15.8,
      mttrImprovementPct: 18.2,
      convergencePct: 93.1,
      closurePct: 100.0,
    },
  },
  '30d': {
    rootCauses: buildRootCauses([18, 14, 11, 8, 6]),
    sla: {
      mttaMinutes: 1.4,
      mttaTargetMinutes: 5,
      mttaSlaRate: 99.8,
      mttrMinutes: 18.2,
      mttrImprovementPct: 24.5,
      convergencePct: 92.4,
      closurePct: 100.0,
    },
  },
  '90d': {
    rootCauses: buildRootCauses([52, 41, 33, 24, 18]),
    sla: {
      mttaMinutes: 1.7,
      mttaTargetMinutes: 5,
      mttaSlaRate: 99.5,
      mttrMinutes: 21.6,
      mttrImprovementPct: 12.3,
      convergencePct: 91.2,
      closurePct: 99.6,
    },
  },
};

/** 月度 MTTA / MTTR 趋势：近 6 个月，MTTR 逐月收窄、与所选范围的当月值衔接 */
export const ALARM_MONTHLY_TREND: AlarmMonthlyTrend[] = [
  { month: '2026/06', mttaMinutes: 2.3, mttrMinutes: 26.4 },
  { month: '2026/07', mttaMinutes: 2.1, mttrMinutes: 24.8 },
  { month: '2026/08', mttaMinutes: 1.9, mttrMinutes: 23.1 },
  { month: '2026/09', mttaMinutes: 1.8, mttrMinutes: 21.5 },
  { month: '2026/10', mttaMinutes: 1.6, mttrMinutes: 19.8 },
  { month: '2026/11', mttaMinutes: 1.4, mttrMinutes: 18.2 },
];
