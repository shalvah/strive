"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const returnSuccess = (lastAttempt, result) => {
    return {
        result,
        lastAttempt,
    };
};
exports.returnSuccess = returnSuccess;
const returnFailure = (lastAttempt, result, defaultValue) => {
    return defaultValue === undefined ? {
        result,
        lastAttempt,
    } : {
        result: defaultValue,
        lastAttempt: null,
    };
};
exports.returnFailure = returnFailure;
