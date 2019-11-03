import { SET_RESULT, SET_MULTIPLE, SET_TOTAL_1, SET_TOTAL_2 } from "./actionTypes";

export const setResult = newResult => ({
    type: SET_RESULT,
    payload: newResult
});

export const setMultiple = isMultiple => ({
    type: SET_MULTIPLE,
    payload: isMultiple
});

export const setTotal1 = total => ({
    type: SET_TOTAL_1,
    payload: total
});

export const setTotal2 = total => ({
    type: SET_TOTAL_2,
    payload: total
});