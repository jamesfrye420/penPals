export const parameterReplacement = (limit: number, cursor?: string | null, alias?: string | number) => {
  // cap the max limit at 50

  // 50+1 => 51 posts fetched
  const realLimit = Math.min(50, limit);

  const realLimitPlusOne = realLimit + 1;

  const replacements: any[] = [realLimitPlusOne];

  if (alias) {
    replacements.push(alias);
  }

  if (cursor) {
    replacements.push(new Date(parseInt(cursor)));
  }

  return { realLimit, realLimitPlusOne, replacements };
};
