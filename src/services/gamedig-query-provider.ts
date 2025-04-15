import { PollingProvider } from './polling-provider';
import { GameDig } from 'gamedig';
import { GameUrl } from '../models/game-url';
import { ServerResponse } from '../models/server-response';

export class GamedigQueryProvider extends PollingProvider {

    private supportedSpecialCases = ['terrariatshock'];

    private gameUrls: GameUrl[];

    private gamedig = new GameDig({ listenUdpPort: process.env.UDP_PORT ? parseInt(process.env.UDP_PORT) : undefined});

    constructor() {
        super();
        let rawGameUrls = (process.env.GAME_URLS || '').split(',');                                                 
        this.gameUrls = rawGameUrls.filter((raw) => raw.split(':').length > 1).map(g => {
            let rawUrl = g.split(':');
            return {
                game: rawUrl[0],
                host: rawUrl[1],
                port: rawUrl[2] ? parseInt(rawUrl[2]) : undefined,
                additionalField: rawUrl[3] ? rawUrl[3] as string : undefined
            } as GameUrl;
        });
    }

    protected async retrieve(): Promise<ServerResponse[]> {
        let results = new Array<ServerResponse>();
        for (let g of this.gameUrls) {
            var token;
            if (g.additionalField && this.supportedSpecialCases.includes(g.game)) {
                // Handle special case here - you might need to adjust the query parameters
                switch (g.game) {
                    case 'terrariatshock':
                        token = g.additionalField;
                        break;
                    default:
                        console.log(`Unsupported additional field: ${g.additionalField}`);
                        continue;
                }

            }
            results.push(new ServerResponse(g.game,
                await this.gamedig.query({
                    type: g.game,
                    host: g.host,
                    port: g.port,
                    token: token
                }).catch((e) => undefined)
            ));
        }
        return results;
    }
}
