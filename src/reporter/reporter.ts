import {BrowserMap} from "../browser-info.js";
import {Job, default as SauceApi} from "saucelabs/build/index.js";

const REGION_MAPPING = {
  'us': '', // default endpoint
  'eu': 'eu-central-1.',
};

/**
 * Get the Sauce Labs endpoint
 * @param region
 */
function getSauceEndpoint(region) {
  const shortRegion = REGION_MAPPING[region] ? region : 'us'

  return `https://app.${REGION_MAPPING[shortRegion]}saucelabs.com/tests/`
}

/**
 * Karma browser reported that updates corresponding Saucelabs jobs whenever a given
 * browser finishes.
 */
export function SaucelabsReporter(logger, browserMap: BrowserMap) {
  const log = logger.create('reporter.sauce');
  let pendingUpdates: Promise<Job>[] = [];
  this.adapters = [];

  // This fires when a single test is executed and will update the run in sauce labs with an annotation
  // of the test including the status of the test
  this.onSpecComplete = function (browser, result) {
    const browserId = browser.id;
    const browserData = browserMap.get(browserId);

    // Do nothing if the current browser has not been launched through the Saucelabs
    // launcher.
    if (!browserData) {
      return;
    }

    const status = result.success ? '✅' : result.skipped ? '➖' : '❌';

    browserData.results.push({
      status: 'info',
      message: `${status} ${result.fullName || result.description}`,
      screenshot: null
    })

    if (!result.success && result.log.length > 0) {
      browserData.results.push({
        status: 'info',
        message: `${result.log[0]}`,
        screenshot: null
      })
    }
  }

  // This fires whenever any browser completes. This is when we want to report results
  // to the Saucelabs API, so that people can create coverage banners for their project.
  this.onBrowserComplete = function (browser) {
    const result = browser.lastResult;
    const browserId = browser.id;

    if (result.disconnected) {
      log.error('✖ Browser disconnected');
    }

    if (result.error) {
      log.error('✖ Tests errored');
    }

    const browserData = browserMap.get(browserId);

    // Do nothing if the current browser has not been launched through the Saucelabs
    // launcher.
    if (!browserData) {
      return;
    }

    const {sessionId} = browserData;
    // @ts-ignore
    const api = new (SauceApi as any).default({
      user: browserData.user,
      key: browserData.key,
      region: browserData.region
    });
    const hasPassed = !result.failed && !result.error && !result.disconnected;

    // Update the job by reporting the test results. Also we need to store the promise here
    // because in case "onExit" is being called, we want to wait for the API calls to finish.
    pendingUpdates.push(api.updateJob(browserData.user, sessionId, {
      id: sessionId,
      passed: hasPassed,
      'custom-data': result
    }));

    log.info(`Check out job at ${getSauceEndpoint(browserData.region)}${sessionId}`)
  };

  // Whenever this method is being called, we just need to wait for all API calls to finish,
  // and then we can notify Karma about proceeding with the exit.
  this.onExit = (doneFn: () => void) => Promise.all(pendingUpdates).then(
    doneFn,
    (error) => {
      log.error('Could not report results to Saucelabs: %s', error)
      doneFn()
    }
  );
}
