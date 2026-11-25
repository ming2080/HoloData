// 全部事件页的数据计算模块：顶部前 3 张 KPI 卡片全部由筛选后的事件全集列表实时计算，
// 不在视图里写死统计值；搜索与筛选变化时 KPI 随筛选后的列表联动变化。
//
// 口径（按事件全集列表的 status 字段）：
// - 事件全集总数：筛选后的事件总数
// - 待办未结事件：状态既不是「已完成」也不是「已闭环」的事件数
// - 已完成闭环事件：状态为「已完成」或「已闭环」的事件数
//
// 注意：第 4 张卡「全网故障去重率」暂无数据源支撑（事件列表只有单条发生次数，
// 无法反推去重口径），本次保持原写死值不动，待后续接去重统计后再数据驱动化。

export interface AllKpiInput {
  status: string;
}

export interface EventAllKpis {
  total: number;
  pending: number;
  closed: number;
}

export function calcAllKpis(events: AllKpiInput[]): EventAllKpis {
  const total = events.length;
  if (total === 0) {
    return { total: 0, pending: 0, closed: 0 };
  }
  const closed = events.filter((e) => e.status === '已完成' || e.status === '已闭环').length;
  return {
    total,
    pending: total - closed,
    closed,
  };
}
