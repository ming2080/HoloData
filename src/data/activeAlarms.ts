// 实时告警页的数据计算模块：顶部 4 张 KPI 卡片全部由筛选后的实时告警列表实时计算，
// 不在视图里写死统计值；搜索、筛选与时间范围变化时 KPI 随筛选后的列表联动变化。
// 时间范围下拉此前是摆设（值变化不参与筛选），本模块同时提供时间范围判定，
// 视图用它把「今天 / 近3天 / 近7天」真正接入筛选。
//
// 口径（按实时告警列表的 status / severity / alarmTime 字段）：
// - 告警总记录数：筛选后的告警总数
// - 未确认 / 处置中告警：状态为「未确认」或「处置中」的告警数
// - 重大与严重告警：级别为「重大」或「严重」的告警数
// - 自动闭环恢复率：状态为「已恢复」的告警占筛选后总数的比例（0 条时为 0%）
//
// 时间范围口径：以列表中最晚一条告警的日期为「今天」（与下拉文案「今天 (2026-11-06)」
// 对应，演示数据以 2026-11-06 为最新日期）；今天 = 同日，近3天 = 3 个自然日内，
// 近7天 = 7 个自然日内；未来日期不计入。

export interface ActiveAlarmKpiInput {
  status: string;
  severity: string;
}

export interface ActiveAlarmKpis {
  total: number;
  pending: number;
  criticalOrMajor: number;
  autoCloseRate: number;
}

export function calcActiveAlarmKpis(alarms: ActiveAlarmKpiInput[]): ActiveAlarmKpis {
  const total = alarms.length;
  if (total === 0) {
    return { total: 0, pending: 0, criticalOrMajor: 0, autoCloseRate: 0 };
  }
  const pending = alarms.filter(
    (a) => a.status === '未确认' || a.status === '处置中'
  ).length;
  const criticalOrMajor = alarms.filter(
    (a) => a.severity === '重大' || a.severity === '严重'
  ).length;
  const recovered = alarms.filter((a) => a.status === '已恢复').length;
  return {
    total,
    pending,
    criticalOrMajor,
    autoCloseRate: (recovered / total) * 100,
  };
}

export type AlarmTimeRange = 'all' | 'today' | '3d' | '7d';

function parseAlarmDate(alarmTime: string): Date | null {
  const datePart = alarmTime.split(' ')[0];
  if (!datePart) return null;
  const parsed = new Date(datePart.replace(/\//g, '-'));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function matchesAlarmTimeRange(
  alarmTime: string,
  range: AlarmTimeRange,
  referenceDate: string
): boolean {
  if (range === 'all') return true;
  const alarmDate = parseAlarmDate(alarmTime);
  const refDate = parseAlarmDate(referenceDate);
  if (!alarmDate || !refDate) return true;
  const diffDays = Math.round((refDate.getTime() - alarmDate.getTime()) / 86400000);
  if (diffDays < 0) return false;
  if (range === 'today') return diffDays === 0;
  if (range === '3d') return diffDays < 3;
  return diffDays < 7;
}
