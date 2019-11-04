import { SET_RESULT, SET_MULTIPLE } from "./actionTypes";

export const setResult = newResult => ({
    type: SET_RESULT,
    payload: newResult
});

export const setMultiple = isMultiple => ({
    type: SET_MULTIPLE,
    payload: isMultiple
});