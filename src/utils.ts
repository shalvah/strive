"use strict";

const returnSuccess = (lastAttempt: string | number, result: any) => {
    return {
        result,
        lastAttempt,
        success: true,
    };
};

const returnFailure = (lastAttempt: string | number | undefined, result: any, defaultValue: any) => {
    return {
        result: defaultValue === undefined ? result : defaultValue,
        lastAttempt,
        success: false,
    };
};


export {
    returnFailure,
    returnSuccess,
};