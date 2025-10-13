/**
 * ⏰ WOTG daily schedulers (Asia/Manila)
 *  - 08:00: release scheduled posts/blogs (no notifications yet)
 *  - 12:00: send notifications for items released today
 */
const cron = require("node-cron");
const { DateTime } = require("luxon");
const { Op } = require("sequelize");
const { Post, Blog } = require("@models"); // adjust paths
const { sendNotification } = require("@utils/sendNotification"); // topic broadcast

const TZ = "Asia/Manila";

function nowMNL() {
  return DateTime.now().setZone(TZ);
}

function todayRangeMNL() {
  const start = nowMNL().startOf("day");
  const end = nowMNL().endOf("day");
  return {
    startJS: new Date(start.toISO()),
    endJS: new Date(end.toISO()),
  };
}

/**
 * 08:00 — mark due items as released (don’t notify yet)
 * Requirements (recommended DB columns):
 *   Post:  release_date (Date), released_at (Date|null), notified (bool)
 *   Blog:  blog_release_date_and_time (Date), blog_approved (bool),
 *          released_at (Date|null), notified (bool)
 */
async function releaseScheduledAt8() {
  const now = new Date(nowMNL().toISO());

  // Posts due
  const duePosts = await Post.findAll({
    where: {
      release_date: { [Op.lte]: now },
      released_at: { [Op.is]: null },
    },
  });

  for (const p of duePosts) {
    await p.update({ released_at: now, notified: false });
    console.log(`🟢 Released post #${p.id} at 8AM`);
  }

  // Blogs due
  const dueBlogs = await Blog.findAll({
    where: {
      blog_approved: true,
      blog_release_date_and_time: { [Op.lte]: now },
      released_at: { [Op.is]: null },
    },
  });

  for (const b of dueBlogs) {
    await b.update({ released_at: now, notified: false });
    console.log(`🟢 Released blog #${b.id} at 8AM`);
  }

  if (!duePosts.length && !dueBlogs.length) {
    console.log("ℹ️ 8AM: nothing to release.");
  }
}

/**
 * 12:00 — notify all subscribers about items released today (not notified yet)
 */
async function notifyReleasedAtNoon() {
  const { startJS, endJS } = todayRangeMNL();

  // Posts released today, not yet notified
  const postsToNotify = await Post.findAll({
    where: {
      released_at: { [Op.between]: [startJS, endJS] },
      notified: false,
    },
  });

  for (const p of postsToNotify) {
    const url = `https://community.wotgonline.com/feeds?post=${p.id}`;
    await sendNotification(
      "📰 New Post Published!",
      (p.content || "Check out the latest post on WOTG Community!").slice(0, 80),
      { url, type: "post", postId: String(p.id) }
    );
    await p.update({ notified: true });
    console.log(`📣 Notified post #${p.id} at 12NN`);
  }

  // Blogs released today, not yet notified
  const blogsToNotify = await Blog.findAll({
    where: {
      released_at: { [Op.between]: [startJS, endJS] },
      notified: false,
      blog_approved: true,
    },
  });

  for (const b of blogsToNotify) {
    const url = `https://community.wotgonline.com/blogs/${b.id}`;
    await sendNotification(
      "📰 New Blog Released!",
      (b.blog_title || "A new blog is now available on WOTG Community!").slice(0, 80),
      { url, type: "blog", blogId: String(b.id) }
    );
    await b.update({ notified: true });
    console.log(`📣 Notified blog #${b.id} at 12NN`);
  }

  if (!postsToNotify.length && !blogsToNotify.length) {
    console.log("ℹ️ 12NN: nothing to notify.");
  }
}

// ─────────────────────────────────────────────────────────────
// Schedules (timezone-aware)
// ─────────────────────────────────────────────────────────────
cron.schedule("0 8 * * *", releaseScheduledAt8, { timezone: TZ });   // 08:00 daily
cron.schedule("0 12 * * *", notifyReleasedAtNoon, { timezone: TZ }); // 12:00 daily

module.exports = { releaseScheduledAt8, notifyReleasedAtNoon };
