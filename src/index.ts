import { config } from 'dotenv';
import { App } from './app';

config();

console.log('Starting Discord Bot...');
const app = new App();
app.isReady().then(async () => {
    console.log('App setup done...');
    await app.start();
}, (e) => {
    console.log('Error starting the bot', e);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('App is shutting down on user event');
    app.shutdown();
    process.exit(0);
});
