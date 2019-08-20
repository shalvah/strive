declare const returnSuccess: (lastAttempt: string | number, result: any) => {
    result: any;
    lastAttempt: string | number;
    success: boolean;
};
declare const returnFailure: (lastAttempt: string | number | undefined, result: any, defaultValue: any) => {
    result: any;
    lastAttempt: string | number | undefined;
    success: boolean;
};
export { returnFailure, returnSuccess, };
