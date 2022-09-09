import { Type } from "gamedig";

export class GameUrl {

    game: Type;
    host: string;
    port: number | undefined;

    constructor(game: Type, host: string, port?: number) {
        this.game = game;
        this.host = host;
        this.port = port;
    }
}