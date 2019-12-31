'use strict';
const log = require('debug')('lib:strive');
const utils_1 = require("./utils");
const any = require('promise.any');
const strive = async (options = {
    ignoreErrors: true,
    race: false,
}) => {
    const { mutations, values, action, strategies, check, defaultValue, ignoreErrors, race, } = options;
    // Fuck it, TypeScript, I know what I'm doing!
    if (strategies) {
        return striveWithStrategies({ strategies, check, race, ignoreErrors, defaultValue });
    }
    if (values) {
        return striveWithValues({ values, action, check, ignoreErrors, race, defaultValue });
    }
    return striveWithMutations({ mutations, action, check, ignoreErrors, race, defaultValue });
};
const striveWithMutations = async ({ mutations = [], action, check, ignoreErrors = true, race = false, defaultValue }) => {
    if (race) {
        const trials = mutations.map(async (mutation) => {
            log(`Trying mutation ${mutation.name}`);
            const args = await mutation();
            return action(...args).then((result) => {
                if (check(result)) {
                    return { mutation, result };
                }
                return Promise.reject({ mutation, result });
            }).catch((error) => {
                return Promise.reject({ mutation, error });
            });
        });
        let firstSuccess;
        try {
            firstSuccess = await any(trials);
        }
        catch (e) {
            const lastError = e.errors.pop();
            if (ignoreErrors) {
                return utils_1.returnFailure(lastError.mutation.name, lastError.result, defaultValue);
            }
            else {
                if (lastError.error)
                    throw lastError.error;
                else
                    return utils_1.returnFailure(lastError.mutation.name, lastError.result, defaultValue);
            }
        }
        const { mutation, result } = firstSuccess;
        return utils_1.returnSuccess(mutation.name, result);
    }
    else {
        let mutation, result;
        for (mutation of Object.values(mutations)) {
            log(`Trying mutation ${mutation.name}`);
            const args = await mutation();
            try {
                result = await action(...args);
            }
            catch (e) {
                if (ignoreErrors)
                    continue;
                else
                    throw e;
            }
            if (check(result)) {
                return utils_1.returnSuccess(mutation.name, result);
            }
        }
        return utils_1.returnFailure(mutation && mutation.name, result, defaultValue);
    }
};
const striveWithValues = async ({ values = [[]], action, check, ignoreErrors = true, race = false, defaultValue, }) => {
    if (race) {
        const trials = values.map((value, index) => {
            log(`Trying value at ${index}: ${JSON.stringify(value)}`);
            return action(...value).then((result) => {
                if (check(result)) {
                    return { valueIndex: index, result };
                }
                return Promise.reject({ valueIndex: index, result });
            }).catch((error) => {
                return Promise.reject({ valueIndex: index, error });
            });
        });
        let firstSuccess;
        try {
            firstSuccess = await any(trials);
        }
        catch (e) {
            const lastError = e.errors.pop();
            if (ignoreErrors) {
                return utils_1.returnFailure(lastError.valueIndex, lastError.result, defaultValue);
            }
            else {
                if (lastError.error)
                    throw lastError.error;
                else
                    return utils_1.returnFailure(lastError.valueIndex, lastError.result, defaultValue);
            }
        }
        const { valueIndex, result } = firstSuccess;
        return utils_1.returnSuccess(valueIndex, result);
    }
    else {
        let value, index, result;
        for ([index, value] of Object.entries(values)) {
            log(`Trying value at ${index}: ${JSON.stringify(value)}`);
            try {
                result = await action(...value);
            }
            catch (e) {
                if (ignoreErrors)
                    continue;
                else
                    throw e;
            }
            if (check(result)) {
                return utils_1.returnSuccess(Number(index), result);
            }
        }
        return utils_1.returnFailure(Number(index), result, defaultValue);
    }
};
const striveWithStrategies = async ({ strategies = [], check, ignoreErrors = true, race = false, defaultValue, }) => {
    if (race) {
        const trials = strategies.map(strategy => {
            log(`Trying strategy ${strategy.name}`);
            return strategy().then((result) => {
                if (check(result)) {
                    return { strategy, result };
                }
                return Promise.reject({ strategy, result });
            }).catch((error) => {
                return Promise.reject({ strategy, error });
            });
        });
        let firstSuccess;
        try {
            firstSuccess = await any(trials);
        }
        catch (e) {
            const lastError = e.errors.pop();
            if (ignoreErrors) {
                return utils_1.returnFailure(lastError.strategy.name, lastError.result, defaultValue);
            }
            else {
                if (lastError.error)
                    throw lastError.error;
                else
                    return utils_1.returnFailure(lastError.strategy.name, lastError.result, defaultValue);
            }
        }
        const { strategy, result } = firstSuccess;
        return utils_1.returnSuccess(strategy.name, result);
    }
    else {
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
            if (check(result)) {
                return utils_1.returnSuccess(strategy.name, result);
            }
        }
        return utils_1.returnFailure(strategy && strategy.name, result, defaultValue);
    }
};
module.exports = strive;
