export class GameUrl {

    game: string;
    host: string;
    port: number | undefined;

    constructor(game: string, host: string, port?: number) {
        this.game = game;
        this.host = host;
        this.port = port;
    }
}