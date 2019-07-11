'use strict';

class serverlessPluginConditionalFunctions {
    /**
     *
     * @param {*} serverless
     * @param {*} options
     */
    constructor(serverless, options = {}) {
        this.serverless = serverless;
        this.options = options;
        this.hooks = {
            "before:package:initialize": this.applyConditions.bind(this),
            "before:offline:start:init": this.applyConditions.bind(this),
        };
        this.pluginName = "serverless-plugin-conditional-functions";
    }
    /**
     *
     */
    applyConditions() {
        let functions = this.serverless.service.functions;
        if (!this.isValidObject(functions)) {
            return;
        }
        Object.keys(functions).forEach((functionName) => {
            let functionObject = functions[functionName]
            if (functionObject.enabled) {
                try {
                    let functionEnabledValue = eval(functionObject.enabled);
                    let action = functionEnabledValue ? "Enable" : "Disable";

                    this.logConditionEvaluation(functionObject.enabled, functionEnabledValue);
                    this.verboseLog(this.pluginName + " - " + action + ": " + functionObject.name);
                    if (!functionEnabledValue) {
                        delete this.serverless.service.functions[functionName];
                    }
                } catch (exception) {
                    this.logException(functionObject.enabled, exception);
                }
            }
        });
    }

    /**
     *
     * @param {*} item
     */
    isValidObject(item) {
        return item && typeof item == "object";
    }

    /**
     *
     * @param {*} condition
     * @param {*} matched
     */
    logConditionEvaluation(condition, matched) {
        this.verboseLog(this.pluginName + " - " +
                        "Condition: " + condition + ". " +
                        "Evaluation: " + matched);
    }

    /**
     *
     * @param {*} text
     */
    verboseLog(text) {
        if (this.options.v || this.options.verbose) {
            this.serverless.cli.log(text);
        }
    }

    /**
     *
     * @param {*} condition
     * @param {*} exception
     */
    logException(condition, exception) {
        this.serverless.cli.log(
            this.pluginName + " - " +
            "exception evaluating condition " + condition + " : " +
            exception);
    }
}

module.exports = serverlessPluginConditionalFunctions;
