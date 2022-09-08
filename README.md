# Gamedig Discord Bot
This is a bot implementation for the Discord API to announce server availability, publish the game server data as the current activity of the bot.
This supports a wide range of different game types and only requires the game servers hostname / IP address as well as the query port. No api credentials or similar things are needed.
This protocol will query the game server directly. Please make sure that the host where the bot is hosted, is able to access the game server on the specified query port.


## Installation and usage

There are basically two ways to run and configure this discord bot:

* as a docker container
* as a plain nodejs app

#### Run as a plain nodejs app

* Build the project: `npm ci`
* Start the bot: `npm start`
* Configure the bot with the necessary configuration

### Configure the bot

You can create an `.env` file in the root directory of the project and set the options there (see the `.env.example` file for an example). 
You need to set the following configuration options.

| Required | Configuration option       | Description | Value  |
| -------- | -------------------------- | ----------- | ------ |
| TRUE     | `GAME`                     | One of the supported game types. See the [list of supported games](https://www.npmjs.com/package/gamedig#user-content-games-list) for the Game Type ID of your game. | `string` |
| TRUE     | `HOST`                     | The hostname / IP address of the game server you want to query. | `string` |
| FALSE    | `PORT`                     | The gamedig query port configured for the game server. | `number` |
| TRUE     | `DISCORD_TOKEN`            | The bot token of your discord app, obtained from https://discord.com/developers/applications -> (Select your application) -> Bot -> Token | `string` |
| FALSE    | `DISCORD_CHANNEL`          | The channel id of your discord chat to send server availability to | `string` |
| FALSE    | `SERVER_UP_MESSAGE`        | Message to be sent on server startup (DISCORD_CHANNEL must be provided) | `string` |
| FALSE    | `SERVER_DOWN_MESSAGE`      | Message to be sent on server startup (DISCORD_CHANNEL must be provided) | `string` |
