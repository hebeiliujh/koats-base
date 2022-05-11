export const handlePages = (pageNum: number, pageSize: number, total: number) => {
  return {
    pageNum,
    pageSize,
    total,
  };
};
