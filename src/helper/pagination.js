module.exports = (pagination, query, total) => {
  const page = parseInt(query.page) || pagination.currentPage;
  const limit = parseInt(query.limit) || pagination.limit;
  pagination.currentPage = page;
  pagination.limit = limit;
  pagination.skip = (page - 1) * limit;
  pagination.totalPage = Math.ceil(total / limit);
  return pagination;
};
