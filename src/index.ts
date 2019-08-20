'use strict';

type GeneralStriveOptions = {
    defaultValue?: any,
    check: (result: any) => boolean,
    ignoreErrors?: boolean
};

type StriveValueOptions = GeneralStriveOptions & {
    values: Array<any[]>,
    action: (...args: any[]) => any,
};

type StriveMutationOptions = GeneralStriveOptions & {
    mutations: Array<() => any[]>,
    action: (...args: any[]) => any,
};

type StriveStrategyOptions = GeneralStriveOptions & {
    strategies: Array<() => any>,
};

type StriveOptions = StriveMutationOptions | StriveValueOptions | StriveStrategyOptions;

const log = require('debug')('lib:strive');
import {returnFailure, returnSuccess} from "./utils";

const strive = async (options: StriveOptions = {
    ignoreErrors: true,
} as StriveOptions) => {
    const {
        mutations,
        values,
        action,
        strategies,
        check,
        defaultValue,
        ignoreErrors,
    } = options as (StriveMutationOptions & StriveValueOptions & StriveStrategyOptions);
    // Fuck it, TypeScript, I know what I'm doing!

    if (strategies) {
        return striveWithStrategies({strategies, check, ignoreErrors, defaultValue});
    }

    if (values) {
        return striveWithValues({values, action, check, ignoreErrors, defaultValue});
    }

    return striveWithMutations({mutations, action, check, ignoreErrors, defaultValue});
};

const striveWithMutations = async ({
                                       mutations = [],
                                       action,
                                       check,
                                       ignoreErrors = true,
                                       defaultValue
                                   }: StriveMutationOptions) => {
    let mutation, result;

    for (mutation of Object.values(mutations)) {
        log(`Trying mutation ${mutation.name}`);
        const args = await mutation();
        try {
            result = await action(...args);
        } catch (e) {
            if (ignoreErrors) continue; else throw e;
        }

        if (check(result)) {
            return returnSuccess(mutation.name, result);
        }
    }

    return returnFailure(mutation && mutation.name, result, defaultValue);
};

const striveWithValues = async ({
                                    values = [[]],
                                    action,
                                    check,
                                    ignoreErrors = true,
                                    defaultValue,
                                }: StriveValueOptions) => {
    let value, index, result;

    for ([index, value] of Object.entries(values)) {
        log(`Trying value at ${index}: ${JSON.stringify(value)}`);
        try {
            result = await action(...value);
        } catch (e) {
            if (ignoreErrors) continue; else throw e;
        }

        if (check(result)) {
            return returnSuccess(Number(index), result);
        }
    }

    return returnFailure(Number(index), result, defaultValue);
};

const striveWithStrategies = async ({
                                        strategies = [],
                                        check,
                                        ignoreErrors = true,
                                        defaultValue,
                                    }: StriveStrategyOptions) => {
    let strategy, result;

    for (strategy of Object.values(strategies)) {
        log(`Trying strategy ${strategy.name}`);
        try {
            result = await strategy();
        } catch (e) {
            if (ignoreErrors) continue; else throw e;
        }

        if (check(result)) {
            return returnSuccess(strategy.name, result);
        }
    }

    return returnFailure(strategy && strategy.name, result, defaultValue);
};

export = strive;