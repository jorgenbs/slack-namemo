import fetch from "node-fetch";
import { setCachedMembers, getCachedMembers } from "./redis";
const { SLACK_TEAM_CHANNEL, SLACK_BOT_TOKEN } = process.env;

export async function fetchMemberList(): Promise<Array<Member>> {
  const cache = await getCachedMembers();
  if (cache) return cache;

  const options = { headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` } };

  const channelRes = await fetch(
    `https://slack.com/api/conversations.members?channel=${SLACK_TEAM_CHANNEL}`,
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
  const filteredMembers = members.filter(keepUser).map((member) => ({
    image:
      member.profile.image_512 ||
      member.profile.image_original ||
      member.profile.image_1024,
    name: member.profile.real_name_normalized,
    id: member.id,
  }));

  setCachedMembers(filteredMembers);

  return filteredMembers;
}

export async function fetchRandomMember(): Promise<unknown> {
  const members = await fetchMemberList();
  const options = members.map(({ name, id }) => ({
    text: {
      type: "plain_text",
      text: name,
      emoji: false,
    },
    value: `member-${id}`,
  }));
  const member = members[Math.round(Math.random() * members.length)];
  const blocks = {
    blocks: [
      {
        type: "image",
        title: {
          type: "plain_text",
          text: "Who is this?",
        },
        block_id: "image4",
        image_url: member.image,
        alt_text: "member",
      },
      {
        type: "actions",
        elements: [
          {
            type: "static_select",
            placeholder: {
              type: "plain_text",
              text: "Who is this?",
              emoji: true,
            },
            options,
            action_id: `member-${member.id}`,
          },
        ],
      },
    ],
  };
  return blocks;
}

export async function sendMessageToUser(channel: string) {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel,
      blocks: [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "Hi! 👋️ 😀️",
            emoji: true,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Lets get to know some people 💁️",
                emoji: true,
              },
              value: "try_again",
              action_id: "try_again",
            },
          ],
        },
      ],
    }),
  };

  return fetch(`https://slack.com/api/chat.postMessage`, options);
}
