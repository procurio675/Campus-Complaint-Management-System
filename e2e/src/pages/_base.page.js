import { BASE_URL } from '../config/test.config.js';

/**
 * Base Page Object
 * Only navigation + locator getters.
 * NO click helpers, NO fill helpers, NO waits.
 */

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path = '') {
    await this.page.goto(`${BASE_URL}${path}`);
  }

  getTestId(id) {
    return this.page.getByTestId(id);
  }
}
