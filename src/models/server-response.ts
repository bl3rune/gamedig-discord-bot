import {QueryResult} from 'gamedig';

export class ServerResponse {
    game: string;
    result: QueryResult | undefined;

    constructor(game: string, result?: QueryResult){
        this.game = game;
        this.result = result
    }

}