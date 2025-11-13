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
const { clearUsersCache } = require('@utils/clearRedisCache');


// list of users with pagination
exports.listUsersService = async (query) => {
  validateListUsersParams(query);

  let { 
    pageIndex, 
    pageSize, 
    search, 
    guestFilter, 
    dateFrom, 
    dateTo,
    dgroupFilter
  } = query;

  pageIndex = parseInt(pageIndex) || 1;
  pageSize = parseInt(pageSize) || 10;

  const offset = (pageIndex - 1) * pageSize;
  const limit = pageSize;

  const whereClause = {};

  // search filter
  if (search) {
    whereClause[Op.or] = [
      { user_fname: { [Op.like]: `%${search}%` } },
      { user_lname: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  // guest filter
  if (guestFilter === 'guest') {
    whereClause.guest_account = true;
  } else if (guestFilter === 'nonguest' || guestFilter === 'non_guest') {
    whereClause.guest_account = false;
  }

  // D-Group filter
  if (dgroupFilter === 'yes') {
    whereClause.user_already_a_dgroup_member = true;
  } else if (dgroupFilter === 'no') {
    whereClause.user_already_a_dgroup_member = false;
  }
  // both → do not filter

  // normalize date range
  const normalizeDate = (date, endOfDay = false) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d)) return null;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    else d.setHours(0, 0, 0, 0);
    return d;
  };

  const from = normalizeDate(dateFrom);
  const to = normalizeDate(dateTo, true);

  if (from && to) {
    whereClause.registered_at = { [Op.between]: [from, to] };
  } else if (from) {
    whereClause.registered_at = { [Op.gte]: from };
  } else if (to) {
    whereClause.registered_at = { [Op.lte]: to };
  }

  // cache key
  const cacheKey = `users:page:${pageIndex}:size:${pageSize}:search:${search || ''}:guest:${
    guestFilter || 'both'
  }:dgroup:${dgroupFilter || 'both'}:from:${
    from ? from.toISOString().split('T')[0] : ''
  }:to:${to ? to.toISOString().split('T')[0] : ''}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const { count, rows } = await User.findAndCountAll({
    where: whereClause,
    offset,
    limit,
    order: [['registered_at', 'DESC']],
  });

  const totalPages = Math.ceil(count / pageSize);

  const result = {
    totalItems: count,
    totalPages,
    currentPage: pageIndex,
    users: rows,
  };

  await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);

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

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));

  return user;
};


// update user's D-Group membership status
exports.updateUserDGroupStatusService = async (userId, isDGroupMember) => {
  validateUserId(userId);

  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  user.user_already_a_dgroup_member = isDGroupMember;
  
  await user.save();
  await clearUsersCache();

  return user;
};