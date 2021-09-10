function createQuery(
  columns: string[],
  table: string,
  {
    where, groupBy, orderBy,
  }: { where?: string[]; groupBy?: string[]; orderBy?: string[]; } = {}
) {
  let query = `SELECT ${columns.join(', ')} FROM ${table}`;
  if (where && where.length > 0) {
    query += ` WHERE ${where.map((w) => `(${w})`).join(' AND ')}`;
  }
  if (groupBy && groupBy.length > 0) {
    query += ` GROUP BY ${groupBy.join(', ')}`;
  }
  if (orderBy && orderBy.length > 0) {
    query += ` ORDER BY ${orderBy.join(', ')}`;
  }
  return query;
}

export default createQuery;