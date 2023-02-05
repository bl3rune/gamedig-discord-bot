import {ActivityType, Client, GatewayIntentBits, TextBasedChannel} from 'discord.js';
import { Type } from 'gamedig';
import { ServerResponse } from '../models/server-response';

export class DiscordPublisher {
private client: Client;
private ready: Promise<string>;
private serverUp: Map<Type,boolean>;

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
        this.serverUp = new Map<Type,boolean>();
    }

    public async isReady(): Promise<string> {
        return this.ready;
    }

    public destroy() {
        this.client.destroy();
    }

    async idlePresence(): Promise<void> {
        await this.client.user?.setPresence({
            status: 'idle',
            activities: [{
            type: ActivityType.Watching,
            name: process.env.IDLE_STATUS || 'No servers running'
            }],
        });
    }

    async publish(results: ServerResponse[] | undefined): Promise<void> {

        if (!results || results.length == 0) {
            this.serverUp.forEach((up, game) => {
                if (up) {
                    this.announce(game, false);
                }
                up = false
            });
            return this.idlePresence();
        }

        let activitySeperator = process.env.SEPERATOR ? process.env.SEPERATOR : ' ///// ';

        let activities = '';

        for(let s of results) {
            let status = s.result;

            if (!status) {
                if (this.serverUp.get(s.game)) {
                    this.announce(s.game, false);
                }
                this.serverUp.set(s.game,false);
                continue;
            }

            let activity = this.buildActivityText(s);
            
            if (activities != '') {
                activities = activities + ' ///// ';
            }
            activities = activities + activity;
            if (!this.serverUp.get(s.game)) {
                console.log(`${s.game} : ${activity}`);
                this.announce(s.game, true);
            }
            this.serverUp.set(s.game,true);
        }

        if (activities === '') {
            return this.idlePresence();
        } else {
            await this.client.user?.setPresence({
                status: 'online',
                activities: [{
                    type: ActivityType.Playing,
                    name: activities
                }]
            });
        }
    }

    async announce(game: Type, serverUp: boolean) {
        if (process.env.DISCORD_CHANNEL) {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL);
            if (channel?.isTextBased()) {
                const textChat = channel as TextBasedChannel;
                let message = '';
                if (serverUp) {
                    message = process.env['UP' + '.' + game] || '';
                } else {
                    message = process.env['DOWN' + '.' + game] || '';
                }
                if (message !== '') {
                    textChat.send(message);
                }
            }
        }
    }

    private buildActivityText(response: ServerResponse) : String {
        let status = response.result;
        
        if (!status) return '';

        let raw = status.raw as any;
        let name = '';

        let nameOverride = process.env['NAME_OVERRIDE' + '.' + response.game];
        if (nameOverride) {
            name = `${(status as any)[nameOverride]}`;
        }

        let rawNameOverride = process.env['RAW_NAME_OVERRIDE' + '.' + response.game];
        if (rawNameOverride && name === '') {
            name = `${raw[rawNameOverride]}`;
        }

        if (name === '') {
            name = `${raw['game'] || status.name.replace(/[^a-zA-Z0-9 -]/g, '') || response.game}`
        }

        name = `${name} ${status.players.length}/${status.maxplayers} (${status.ping}ms) ${status.password ? '🔒': ''}`;
            
        return name;
    }

}
