/**
 * @type {Cypress.PluginConfig}
 */
// `@cypress/code-coverage/task` exports a function (CommonJS default export).
// Using `import * as ...` turns it into an object, which breaks at runtime.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const registerCodeCoverageTasks = require('@cypress/code-coverage/task');

 export default (on, config) => {
   registerCodeCoverageTasks(on, config);
   return config;
 };
