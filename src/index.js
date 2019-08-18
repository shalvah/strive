'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const log = require('debug')('lib:essayer');
const utils_1 = require("./utils");
const defaultOptions = {
    ignoreErrors: true,
};
const tryThese = async (options = defaultOptions) => {
    const { mutations, values, action, strategies, defaultValue, checker, ignoreErrors } = options;
    // Fuck it, TypeScript, I know what I'm doing!
    if (strategies) {
        return tryTheseWithStrategies({ strategies, checker, ignoreErrors, defaultValue });
    }
    if (values) {
        return tryTheseWithValues({ values, action, checker, ignoreErrors, defaultValue });
    }
    return tryTheseWithMutations({ mutations, action, checker, ignoreErrors, defaultValue });
};
const tryTheseWithMutations = async ({ mutations = [], action, checker, ignoreErrors = true, defaultValue }) => {
    let mutation, result;
    const iterator = mutations[Symbol.iterator]();
    for (let next = iterator.next(); !next.done; next = iterator.next()) {
        mutation = next.value;
        log(`Trying ${mutation.name}`);
        const parameters = await mutation();
        try {
            result = await action(...parameters);
        }
        catch (e) {
            if (ignoreErrors) {
                continue;
            }
            else {
                throw e;
            }
        }
        if (checker(result)) {
            return utils_1.returnSuccess(mutation.name, result);
        }
    }
    return utils_1.returnFailure(mutation && mutation.name, result, defaultValue);
};
const tryTheseWithValues = async ({ values = [], action, checker, ignoreErrors = true, defaultValue, }) => {
    let value, index, result;
    for ([index, value] of Object.entries(values)) {
        log(`Trying ${JSON.stringify(value)}`);
        try {
            result = await action(value);
        }
        catch (e) {
            if (ignoreErrors) {
                continue;
            }
            else {
                throw e;
            }
        }
        if (checker(result)) {
            return utils_1.returnSuccess(Number(index), result);
        }
    }
    return utils_1.returnFailure(Number(index), result, defaultValue);
};
const tryTheseWithStrategies = async ({ strategies = [], checker, ignoreErrors = true, defaultValue, }) => {
    let strategy, result;
    const iterator = strategies[Symbol.iterator]();
    for (let next = iterator.next(); !next.done; next = iterator.next()) {
        strategy = next.value;
        log(`Trying ${strategy.name}`);
        try {
            result = await strategy();
        }
        catch (e) {
            if (ignoreErrors) {
                continue;
            }
            else {
                throw e;
            }
        }
        if (checker(result)) {
            return utils_1.returnSuccess(strategy.name, result);
        }
    }
    return utils_1.returnFailure(strategy && strategy.name, result, defaultValue);
};
module.exports = tryThese;
