import {QueryResult, Type} from 'gamedig';

export class ServerResponse {
    game: Type;
    result: QueryResult | undefined;

    constructor(game: Type, result?: QueryResult){
        this.game = game;
        this.result = result
    }

}