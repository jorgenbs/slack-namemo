import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";

import { fetchMembers } from "./slack/webapi";
import { searchGiphy } from "./utils";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT ?? 8881;

app.get("/", (req, res) => {
  res.send("Hello World");
});

async function fetchMember() {
  const members = await fetchMembers({
    CHANNEL_ID: process.env.SLACK_TEAM_CHANNEL,
    API_KEY: process.env.SLACK_BOT_TOKEN,
  });
  const options = members.map(({ name, id }) => ({
    text: {
      type: "plain_text",
      text: name,
      emoji: false,
    },
    value: `member-${id}`,
  }));
  const member = members[Math.round(Math.random() * members.length)];
  const reply = {
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
  return reply;
}

app.post("/slack/slash/new", async (req, res) => {
  const reply = await fetchMember();
  res.send(reply);
});

app.post("/slack/event", async (req, res) => {
  const { challenge } = req.body;
  res.send(challenge);
});
app.post("/slack/message_action", async (req, res) => {
  const { actions, response_url, user_id } = JSON.parse(req.body.payload);

  if (actions[0].action_id === "try_again") {
    const member = await fetchMember();
    await fetch(response_url, {
      method: "POST",
      body: JSON.stringify(member),
    });
    res.send();
    return;
  }

  const answered = actions[0].selected_option.value;
  const correct = answered === actions[0].action_id;
  const gif = await searchGiphy(correct ? "victory" : "failure");

  let resultText = "*CORRECT 🎉️*";
  if (!correct) {
    const members = await fetchMembers({
      CHANNEL_ID: process.env.SLACK_TEAM_CHANNEL,
      API_KEY: process.env.SLACK_BOT_TOKEN,
    });
    const correctMember = members.find(
      ({ id }) => `member-${id}` === actions[0].action_id
    );
    resultText = `☠️ Correct answer was *${correctMember.name}*`;
  }

  fetch(response_url, {
    method: "POST",
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: resultText,
          },
          accessory: {
            type: "image",
            image_url: gif,
            alt_text: "member",
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Try again?",
                emoji: true,
              },
              value: "try_again",
              action_id: "try_again",
            },
          ],
        },
      ],
    }),
  });

  res.send();
});
app.post("/slack/auth", async (req, res) => {
  console.log(req.body);
  res.send();
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});

(async () => {
  const members = await fetchMembers({
    CHANNEL_ID: process.env.SLACK_TEAM_CHANNEL,
    API_KEY: process.env.SLACK_BOT_TOKEN,
  });
})();
