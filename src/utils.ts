"use strict";

const returnSuccess = (lastAttempt: string | number, result: any) => {
    return {
        result,
        lastAttempt,
    };
};

const returnFailure = (lastAttempt: string | number | undefined, result: any, defaultValue: any) => {
    return defaultValue === undefined ? {
        result,
        lastAttempt,
    } : {
            result: defaultValue,
            lastAttempt: null,
        };
};


export {
    returnFailure,
    returnSuccess,
};