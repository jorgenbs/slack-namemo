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

app.post("/slack/slash/new", async (req, res) => {
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
  res.send(reply);

  console.log(req.body);
});

app.post("/slack/event", async (req, res) => {
  const { challenge } = req.body;
  res.send(challenge);
});
app.post("/slack/message_action", async (req, res) => {
  const { actions, response_url, user_id } = JSON.parse(req.body.payload);
  const answered = actions[0].selected_option.value;
  const correct = answered === actions[0].action_id;
  const gif = await searchGiphy(correct ? "victory" : "failure");

  fetch(response_url, {
    method: "POST",
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: correct ? "*CORRECT 🎉️*" : "*ERRR... ☠️",
          },
          accessory: {
            type: "image",
            image_url: gif,
            alt_text: "member",
          },
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
