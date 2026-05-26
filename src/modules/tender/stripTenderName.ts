/** Tender title for messages/logs — uses nameOfWork; legacy `name` only for old DB records. */
export const getTenderTitle = (
  tender?: { nameOfWork?: string; name?: string } | null,
  fallback = "",
): string => {
  if (!tender) return fallback;
  return tender.nameOfWork || tender.name || fallback;
};

/** Remove legacy `name` field so only `nameOfWork` is persisted. */
export const stripTenderName = <T extends object>(data: T): Omit<T, "name"> => {
  if (!data || typeof data !== "object") {
    return data as Omit<T, "name">;
  }
  const { name: _removed, ...rest } = data as T & { name?: unknown };
  return rest as Omit<T, "name">;
};
