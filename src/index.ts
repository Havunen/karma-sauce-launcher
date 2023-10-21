import {SaucelabsLauncher} from './launcher/index.js';
import {SaucelabsReporter} from "./reporter/index.js";
import {BrowserMap, SaucelabsBrowser} from "./browser-info.js";
import {SauceConnect} from "./local-tunnel/sauceconnect.js";

module.exports = {
  // TODO: make these injectable's classes by using factories.
  'launcher:SauceLabs': ['type', SaucelabsLauncher],
  'reporter:saucelabs': ['type', SaucelabsReporter],

  // Provide a service for establishing a SauceConnect tunnel.
  'SauceConnect': ['type', SauceConnect],

  // Provide a map that can be used to determine information about browsers that
  // have been launched with Saucelabs.
  'browserMap': ['value', new Map<number, SaucelabsBrowser>() as BrowserMap]
};
