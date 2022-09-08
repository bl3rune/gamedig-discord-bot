import {ActivityType, Client, GatewayIntentBits, TextBasedChannel} from 'discord.js';
import { QueryResult } from 'gamedig';

export class DiscordPublisher {
private client: Client;
private ready: Promise<string>;
private serverAvailable = false;

    constructor() {
        var client = new Client({intents: [GatewayIntentBits.Guilds]});
        client.on('ready', () => console.log(`Logged in as ${client.user?.tag}!`));
        client.on('error', (error) => {
            console.log(error);
            throw new Error('Failed to create client');
        });

        client.on('warn', console.log);

        this.ready = client.login(process.env.DISCORD_TOKEN || '');
        this.client = client;
    }

    public async isReady(): Promise<string> {
        return this.ready;
    }

    public destroy() {
        this.client.destroy();
    }

    async publish(status: QueryResult | undefined): Promise<void> {
        if (status === undefined) {
            if (this.serverAvailable) {
                this.announce(false);
            }
            await this.client.user?.setPresence({
                status: 'idle',
                activities: [{
                   type: ActivityType.Watching,
                   name: 'the server do nothing'
                }],
            });
            this.serverAvailable = false;
        } else {
            let name = '';
            let raw = status.raw as any;
            if (raw) {
                name = name + raw['game'] + ' - ';
            } else {
                name = name + status.name + ' - ';
            }
            name = name + status.players.length + '/' + status.maxplayers + ' ';
            name = name + '(' + status.ping + 'ms)';
            
            if (!this.serverAvailable) {
                console.log('SERVER INFO :::: ' + name);
                this.announce(true);
            }
            await this.client.user?.setPresence({
                status: 'online',
                activities: [{
                    type: ActivityType.Playing,
                    name: name
                }]
            });
            this.serverAvailable = true;
        }
    }

    async announce(serverUp: boolean) {
        if (process.env.DISCORD_CHANNEL) {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL);
            if (channel?.isTextBased()) {
                const textChat = channel as TextBasedChannel;
                if (serverUp) {
                    textChat.send(process.env.SERVER_UP_MESSAGE || 'The server has started!');
                } else {
                    textChat.send(process.env.SERVER_DOWN_MESSAGE || 'The server has stopped!');
                }
            }
        }

    }
}
