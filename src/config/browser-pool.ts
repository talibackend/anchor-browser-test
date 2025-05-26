import { BrowserPool, PuppeteerPlugin } from 'browser-pool';
import env from './env';
import puppeteer from 'puppeteer';

//@ts-ignore
// Ignoring ts checks to fix type issues

const puppeteerPlugin = new PuppeteerPlugin(puppeteer, {
  maxOpenPagesPerBrowser: env.MAX_OPEN_PAGES_PER_INSTANCE,
  launchOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

export default new BrowserPool({
  browserPlugins: Array(env.MAX_INSTANCES_IN_POOL).fill(puppeteerPlugin),
});
