## slack-flash

Flashcard-like game for remembering peoples names from a slack channel

Fetches profile pics from Slack channel and displays profile pictures one by one with names hidden.

There are shortctus: Hit the UP key to reveal the name, hit the RIGHT key to go next.


# Getting started
Built with Next.js so its server side rendered React.

You need the following environment variables:
 * `SLACK_API_KEY` - Token from Slack
 * `SLACK_CHANNEL_ID` - Slack channel ID to fetch members from (find it using https://slack.com/api/channels.list)


```bash
npm i
cp .env.local.default .env.local  # get your keys
npm run dev
```
