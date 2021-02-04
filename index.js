'use strict';

/**
  * Plugin Class
  */
class serverlessPluginConditionalFunctions {
  /**
    * C'tor
    * @param {*} serverless
    * @param {*} options
    */
  constructor(serverless, options = {}) {
    this.serverless = serverless;
    // Define schema for 'enabled' to pass serverless.yml validation
    if (this.hasValidationSupport(serverless)) {
      serverless.configSchemaHandler.defineFunctionProperties(serverless.service.provider.name, {
        properties: {
          enabled: {type: 'string'},
        },
      });
    }
    this.options = options;
    this.hooks = {
      'before:package:initialize': this.applyConditions.bind(this),
      'before:offline:start:init': this.applyConditions.bind(this),
    };
    this.pluginName = 'serverless-plugin-conditional-functions';
  }
  /**
    * Evaluates function 'enabled' states
    */
  applyConditions() {
    const functions = this.serverless.service.functions;
    if (!this.isValidObject(functions)) {
      return;
    }
    Object.keys(functions).forEach((functionName) => {
      const functionObj = functions[functionName];
      if (functionObj.enabled) {
        try {
          const functionEnabledValue = eval(functionObj.enabled);
          const action = functionEnabledValue ? 'Enable' : 'Disable';

          this.logConditionValue(functionObj.enabled, functionEnabledValue);
          this.verboseLog(this.pluginName + ' - ' + action + ': ' + functionObj.name);
          if (!functionEnabledValue) {
            delete this.serverless.service.functions[functionName];
          }
        } catch (exception) {
          this.logException(functionObj.enabled, exception);
        }
      }
    });
  }

  /**
    * Object validation
    * @param {*} item
    * @return {boolean} whether the object is valid
    */
  isValidObject(item) {
    return item && typeof item == 'object';
  }

  /**
    * Logs condition evaluation
    * @param {*} condition
    * @param {*} matched
    */
  logConditionValue(condition, matched) {
    this.verboseLog(this.pluginName + ' - ' +
                    'Condition: ' + condition + '. ' +
                    'Evaluation: ' + matched);
  }

  /**
    * Writes to log if verbose flag given
    * @param {*} text
    */
  verboseLog(text) {
    if (this.options.v || this.options.verbose) {
      this.serverless.cli.log(text);
    }
  }

  /**
    * Logs exception in a readable format
    * @param {*} condition
    * @param {*} exception
    */
  logException(condition, exception) {
    this.serverless.cli.log(
        this.pluginName + ' - ' +
            'exception evaluating condition ' + condition + ' : ' +
            exception);
  }

  /**
   * Validates serverless object has required validation fields
   * @param {*} serverless
   */
  hasValidationSupport(serverless) {
    return serverless.configSchemaHandler &&
           serverless.configSchemaHandler.defineFunctionProperties &&
           typeof serverless.configSchemaHandler['defineFunctionProperties'] == 'function';
  }
}

module.exports = serverlessPluginConditionalFunctions;
