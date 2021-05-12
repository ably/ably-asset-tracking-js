/* eslint-disable no-var */
import { BrowserType, chromium, webkit, firefox, ChromiumBrowser, FirefoxBrowser, WebKitBrowser } from 'playwright';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import config from './webpack.config';

const port = 3001;
const host = 'localhost';

declare var onTestLog: (evt: { type: string; detail: string }) => void;
declare var onTestResult: (evt: { type: string; detail: { pass: boolean; passes: number; total: number } }) => void;

const server = new WebpackDevServer(webpack(config), { ...config.devServer, open: false });

server.listen(port, host, async () => {
  await runTests(chromium);
  await runTests(webkit);
  await runTests(firefox);

  server.close();
});

const runTests = async (browserType: BrowserType<ChromiumBrowser | WebKitBrowser | FirefoxBrowser>): Promise<void> => {
  const browser = await browserType.launch();
  const page = await browser.newPage();
  await page.goto(`http://${host}:${port}`);

  console.log(`\nrunning tests in ${browserType.name()}`);

  await new Promise<void>((resolve) => {
    page.exposeFunction('onTestLog', (({ detail }) => {
      console.log(detail);
    }) as typeof onTestLog);

    page.exposeFunction('onTestResult', (({ detail }) => {
      console.log(`${browserType.name()} tests complete: ${detail.passes}/${detail.total} passed`);
      if (detail.pass) {
        browser.close();
        resolve();
      } else {
        console.log(`${browserType.name()} tests failed, exiting with code 1`);
        process.exit(1);
      }
    }) as typeof onTestResult);

    page.evaluate(() => {
      window.addEventListener('testLog', (({ type, detail }: CustomEvent) => {
        onTestLog({ type, detail });
      }) as EventListener);
      window.addEventListener('testResult', (({ type, detail }: CustomEvent) => {
        onTestResult({ type, detail });
      }) as EventListener);
    });
  });
};
