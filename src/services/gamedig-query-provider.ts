import {PollingProvider} from './polling-provider';
import {query, QueryResult, Type} from 'gamedig';

export class GamedigQueryProvider extends PollingProvider {

    private game: Type;
    private host: string;
    private port: number | undefined;

    constructor() {
        super();
        this.game = process.env.GAME as Type;
        this.host = process.env.HOST || '';
        this.port = process.env.PORT ? parseInt(process.env.PORT || '0') : undefined;
    }

    protected async retrieve(): Promise<QueryResult> {
        return await query({
            type: this.game,
            host: this.host,
            port: this.port,
        });
    }
}
