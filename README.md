# slack-flash
Flashcard-like game for remembering peoples names from a slack channel

Fetches profile pics from Slack channel and displays profile pictures one by one with names hidden.

Hit UP-key to reveal name, Hit RIGHT-key to go next.


# installation
Built with Next.js so its server-rendered React.

You need enviornment: 
 * `SLACK_API` token from Slack
 * `CHANNEL_ID` slack channel to fetch members from (find it using https://slack.com/api/channels.list)

Start dev server with:
```
npm i -g now
npm i 
now dev
```
