import { ActivityType, Client, GatewayIntentBits, SendableChannels } from 'discord.js';
import { ServerResponse } from '../models/server-response';

export class DiscordPublisher {
private client: Client;
private ready: Promise<string>;
private serverUp: Map<string,boolean>;

    constructor() {
        var client = new Client({intents: [GatewayIntentBits.Guilds]});
        client.on('ready', () => console.log(`Logged in as ${client.user?.tag}!`));
        client.on('error', (error) => {
            console.log(error);
            throw new Error('Failed to create client');
        });

        client.on('warn', console.log);

        this.client = client;
        this.serverUp = new Map<string,boolean>();
        this.ready = client.login(process.env.DISCORD_TOKEN || '');
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
                activities = activities + activitySeperator;
            }
            activities = activities + activity;
            if (!this.serverUp.get(s.game)) {
                console.log(`${s.game} : ${activity}`);
                console.log(status);
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

    async announce(game: string, serverUp: boolean) {
        if (process.env.DISCORD_CHANNEL) {
            const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL);
            if (channel?.isSendable) {
                const textChat = channel as SendableChannels;
                let message = '';
                if (serverUp) {
                    message = process.env['UP' + '.' + game] || process.env['UP'] || '';
                } else {
                    message = process.env['DOWN' + '.' + game] || process.env['DOWN'] || '';
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
            name = nameOverride;
        }

        let nameField = process.env['NAME_FIELD' + '.' + response.game];
        if (nameField  && name === '') {
            name = `${(status as any)[nameField]}`;
        }

        let rawNameField = process.env['RAW_NAME_FIELD' + '.' + response.game];
        if (rawNameField && name === '') {
            name = `${raw[rawNameField]}`;
        }

        if (name === '') {
            name = `${raw['game'] || status.name.replace(/[^a-zA-Z0-9 -]/g, '') || response.game}`
        }

        name = `${name} ${status.players.length}/${status.maxplayers} (${status.ping}ms) ${status.password ? '🔒': ''}`;
            
        return name;
    }

}
