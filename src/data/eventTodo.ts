// 待办事件页的数据计算模块：顶部 4 张 KPI 卡片全部由筛选后的待办事件列表实时计算，
// 不在视图里写死统计值；搜索与筛选变化时 KPI 随筛选后的列表联动变化。
//
// 口径（按待办事件列表的 status / severity / respondMinutes 字段）：
// - 待办事件总数：筛选后的事件总数
// - 未处理高危事件：状态为「未处理」且级别为「重大」或「严重」的事件数
// - 处置中工单关联事件：状态为「处理中」的事件数
// - 平均响应处置时长：各事件 respondMinutes 字段（从接警到首次响应的分钟数）的平均值，单位分钟

export interface TodoKpiInput {
  status: string;
  severity: string;
  respondMinutes: number;
}

export interface EventTodoKpis {
  total: number;
  unhandledHighRisk: number;
  inProgress: number;
  avgRespondMinutes: number;
}

export function calcTodoKpis(events: TodoKpiInput[]): EventTodoKpis {
  const total = events.length;
  if (total === 0) {
    return { total: 0, unhandledHighRisk: 0, inProgress: 0, avgRespondMinutes: 0 };
  }
  const unhandledHighRisk = events.filter(
    (e) => e.status === '未处理' && (e.severity === '重大' || e.severity === '严重')
  ).length;
  const inProgress = events.filter((e) => e.status === '处理中').length;
  const respondSum = events.reduce(
    (sum, e) => sum + (Number.isFinite(e.respondMinutes) ? e.respondMinutes : 0),
    0
  );
  return {
    total,
    unhandledHighRisk,
    inProgress,
    avgRespondMinutes: respondSum / total,
  };
}
