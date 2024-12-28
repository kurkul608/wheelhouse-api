export function generateUserLink(
  userId: string,
  username: string | null = null,
) {
  if (username) {
    return `https://t.me/${username}`;
  }
  return `https://t.me/user?id=${userId}`;
}
