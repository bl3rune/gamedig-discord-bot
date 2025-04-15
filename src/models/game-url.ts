export class GameUrl {

    game: string;
    host: string;
    port: number | undefined;
    additionalField: string | undefined;

    constructor(game: string, host: string, port?: number, additionalField?: string) {
        this.game = game;
        this.host = host;
        this.port = port;
        this.additionalField = additionalField;
    }
}