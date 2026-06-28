import { prisma } from "@/lib/prisma";

export async function notify(userId, { title, message, type = "INFO" }) {
  if (!userId) return null;
  return prisma.notification.create({
    data: { userId, title, message, type },
  });
}

export async function notifyMany(userIds, payload) {
  return Promise.all(userIds.filter(Boolean).map((id) => notify(id, payload)));
}
