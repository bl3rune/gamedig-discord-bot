# Gamedig Discord Bot
This is a bot implementation for the Discord API to announce server availability, publish the game server data as the current activity of the bot.
This supports a wide range of different game types and only requires the game servers hostname / IP address as well as the query port. No api credentials or similar things are needed.
This protocol will query the game server directly. Please make sure that the host where the bot is hosted, is able to access the game server on the specified query port.


## Installation

There are two ways to run and configure this discord bot:

* as a docker container
* as a plain nodejs app


### Run as a plain nodejs app

* Build the project: `npm install`
* Start the bot: `npm start`
* Configure the bot with the necessary configuration

### Run as docker app

#### Docker compose
```yaml
---
services:
  gamedig-discord-bot:
    image: bl3rune/gamedig-discord-bot:latest
    container_name: gamedig-discord-bot
    environment:
      - GAME_URLS=minecraft:mysite.com:25565,valheim:mysite.com
      - DISCORD_TOKEN=add-token-here
    ports:
      - 80:80 # Optional for HTTP Server
    restart: unless-stopped
```

#### Docker cli
```bash
docker run -d \
  --name=gamedig-discord-bot \
  -e GAME_URLS=minecraft:mysite.com:25565,valheim:mysite.com \
  -e DISCORD_TOKEN=add-token-here \
  -p 80:80 \
  --restart unless-stopped \
  bl3rune/gamedig-discord-bot:latest
```

## Usage

### GameUrl Format

This format holds 3 key pieces of information:
- One of the supported game types. See the [list of supported games](https://github.com/gamedig/node-gamedig/blob/HEAD/GAMES_LIST.md) for the Game Type ID of your game.
- The hostname / IP address of the game server you want to query.
- (Optional) The query port configured for the game server.

This information is formatted in the following structure with the port being optional : `game:host:port` or `game:host`
Here are some examples below:
- Omitting port number `minecraft:mysite.com`
- With port number `minecraft:mysite.com:25565`
- Using ip instead of hostname `valheim:23.4.140.70`
- Multiple defined in `GAME_URLS` config `minecraft:mysite.com:25565,valheim:mysite.com`

### HTTP Server Requests
Disabled by default, but can be configured using the `HTTP_ENABLED` variable.
Handles requests in the format : `/server/protocol/port` or `/server/protocol`
Can be locked down to only allow querying of specific severs using `HTTP_ALLOWED_SERVERS`

## Configuration

When running as a docker container provide the following as Docker environment variables.
When running as a nodejs app you can create an `.env` file in the root directory of the project and set the options there (see the `.env.example` file for an example). 
You need to set the following configuration options.

| Required | Configuration option   | Default             | Description                                                                                                                          | Value    |
| -------- | ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| TRUE     | `GAME_URLS`            |                     | Comma seperated list of GameUrl format entries [see GameUrl format section](#gameurl-format)                                         | `string` |
| TRUE     | `DISCORD_TOKEN`        |                     | The bot token of your discord app from https://discord.com/developers/applications -> (Select your application) -> Bot -> Token      | `string` |
| FALSE    | `DISCORD_CHANNEL`      |                     | The channel id of your discord chat to send server availability to                                                                   | `string` |
| FALSE    | `POLLING_INTERVAL`     | 10000               | The polling interval to poll the servers in milliseconds                                                                             | `number` |
| FLASE    | `STATUS_THRESHOLD`     | 3                   | The number of consecutive times a server has to be counted as UP / DOWN before doing an announcement                                 | `number` |
| FALSE    | `UP.####`              |                     | Message to be sent on server available for game type `####` (`DISCORD_CHANNEL` must be provided)                                     | `string` |
| FALSE    | `DOWN.####`            |                     | Message to be sent on server unavailable for game type `####` (`DISCORD_CHANNEL` must be provided)                                   | `string` |
| FALSE    | `UP`                   |                     | Default message to be sent on server available for any game when `UP.####` is not available (`DISCORD_CHANNEL` must be provided)     | `string` |
| FALSE    | `DOWN`                 |                     | Default message to be sent on server unavailable for any game when `DOWN.####` is not available (`DISCORD_CHANNEL` must be provided) | `string` |
| FALSE    | `IDLE_STATUS`          | `No servers running`| Override idle status messaging for the bot when no servers are available                                                             | `string` |
| FALSE    | `SEPERATOR`            | ` ///// `           | Override the seperator text that appears between multiple activities                                                                 | `string` |
| FALSE    | `NAME_OVERRIDE.####`   |                     | Override the activity name for game type `####` with : variable string value                                                         | `string` |
| FALSE    | `NAME_FIELD.####`      |                     | Override the activity name for game type `####` with : field on the response object (response[NAME_FIELD])                           | `string` |
| FALSE    | `RAW_NAME_FIELD.####`  |                     | Override the activity name for game type `####` with : field in the raw section of the response (response.raw[RAW_NAME_FIELD])       | `string` |
| FALSE    | `UDP_PORT`             |                     | Use a fixed UDP port see https://www.npmjs.com/package/gamedig/v/4.3.1#specifying-a-listen-udp-port-override                         | `string` |
| FALSE    | `HTTP_ENABLED`         | FALSE               | Enable the HTTP server that handles direct requests in the format : `/server/protocol/port` or `/server/protocol`                    | `boolean`|
| FALSE    | `HTTP_PORT`            | 80                  | HTTP port to host server on and handle requests in the format : `/server/protocol/port` or `/server/protocol`                        | `number` |
| FALSE    | `HTTP_ALLOWED_SERVERS` |                     | List of allowed server addresses to filter HTTP request by, seperated by a `:` e.g.`example.com:test.net` Disabled by default.       | `string` |
     