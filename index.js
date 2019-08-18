'use strict';

const log = require('debug')('lib:trythese');

const tryThese = async ({
    mutations = [],
    values = [],
    action,
    strategies = [],
    checker,
    ignoreErrors = true
}) => {

    if (strategies.length) {
        return tryWithStrategies({ strategies, checker, ignoreErrors });
    }

    if (values.length) {
        return tryTheseWithValues({ values, action, checker, ignoreErrors });
    }

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
            break;
        }
    }

    return {
        result,
        finalStrategy: mutation && mutation.name,
    };
};

const tryTheseWithValues = async ({
    values = [],
    action,
    checker,
    ignoreErrors = true
}) => {
    let value, result;
    const iterator = values[Symbol.iterator]();

    for (let next = iterator.next(); !next.done; next = iterator.next()) {
        value = next.value;
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
            break;
        }
    }

    return {
        result,
        finalStrategy: value,
    };
};

const tryWithStrategies = async ({
    strategies = [],
    checker,
    ignoreErrors = true
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
            break;
        }
    }

    return {
        result,
        finalStrategy: strategy && strategy.name,
    };
};

module.exports = tryThese;