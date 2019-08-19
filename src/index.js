'use strict';
const log = require('debug')('lib:strive');
const utils_1 = require("./utils");
const strive = async (options = {
    ignoreErrors: true,
}) => {
    const { mutations, values, action, strategies, checker, defaultValue, ignoreErrors, } = options;
    // Fuck it, TypeScript, I know what I'm doing!
    if (strategies) {
        return striveWithStrategies({ strategies, checker, ignoreErrors, defaultValue });
    }
    if (values) {
        return striveWithValues({ values, action, checker, ignoreErrors, defaultValue });
    }
    return striveWithMutations({ mutations, action, checker, ignoreErrors, defaultValue });
};
const striveWithMutations = async ({ mutations = [], action, checker, ignoreErrors = true, defaultValue }) => {
    let mutation, result;
    for (mutation of Object.values(mutations)) {
        log(`Trying mutation ${mutation.name}`);
        const parameters = await mutation();
        try {
            result = await action(...parameters);
        }
        catch (e) {
            if (ignoreErrors)
                continue;
            else
                throw e;
        }
        if (checker(result)) {
            return utils_1.returnSuccess(mutation.name, result);
        }
    }
    return utils_1.returnFailure(mutation && mutation.name, result, defaultValue);
};
const striveWithValues = async ({ values = [], action, checker, ignoreErrors = true, defaultValue, }) => {
    let value, index, result;
    for ([index, value] of Object.entries(values)) {
        log(`Trying value at ${index}: ${JSON.stringify(value)}`);
        try {
            result = await action(value);
        }
        catch (e) {
            if (ignoreErrors)
                continue;
            else
                throw e;
        }
        if (checker(result)) {
            return utils_1.returnSuccess(Number(index), result);
        }
    }
    return utils_1.returnFailure(Number(index), result, defaultValue);
};
const striveWithStrategies = async ({ strategies = [], checker, ignoreErrors = true, defaultValue, }) => {
    let strategy, result;
    for (strategy of Object.values(strategies)) {
        log(`Trying strategy ${strategy.name}`);
        try {
            result = await strategy();
        }
        catch (e) {
            if (ignoreErrors)
                continue;
            else
                throw e;
        }
        if (checker(result)) {
            return utils_1.returnSuccess(strategy.name, result);
        }
    }
    return utils_1.returnFailure(strategy && strategy.name, result, defaultValue);
};
module.exports = strive;
