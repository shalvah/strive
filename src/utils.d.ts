declare const returnSuccess: (lastAttempt: string | number, result: any) => {
    result: any;
    lastAttempt: string | number;
};
declare const returnFailure: (lastAttempt: string | number | undefined, result: any, defaultValue: any) => {
    result: any;
    lastAttempt: string | number | undefined;
} | {
    result: any;
    lastAttempt: null;
};
export { returnFailure, returnSuccess, };
