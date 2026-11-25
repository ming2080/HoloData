// 已办事件页的数据计算模块：顶部 4 张 KPI 卡片全部由已办事件列表实时计算，
// 不在视图里写死统计值；搜索与筛选变化时 KPI 随筛选后的列表联动变化。
//
// 口径（按已办事件列表的 status / mttr 字段）：
// - 已结案闭环事件：筛选后的事件总数
// - 自动消警规则降噪率：状态为「自动消警」的事件占比
// - 平均修复时长 MTTR：各事件 mttr 字段（形如 "30分钟"）取数字后的平均值，单位分钟
// - 事件闭环达成率：状态为「已闭环」或「已归档」的事件占比，即经人工确认闭环的占比
//   （「自动消警」与仅「已恢复」的事件不计入）

export interface DoneKpiInput {
  status: string;
  mttr: string;
}

export interface EventDoneKpis {
  total: number;
  autoCloseRate: number;
  avgMttrMinutes: number;
  closedRate: number;
}

export function calcDoneKpis(events: DoneKpiInput[]): EventDoneKpis {
  const total = events.length;
  if (total === 0) {
    return { total: 0, autoCloseRate: 0, avgMttrMinutes: 0, closedRate: 0 };
  }
  const autoClosed = events.filter((e) => e.status === '自动消警').length;
  const closed = events.filter((e) => e.status === '已闭环' || e.status === '已归档').length;
  const mttrSum = events.reduce((sum, e) => {
    const minutes = parseFloat(e.mttr);
    return sum + (Number.isFinite(minutes) ? minutes : 0);
  }, 0);
  return {
    total,
    autoCloseRate: (autoClosed / total) * 100,
    avgMttrMinutes: mttrSum / total,
    closedRate: (closed / total) * 100,
  };
}
