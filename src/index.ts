import { config } from 'dotenv';
import { App } from './app';
import { GameDig } from 'gamedig';
const http = require("http");
const url = require("url");

config();

console.log('Starting Discord Bot...');
const app = new App();
app.isReady().then(async () => {
    console.log('App setup done...');
    await app.start();
}, (e) => {
    console.log('Error starting the bot', e);
    process.exit(1);
});

const gamedig = new GameDig({ listenUdpPort: process.env.UDP_PORT ? parseInt(process.env.UDP_PORT) : undefined});
const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 80;

if (process.env.HTTP_ENABLED) {
  console.log('Starting HTTP Server...');
  http.createServer(async (req: any, res: any) => {
      let urlPath = req.url;
      if (urlPath.charAt(0) == "/") urlPath = urlPath.substr(1);
      const rawGameUrl = urlPath.split('/');
      if (rawGameUrl.length < 2) {
        return res.end('Invalid URL format');
      }
      const host = rawGameUrl[0];
      const gameString = rawGameUrl[1];
      const port = rawGameUrl[2] ? parseInt(rawGameUrl[2]) : undefined;
      var q = url.parse(req.url, true).query;
      const token = q && q.token ? q.token as string : undefined;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      if (urlPath === "/" || urlPath === "") {
          res.end('Use gamedig queries like /server/game-protocol/port or /server/game-protocol (assumes default game port)');
      } else {
          if (process.env.HTTP_ALLOWED_SERVERS) {
            const allowed = process.env.HTTP_ALLOWED_SERVERS.split(':');
            if (allowed.every((val) => val.toLowerCase() != host.toLowerCase())) {
              res.end('Server address is not in list of HTTP_ALLOWED_SERVERS');
            }
          }
          try {
              const data = await gamedig.query({
                  type: gameString,
                  host: host,
                  port: port,
                  token: token
              }).catch(e => "Failed to connect to game server" + e);
              res.write(JSON.stringify(data))
          } catch(e) {
              res.write(e + " : see list of supported games (https://www.npmjs.com/package/gamedig#user-content-games-list) for the Game Type ID of your game");
          }
          res.end();
      }
  }).listen(httpPort, () => console.log("Listening for HTTP requests at " + httpPort));
}

process.on('SIGINT', () => {
    console.log('App is shutting down on user event');
    app.shutdown();
    process.exit(0);
});
