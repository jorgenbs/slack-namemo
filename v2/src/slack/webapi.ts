import fetch from "node-fetch";

export async function fetchMembers({ CHANNEL_ID, API_KEY }): Promise<
  Array<{
    image: string;
    name: string;
    id: string;
  }>
> {
  const options = { headers: { Authorization: `Bearer ${API_KEY}` } };

  const channelRes = await fetch(
    `https://slack.com/api/conversations.members?channel=${CHANNEL_ID}`,
    options
  );
  const memberRes = await fetch(`https://slack.com/api/users.list`, options);

  const { members } = await memberRes.json();
  const channel = await channelRes.json();

  const keepUser = (m) => {
    return (
      !m.is_bot &&
      !m.is_restricted &&
      !m.deleted &&
      !m.is_stranger &&
      channel.members.indexOf(m.id) >= 0
    );
  };

  if (!members || !channel) {
    return [];
  }
  return members.filter(keepUser).map((member) => ({
    image:
      member.profile.image_original ||
      member.profile.image_1024 ||
      member.profile.image_512,
    name: member.profile.real_name_normalized,
    id: member.id,
  }));
}
