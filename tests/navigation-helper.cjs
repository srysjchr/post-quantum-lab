// Regression flows enter collapsed exercises through the same menu as learners.
async function act(page, selector, method, ...args) {
  const locator = page.locator(selector);
  const panel = await locator.first().evaluate(el => el.closest('[data-exercise-panel]')?.dataset.exercisePanel || null);
  if (panel && !(await locator.first().isVisible())) {
    await page.selectOption('#exercise-picker', panel);
    await page.locator('#exercise-open').click();
  }
  return locator[method](...args);
}
module.exports = {act};
