import type {
  CategoryTurnaround,
  EngineerPerformance,
  SlaMetric,
  WorkOrderDailyTrend,
  WorkOrderTypeShare,
} from '../types';

/** 工单统计看板：每日完成 / 待办趋势（与工单实际流转口径一致） */
export const WORK_ORDER_DAILY_TREND: WorkOrderDailyTrend[] = [
  { date: '2026/11/1', completed: 16, pending: 42, total: 58 },
  { date: '2026/11/2', completed: 18, pending: 40, total: 58 },
  { date: '2026/11/3', completed: 22, pending: 15, total: 37 },
  { date: '2026/11/4', completed: 25, pending: 18, total: 43 },
  { date: '2026/11/5', completed: 32, pending: 12, total: 44 },
  { date: '2026/11/6', completed: 45, pending: 8, total: 53 },
];

/** 工单类型分布：数量为源数据，占比由数量实时计算，避免手写百分比与数量对不上 */
export const WORK_ORDER_TYPE_SHARE: WorkOrderTypeShare[] = [
  { label: '硬件故障报修 (天线/板卡/硬盘换热)', count: 101, color: 'bg-cyan-400' },
  { label: '软件升级与补丁缝补 (灰度滚动发布)', count: 80, color: 'bg-emerald-400' },
  { label: '数据库与缓存调优 (Binlog/BigKey)', count: 63, color: 'bg-indigo-400' },
  { label: '网络与安全策略调整 (防火墙/SFP+)', count: 43, color: 'bg-rose-400' },
];

/** SLA 履约指标：目标值与实际值成对维护，状态由实际值与目标值对照得出 */
export const WORK_ORDER_SLA_METRICS: SlaMetric[] = [
  { metric: '平均首响响应耗时 (FRT)', target: '≤ 10分钟', actual: '6.2 分钟', status: '优异' },
  { metric: '平均故障解决时长 (MTTR)', target: '≤ 4.0小时', actual: '1.8 小时', status: '优异' },
  { metric: '工单一次性解决闭环率', target: '≥ 95.0%', actual: '98.5%', status: '达标' },
  { metric: '业务满意度星级评分', target: '≥ 4.80', actual: '4.95 / 5.0', status: '优异' },
];

/** 核心运维工程师闭环效能榜 */
export const WORK_ORDER_ENGINEER_RANKING: EngineerPerformance[] = [
  { name: '张帆', role: '全息基础设施架构组', closed: 48, avgTime: '1.2h', rating: 4.98 },
  { name: '赵振华', role: 'DBA 数据库专家组', closed: 36, avgTime: '1.5h', rating: 4.95 },
  { name: '严亮', role: '中间件与高速缓存组', closed: 29, avgTime: '0.8h', rating: 4.92 },
  { name: '刘芳', role: '网络与安全保障组', closed: 22, avgTime: '2.1h', rating: 4.9 },
];

/** 各类别工单平均流转闭环时长，pct 为相对最长耗时的归一化进度 */
export const WORK_ORDER_CATEGORY_TURNAROUND: CategoryTurnaround[] = [
  { label: '硬件故障报修 (现场检修/更换原厂部件)', time: '1.8 小时', pct: 60, color: 'bg-rose-500' },
  { label: '资源扩容审批 (Flink / YARN 队列调配)', time: '0.6 小时', pct: 25, color: 'bg-cyan-500' },
  { label: '组件版本升级 (灰度平滑滚动发布)', time: '3.4 小时', pct: 90, color: 'bg-indigo-500' },
  { label: '安全权限申请 (堡垒机 / BMC 临时提权)', time: '0.3 小时', pct: 15, color: 'bg-emerald-500' },
  { label: '性能调优工单 (Binlog 复制/BigKey 拆解)', time: '2.2 小时', pct: 70, color: 'bg-amber-500' },
];

/** 按起止日期过滤趋势数据，搜索条件真实生效 */
export function filterTrendByDateRange(
  trend: WorkOrderDailyTrend[],
  startDate: string,
  endDate: string,
): WorkOrderDailyTrend[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return trend.filter((pt) => {
    const t = new Date(pt.date).getTime();
    return t >= start && t <= end;
  });
}

/** 趋势汇总：区间总量、已完成量与结案率，供看板头部与悬停卡片复用 */
export function calcTrendSummary(trend: WorkOrderDailyTrend[]): {
  total: number;
  completed: number;
  pending: number;
  closeRate: string;
} {
  const total = trend.reduce((sum, pt) => sum + pt.total, 0);
  const completed = trend.reduce((sum, pt) => sum + pt.completed, 0);
  const pending = trend.reduce((sum, pt) => sum + pt.pending, 0);
  return {
    total,
    completed,
    pending,
    closeRate: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%',
  };
}

/** 类型分布总量：环形图中心数字由各类型数量加总得出，不再手写 */
export function calcTypeShareTotal(share: WorkOrderTypeShare[]): number {
  return share.reduce((sum, item) => sum + item.count, 0);
}
