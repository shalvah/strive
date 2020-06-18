declare type GeneralStriveOptions = {
    defaultValue?: any;
    check: (result: any) => boolean;
    ignoreErrors?: boolean;
    race?: boolean;
};
declare type StriveValueOptions = GeneralStriveOptions & {
    values: Array<any[]>;
    action: (...args: any[]) => any;
};
declare type StriveMutationOptions = GeneralStriveOptions & {
    mutations: Array<() => any[]>;
    action: (...args: any[]) => any;
};
declare type StriveStrategyOptions = GeneralStriveOptions & {
    strategies: Array<() => any>;
};
declare type StriveOptions = StriveMutationOptions | StriveValueOptions | StriveStrategyOptions;
declare const strive: (options?: StriveOptions) => Promise<{
    result: any;
    lastAttempt: string | number | undefined;
    success: boolean;
}>;
export = strive;
