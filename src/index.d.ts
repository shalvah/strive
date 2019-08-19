declare type GeneralStriveOptions = {
    defaultValue?: any;
    checker: (result: any) => boolean;
    ignoreErrors?: boolean;
};
declare type StriveValueOptions = GeneralStriveOptions & {
    values: any[];
    action: (value: any) => any;
};
declare type StriveMutationOptions = GeneralStriveOptions & {
    mutations: Array<() => any[]>;
    action: (...values: any[]) => any;
};
declare type StriveStrategyOptions = GeneralStriveOptions & {
    strategies: Array<() => any>;
};
declare type StriveOptions = StriveMutationOptions | StriveValueOptions | StriveStrategyOptions;
declare const strive: (options?: StriveOptions) => Promise<{
    result: any;
    lastAttempt: string | number | undefined;
} | {
    result: any;
    lastAttempt: null;
}>;
export = strive;
