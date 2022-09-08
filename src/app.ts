import {GamedigQueryProvider} from './services/gamedig-query-provider';
import {QueryResult} from 'gamedig';
import {DiscordPublisher} from './services/discord-publisher';
import {Subscription} from 'rxjs';

export class App {
    private provider: GamedigQueryProvider;
    private publisher: DiscordPublisher;
    private updateSubscription: Subscription | undefined;

    constructor() {
        this.provider = new GamedigQueryProvider();
        this.publisher = new DiscordPublisher();
    }

    public async isReady() {

        if (!process.env.GAME) {
            throw new Error('GAME needs to be set from list!');
        }
        if (!process.env.HOST) {
            throw new Error('HOST needs to be set!');
        }
        if (!process.env.DISCORD_TOKEN) {
            throw new Error('DISCORD_TOKEN needs to be set!');
        }

        await this.publisher.isReady();
    }

    public async start() {
        this.updateSubscription = this.provider.provide().subscribe(async (status: QueryResult | undefined) => {
            await this.publisher.publish(status);
        })
    }

    public shutdown() {
        this.publisher.destroy();
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }
}
