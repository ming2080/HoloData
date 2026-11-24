// 事件中心统计分析页的数据源：趋势序列、类型分布、系统榜单与工程师效能榜。
// 视图层只做展示与筛选联动，所有展示数字均由本模块的数据计算得出，
// 不在视图里写死统计值。

export type EventTimeRange = 'realtime' | '1h' | '24h' | '7d' | '30d';

export interface EventTrendPoint {
  time: string;
  count: number;
  resolved: number;
}

export const eventTrendSeries: Record<EventTimeRange, EventTrendPoint[]> = {
  realtime: [
    { time: '09:00', count: 2, resolved: 2 },
    { time: '09:10', count: 5, resolved: 4 },
    { time: '09:20', count: 3, resolved: 3 },
    { time: '09:30', count: 8, resolved: 6 },
    { time: '09:40', count: 4, resolved: 4 },
    { time: '09:50', count: 6, resolved: 5 },
  ],
  '1h': [
    { time: '08:50', count: 12, resolved: 10 },
    { time: '09:00', count: 18, resolved: 15 },
    { time: '09:10', count: 14, resolved: 14 },
    { time: '09:20', count: 22, resolved: 19 },
    { time: '09:30', count: 16, resolved: 16 },
    { time: '09:40', count: 10, resolved: 9 },
  ],
  '24h': [
    { time: '00:00', count: 15, resolved: 14 },
    { time: '04:00', count: 8, resolved: 8 },
    { time: '08:00', count: 45, resolved: 40 },
    { time: '12:00', count: 32, resolved: 30 },
    { time: '16:00', count: 28, resolved: 26 },
    { time: '20:00', count: 18, resolved: 17 },
  ],
  '7d': [
    { time: '10/31', count: 120, resolved: 118 },
    { time: '11/01', count: 145, resolved: 140 },
    { time: '11/02', count: 98, resolved: 98 },
    { time: '11/03', count: 162, resolved: 155 },
    { time: '11/04', count: 110, resolved: 108 },
    { time: '11/05', count: 138, resolved: 132 },
    { time: '11/06', count: 86, resolved: 80 },
  ],
  '30d': [
    { time: '第1周', count: 850, resolved: 840 },
    { time: '第2周', count: 920, resolved: 910 },
    { time: '第3周', count: 780, resolved: 775 },
    { time: '第4周', count: 640, resolved: 635 },
  ],
};

export interface EventTypeSlice {
  type: string;
  count: number;
  color: string;
}

// 占比不在此写死，由视图按 count / 总数计算
export const eventTypeDistribution: EventTypeSlice[] = [
  { type: '硬件故障', count: 284, color: 'bg-cyan-500 text-cyan-400 border-cyan-500/30' },
  { type: '软件异常', count: 245, color: 'bg-blue-500 text-blue-400 border-blue-500/30' },
  { type: '网络抖动', count: 175, color: 'bg-purple-500 text-purple-400 border-purple-500/30' },
  { type: '接口超时', count: 105, color: 'bg-amber-500 text-amber-400 border-amber-500/30' },
  { type: '传感器失效', count: 65, color: 'bg-emerald-500 text-emerald-400 border-emerald-500/30' },
];

export interface EventSystemStat {
  name: string;
  count: number;
  mttrMinutes: number;
  closureRate: number;
}

export const eventSystemRanking: EventSystemStat[] = [
  { name: '电子标识感知集中监控系统', count: 320, mttrMinutes: 18.5, closureRate: 99.2 },
  { name: '双基识读融合推断分析系统', count: 210, mttrMinutes: 14.2, closureRate: 98.8 },
  { name: '智慧交通RFID数据采集网关', count: 165, mttrMinutes: 22.0, closureRate: 97.5 },
  { name: '全息资产高可用数据库集群', count: 115, mttrMinutes: 12.8, closureRate: 100.0 },
  { name: '实时流式计算处理平台', count: 64, mttrMinutes: 15.6, closureRate: 99.0 },
];

export interface EventEngineerStat {
  name: string;
  title: string;
  count: number;
  responseMinutes: number;
  mttrMinutes: number;
  score: number;
}

export const eventEngineerRanking: EventEngineerStat[] = [
  { name: '李明远', title: '硬件高级工程师', count: 142, responseMinutes: 1.2, mttrMinutes: 16.4, score: 99.5 },
  { name: '程总工', title: '全栈基础设施专家', count: 118, responseMinutes: 0.8, mttrMinutes: 10.2, score: 99.8 },
  { name: '赵振华', title: '数据库 DBA 专家', count: 96, responseMinutes: 1.5, mttrMinutes: 12.0, score: 98.9 },
  { name: '张建国', title: '感应识别架构师', count: 88, responseMinutes: 2.1, mttrMinutes: 21.5, score: 97.8 },
  { name: '王海峰', title: 'AI 视觉开发组长', count: 76, responseMinutes: 1.8, mttrMinutes: 18.0, score: 98.2 },
];

export interface EventKpis {
  totalEvents: number;
  resolvedEvents: number;
  closureRate: number;
  avgMttrMinutes: number;
  peakCount: number;
  peakTime: string;
  systemCount: number;
}

// 顶部 KPI 全部由趋势序列与系统榜单计算：切换时间范围时联动变化
export function computeEventKpis(
  trend: EventTrendPoint[],
  systems: EventSystemStat[],
): EventKpis {
  const totalEvents = trend.reduce((sum, d) => sum + d.count, 0);
  const resolvedEvents = trend.reduce((sum, d) => sum + d.resolved, 0);
  const closureRate = totalEvents > 0 ? (resolvedEvents / totalEvents) * 100 : 0;
  const systemTotal = systems.reduce((sum, s) => sum + s.count, 0);
  const avgMttrMinutes =
    systemTotal > 0
      ? systems.reduce((sum, s) => sum + s.count * s.mttrMinutes, 0) / systemTotal
      : 0;
  const peak = trend.reduce(
    (best, d) => (d.count > best.count ? d : best),
    trend[0] ?? { time: '-', count: 0, resolved: 0 },
  );
  return {
    totalEvents,
    resolvedEvents,
    closureRate,
    avgMttrMinutes,
    peakCount: peak.count,
    peakTime: peak.time,
    systemCount: systems.length,
  };
}
