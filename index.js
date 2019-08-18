'use strict';

const log = require('debug')('lib:trythese');

const tryThese = async ({
    mutations = [],
    values = [],
    action,
    strategies = [],
    defaultValue,
    checker,
    ignoreErrors = true
}) => {

    if (strategies.length) {
        return tryTheseWithStrategies({ strategies, checker, ignoreErrors, defaultValue });
    }

    if (values.length) {
        return tryTheseWithValues({ values, action, checker, ignoreErrors, defaultValue });
    }

    return tryTheseWithMutations({ mutations, action, checker, ignoreErrors, defaultValue });
};

const tryTheseWithMutations = async ({
    mutations = [],
    action,
    checker,
    ignoreErrors = true,
    defaultValue
}) => {
    let mutation, result;
    const iterator = mutations[Symbol.iterator]();

    for (let next = iterator.next(); !next.done; next = iterator.next()) {
        mutation = next.value;
        log(`Trying ${mutation.name}`);
        const parameters = await mutation();
        try {
            result = await action(...parameters);
        } catch (e) {
            if (ignoreErrors) {
                continue;
            } else {
                throw e;
            }
        }

        if (checker(result)) {
            return {
                result,
                finalStrategy: mutation.name,
            };
        }
    }

    return defaultValue !== undefined ? {
        result: defaultValue,
        finalStrategy: null,
    } : {
            result,
            finalStrategy: mutation && mutation.name,
        };
};

const tryTheseWithValues = async ({
    values = [],
    action,
    checker,
    ignoreErrors = true,
    defaultValue,
}) => {
    let value, index, result;
    const iterator = values[Symbol.iterator]();

    for ([index, value] of Object.entries(values)) {
        log(`Trying ${JSON.stringify(value)}`);
        try {
            result = await action(value);
        } catch (e) {
            if (ignoreErrors) {
                continue;
            } else {
                throw e;
            }
        }

        if (checker(result)) {
            return {
                result,
                finalStrategy: parseInt(index),
            };
        }
    }

    return defaultValue !== undefined ? {
        result: defaultValue,
        finalStrategy: null,
    } : {
            result,
            finalStrategy: parseInt(index),
        };
};

const tryTheseWithStrategies = async ({
    strategies = [],
    checker,
    ignoreErrors = true,
    defaultValue,
}) => {
    let strategy, result;
    const iterator = strategies[Symbol.iterator]();

    for (let next = iterator.next(); !next.done; next = iterator.next()) {
        strategy = next.value;
        log(`Trying ${strategy.name}`);
        try {
            result = await strategy();
        } catch (e) {
            if (ignoreErrors) {
                continue;
            } else {
                throw e;
            }
        }

        if (checker(result)) {
            return {
                result,
                finalStrategy: strategy.name,
            };
        }
    }

    return defaultValue !== undefined ? {
        result: defaultValue,
        finalStrategy: null,
    } : {
            result,
            finalStrategy: strategy && strategy.name,
        };
};

module.exports = tryThese;