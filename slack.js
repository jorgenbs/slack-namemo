import "isomorphic-fetch";

export function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export async function fetchMembers() {
  const CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
  const API_KEY = process.env.SLACK_API_KEY;
  const options = { headers: { "Authorization": `Bearer ${API_KEY}`}}

  const channelRes = await fetch(`https://slack.com/api/conversations.members?channel=${CHANNEL_ID}`, options);
  const memberRes = await fetch(`https://slack.com/api/users.list`, options);

  const { members } = await memberRes.json();
  const channel = await channelRes.json();
  console.log('done!', channel, options)

  const keepUser = (m) => {
    return !m.is_bot && !m.is_restricted && !m.deleted && !m.is_stranger && channel.members.indexOf(m.id) >= 0;
  }

  if (!members || !channel) {
    return [];
  }
  return members.filter(keepUser).map((member) => ({
    image:
      member.profile.image_original ||
      member.profile.image_1024 ||
      member.profile.image_512,
    name: member.profile.real_name_normalized,
    id: member.id
  }));
}

export default fetchMembers;
