import { PollingProvider } from './polling-provider';
import { Type } from 'gamedig';
import Gamedig = require("gamedig");
import { GameUrl } from '../models/game-url';
import { ServerResponse } from '../models/server-response';

export class GamedigQueryProvider extends PollingProvider {

    private gameUrls: GameUrl[];

    private gamedig = new Gamedig({ listenUdpPort: process.env.UDP_PORT ? parseInt(process.env.UDP_PORT) : undefined});

    constructor() {
        super();
        let rawGameUrls = (process.env.GAME_URLS || '').split(',');                                                 
        this.gameUrls = rawGameUrls.filter((raw) => raw.split(':').length > 1).map(g => {
            let rawUrl = g.split(':');
            return {
                game: rawUrl[0] as Type,
                host: rawUrl[1],
                port: rawUrl[2] ? parseInt(rawUrl[2]) : undefined
            } as GameUrl;
        });
    }

    protected async retrieve(): Promise<ServerResponse[]> {
        let results = new Array<ServerResponse>();
        for (let g of this.gameUrls) {
            results.push(new ServerResponse(g.game,
                await this.gamedig.query({
                    type: g.game,
                    host: g.host,
                    port: g.port,
                }).catch((e) => undefined)
            ));
        }
        return results;
    }
}
