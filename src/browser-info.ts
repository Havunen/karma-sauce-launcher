import {SauceLabsOptions} from 'saucelabs'

interface Results {
  status: string;
  message: string;
  screenshot: string;
}

/**
 * This interface describes a browser that has been launched with Saucelabs. This is helpful
 * when reporting the results to the Saucelabs web API.
 */
export interface SaucelabsBrowser extends SauceLabsOptions {
  /** Saucelabs session id of this browser. */
  sessionId: string;

  /** All test results will be stored here **/
  results: Results[];
}

/** Type that describes the BrowserMap injection token. */
export type BrowserMap = Map<number, SaucelabsBrowser>;
