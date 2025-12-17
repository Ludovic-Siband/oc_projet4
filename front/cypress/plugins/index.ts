/**
 * @type {Cypress.PluginConfig}
 */

const registerCodeCoverageTasks = require('@cypress/code-coverage/task');

 export default (on, config) => {
   registerCodeCoverageTasks(on, config);
   return config;
 };
