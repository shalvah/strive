'use strict';

type GeneralStriveOptions = {
    defaultValue?: any,
    checker: (result: any) => boolean,
    ignoreErrors?: boolean
};

type StriveValueOptions = GeneralStriveOptions & {
    values: any[],
    action: (value: any) => any,
};

type StriveMutationOptions = GeneralStriveOptions & {
    mutations: Array<() => any[]>,
    action: (...values: any[]) => any,
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
        checker,
        defaultValue,
        ignoreErrors,
    } = options as (StriveMutationOptions & StriveValueOptions & StriveStrategyOptions);
    // Fuck it, TypeScript, I know what I'm doing!

    if (strategies) {
        return striveWithStrategies({strategies, checker, ignoreErrors, defaultValue});
    }

    if (values) {
        return striveWithValues({values, action, checker, ignoreErrors, defaultValue});
    }

    return striveWithMutations({mutations, action, checker, ignoreErrors, defaultValue});
};

const striveWithMutations = async ({
                                       mutations = [],
                                       action,
                                       checker,
                                       ignoreErrors = true,
                                       defaultValue
                                   }: StriveMutationOptions) => {
    let mutation, result;

    for (mutation of Object.values(mutations)) {
        log(`Trying mutation ${mutation.name}`);
        const parameters = await mutation();
        try {
            result = await action(...parameters);
        } catch (e) {
            if (ignoreErrors) continue; else throw e;
        }

        if (checker(result)) {
            return returnSuccess(mutation.name, result);
        }
    }

    return returnFailure(mutation && mutation.name, result, defaultValue);
};

const striveWithValues = async ({
                                    values = [],
                                    action,
                                    checker,
                                    ignoreErrors = true,
                                    defaultValue,
                                }: StriveValueOptions) => {
    let value, index, result;

    for ([index, value] of Object.entries(values)) {
        log(`Trying value at ${index}: ${JSON.stringify(value)}`);
        try {
            result = await action(value);
        } catch (e) {
            if (ignoreErrors) continue; else throw e;
        }

        if (checker(result)) {
            return returnSuccess(Number(index), result);
        }
    }

    return returnFailure(Number(index), result, defaultValue);
};

const striveWithStrategies = async ({
                                        strategies = [],
                                        checker,
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

        if (checker(result)) {
            return returnSuccess(strategy.name, result);
        }
    }

    return returnFailure(strategy && strategy.name, result, defaultValue);
};

export = strive;