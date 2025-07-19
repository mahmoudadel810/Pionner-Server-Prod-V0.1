//==================================Pagination Utility======================================

export const paginationHelper = ({
   page = 1,
   limit = 10,
   totalCount = 0,
   search = "",
   searchFields = []
}) => {
   const currentPage = Math.max(1, parseInt(page));
   const itemsPerPage = Math.max(1, parseInt(limit));
   const skip = (currentPage - 1) * itemsPerPage;
   
   const totalPages = Math.ceil(totalCount / itemsPerPage);
   const hasNextPage = currentPage < totalPages;
   const hasPrevPage = currentPage > 1;

   return {
      skip,
      limit: itemsPerPage,
      currentPage,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? currentPage + 1 : null,
      prevPage: hasPrevPage ? currentPage - 1 : null
   };
};

//==================================Search/Filter Builder======================================

export const buildSearchQuery = ({
   search = "",
   searchFields = ["name", "description"],
   user = null
}) => {
   let query = {};

   // Add user filter if provided
   if (user && user.role !== 'admin') {
      query.user = user._id;
   }

   // Add search functionality
   if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = searchFields.map(field => ({
         [field]: { $regex: searchRegex }
      }));
   }

   return query;
};

//==================================Pagination Response Builder======================================

export const buildPaginationResponse = ({
   data = [],
   pagination = {},
   message = "Data retrieved successfully"
}) => {
   return {
      success: true,
      message,
      data,
      pagination: {
         currentPage: pagination.currentPage,
         totalPages: pagination.totalPages,
         totalCount: pagination.totalCount,
         hasNextPage: pagination.hasNextPage,
         hasPrevPage: pagination.hasPrevPage,
         nextPage: pagination.nextPage,
         prevPage: pagination.prevPage,
         limit: pagination.limit
      }
   };
}; 