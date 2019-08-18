'use strict';

type GeneralTryTheseOptions = {
    defaultValue?: any,
    checker: (result: any) => boolean,
    ignoreErrors?: boolean
};

type TryTheseValueOptions = GeneralTryTheseOptions & {
    values: Array<any>,
    action: (value: any) => any,
};

type TryTheseMutationOptions = GeneralTryTheseOptions & {
    mutations: Array<() => Array<any>>,
    action: (...values: any[]) => any,
};

type TryTheseStrategyOptions = GeneralTryTheseOptions & {
    strategies: Array<() => any>,
};

type TryTheseOptions = TryTheseMutationOptions | TryTheseValueOptions | TryTheseStrategyOptions;

const log = require('debug')('lib:trythese');
import { returnFailure, returnSuccess } from "./utils";

const defaultOptions: Partial<GeneralTryTheseOptions> = {
    ignoreErrors: true,
};

const tryThese = async (options: TryTheseOptions = defaultOptions as TryTheseOptions) => {
    const {
        mutations,
        values,
        action,
        strategies,
        defaultValue,
        checker,
        ignoreErrors
    } = options as (TryTheseMutationOptions & TryTheseValueOptions & TryTheseStrategyOptions);
    // Fuck it, TypeScript, I know what I'm doing!

    if (strategies) {
        return tryTheseWithStrategies({ strategies, checker, ignoreErrors, defaultValue });
    }

    if (values) {
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
} : TryTheseMutationOptions) => {
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
            return returnSuccess(mutation.name, result);
        }
    }

    return returnFailure(mutation && mutation.name, result, defaultValue);
};

const tryTheseWithValues = async ({
    values = [],
    action,
    checker,
    ignoreErrors = true,
    defaultValue,
} : TryTheseValueOptions) => {
    let value, index, result;

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
            return returnSuccess(Number(index), result);
        }
    }

    return returnFailure(Number(index), result, defaultValue);
};

const tryTheseWithStrategies = async ({
    strategies = [],
    checker,
    ignoreErrors = true,
    defaultValue,
} : TryTheseStrategyOptions) => {
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
            return returnSuccess(strategy.name, result);
        }
    }

    return returnFailure(strategy && strategy.name, result, defaultValue);
};

module.exports = tryThese;