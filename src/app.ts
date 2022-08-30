import dotenv from "dotenv";
import express from "express";
import fetch from "node-fetch";
import { writeAnswer } from "./services/db";

import {
  fetchMemberList,
  fetchRandomMember,
  sendMessageToUser,
} from "./services/webapi";
import { replySlackBlocks, searchGiphy } from "./utils";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT ?? 8881;

app.post("/slack/slash/new", async (req, res) => {
  const reply = await fetchRandomMember();
  res.send(reply);
});

app.post("/slack/message_action", async (req, res) => {
  const { actions, response_url, user } = JSON.parse(req.body.payload);

  if (actions[0].action_id === "try_again") {
    const member = await fetchRandomMember();
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
    const members = await fetchMemberList();
    const correctMember = members.find(
      ({ id }) => `member-${id}` === actions[0].action_id
    );
    resultText = `☠️ Correct answer was *${correctMember.name}*`;
  }
  writeAnswer({
    bySlackId: user.id,
    correctAnswerId: actions[0].action_id,
    givenAnswerId: answered,
    isCorrect: correct,
  });
  const blocks = [
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
            text: "Go again?",
            emoji: true,
          },
          value: "try_again",
          action_id: "try_again",
        },
      ],
    },
  ];
  replySlackBlocks(response_url, blocks);
  res.send();
});

// UNUSED
app.post("/slack/auth", async (req, res) => {
  res.send();
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/slack/event", async (req, res) => {
  const { challenge } = req.body;
  if (challenge) {
    res.send(challenge);
    return;
  }
  if (
    req.body.event?.type === "message" &&
    req.body.event?.bot_id === undefined &&
    req.body.event?.subtype !== "message_changed" &&
    req.body.event?.message?.subtype !== "bot_message"
  ) {
    await sendMessageToUser(req.body.event.channel);
  }
  res.send();
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
