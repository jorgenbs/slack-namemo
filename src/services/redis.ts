import { createClient } from "redis";

const client = createClient({ url: process.env.REDISCLOUD_URL });
const MEMBER_KEY = "members";

export async function getClient() {
  if (!client.isReady) await client.connect();
  return client;
}

export async function setCachedMembers(members: Array<Member>) {
  const client = await getClient();
  return client.set(MEMBER_KEY, JSON.stringify(members));
}

export async function getCachedMembers(): Promise<Array<Member>> | undefined {
  const client = await getClient();
  const membersString = await client.get(MEMBER_KEY);
  const members = JSON.parse(membersString) as Array<Member>;

  if (members?.length > 0) return members;
  return undefined;
}
