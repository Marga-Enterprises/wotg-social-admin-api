/**
 * 🔥 sendNotification Utility
 * Sends push notifications via Firebase Admin SDK
 * Supports Android heads-up display + Chrome web push
 * Target: main-site topic subscribers
 */

const admin = require("@firebase"); // adjust path if needed

/**
 * Sends a broadcast push notification to the main site.
 *
 * @param {string} title - Notification title
 * @param {string} body - Notification message body
 * @param {object} [data={}] - Custom data payload (e.g. { url, type })
 * @returns {Promise<object|null>} FCM response or null on failure
 */
exports.sendNotification = async (title, body, data = {}) => {
  try {
    const url = data?.url || "https://community.wotgonline.com/";

    // 🔧 Build the notification payload
    const message = {
      topic: "main-site", // ✅ broadcast to everyone subscribed to this topic

      notification: {
        title: title || "WOTG Community",
        body: body || "New update available on WOTG Community!",
        image: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
      },

      data: {
        ...data,
        url, // so Service Worker can open the correct page
      },

      // 📱 Android behavior
      android: {
        priority: "high",
        notification: {
          clickAction: url,
          sound: "default",
          vibrateTimingsMillis: [200, 100, 200],
          defaultVibrateTimings: true,
          defaultSound: true,
          visibility: "public",
        },
      },

      // 💻 Web push behavior
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          icon: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
          badge: "https://wotg.sgp1.cdn.digitaloceanspaces.com/images/wotgLogo.webp",
          vibrate: [200, 100, 200],
          requireInteraction: true,
          tag: "wotg-main-site", // prevents duplicate stacking
        },
        fcmOptions: {
          link: url, // what Chrome/Edge opens when clicked
        },
      },
    };

    // 🚀 Send notification via Firebase Admin SDK
    const response = await admin.messaging().send(message);
    console.log(`✅ Notification broadcasted to main-site →`, response);
    return response;
  } catch (err) {
    console.error("❌ FCM sendNotification error:", err.message || err);
    return null;
  }
};
