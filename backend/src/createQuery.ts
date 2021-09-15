function createQuery(
  columns: string[],
  table: string,
  {
    where, groupBy, orderBy, limit, offset,
  }: { where?: string[]; groupBy?: string[]; orderBy?: string[]; limit?: number; offset?: number } = {}
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
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  if (offset) {
    query += ` OFFSET ${offset}`;
  }
  return query;
}

export default createQuery;