declare type GeneralTryTheseOptions = {
    defaultValue?: any;
    checker: (result: any) => boolean;
    ignoreErrors?: boolean;
};
declare type TryTheseValueOptions = GeneralTryTheseOptions & {
    values: Array<any>;
    action: (value: any) => any;
};
declare type TryTheseMutationOptions = GeneralTryTheseOptions & {
    mutations: Array<() => Array<any>>;
    action: (...values: any[]) => any;
};
declare type TryTheseStrategyOptions = GeneralTryTheseOptions & {
    strategies: Array<() => any>;
};
declare type TryTheseOptions = TryTheseMutationOptions | TryTheseValueOptions | TryTheseStrategyOptions;
declare const tryThese: (options?: TryTheseOptions) => Promise<{
    result: any;
    lastAttempt: string | number | undefined;
} | {
    result: any;
    lastAttempt: null;
}>;
export = tryThese;
