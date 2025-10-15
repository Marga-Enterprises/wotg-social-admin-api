// model imports
const { User } = require('@models');

// sequelize operators
const { Op } = require("sequelize");

// validators
const { 
    validateUserId,
    validateListUsersParams,
} = require('@validators/user');


// redis client
const redisClient = require('@config/redis');

// utility for clearing redis cache
const { 
    clearUsersCache,
} = require('@utils/clearRedisCache');


// services functions

// list of users with pagination
exports.listUsersService = async (query) => {
  validateListUsersParams(query);

  let { pageIndex, pageSize, search, guestFilter, dateFrom, dateTo } = query;

  // 🧮 Pagination setup
  pageIndex = parseInt(pageIndex) || 1;
  pageSize = parseInt(pageSize) || 10;
  const offset = (pageIndex - 1) * pageSize;
  const limit = pageSize;

  // 🧠 Cache key: includes all filters
  const cacheKey = `users:page:${pageIndex}:size:${pageSize}:search:${search || ""}:guest:${guestFilter || "both"}:from:${dateFrom || ""}:to:${dateTo || ""}`;
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // 🧩 WHERE conditions builder
  const whereClause = {};

  // 🔍 Search: by fname, lname, or email
  if (search) {
    whereClause[Op.or] = [
      { user_fname: { [Op.iLike]: `%${search}%` } },
      { user_lname: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // 🧑‍💻 Guest filter
  if (guestFilter === "guest") {
    whereClause.guest_account = true;
  } else if (guestFilter === "nonguest") {
    whereClause.guest_account = false;
  }
  // default = both → no guest filter applied

  // 📅 Date filter
  if (dateFrom && dateTo) {
    whereClause.registered_at = {
      [Op.between]: [new Date(dateFrom), new Date(dateTo)],
    };
  } else if (dateFrom) {
    whereClause.registered_at = {
      [Op.gte]: new Date(dateFrom),
    };
  } else if (dateTo) {
    whereClause.registered_at = {
      [Op.lte]: new Date(dateTo),
    };
  }

  // 🧭 Fetch with pagination
  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [["registered_at", "DESC"]],
  });

  const totalPages = Math.ceil(count / pageSize);

  const result = {
    totalItems: count,
    totalPages,
    currentPage: pageIndex,
    users: rows,
    filters: {
      search: search || null,
      guestFilter: guestFilter || "both",
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    },
  };

  // 🧊 Cache for 1 hour
  await redisClient.set(cacheKey, JSON.stringify(result), "EX", 3600);

  return result;
};


// get user by id
exports.getUserByIdService = async (userId) => {
    validateUserId(userId);

    const cacheKey = `user_${userId}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    // Cache the result for future requests
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(user)); // Cache for 1 hour

    return user;
};