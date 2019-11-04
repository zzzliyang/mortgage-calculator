import { SET_RESULT, SET_MULTIPLE } from "../actionTypes";

const initialState = {
    result: [],
    isMultiple: false,
    resultMultiple: false,
    totalAmount1: 0,
    totalInterest1: 0,
    totalAmount2: 0,
    totalInterest2: 0,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_RESULT: {
            if (action.payload.totalAmount2)
            return {
                ...state,
                result: action.payload.result,
                resultMultiple: action.payload.resultMultiple,
                totalAmount1: action.payload.totalAmount1,
                totalInterest1: action.payload.totalInterest1,
                totalAmount2: action.payload.totalAmount2,
                totalInterest2: action.payload.totalInterest2
            };
            else
                return {
                    ...state,
                    result: action.payload.result,
                    resultMultiple: action.payload.resultMultiple,
                    totalAmount1: action.payload.totalAmount1,
                    totalInterest1: action.payload.totalInterest1
                };
        }
        case SET_MULTIPLE: {
            return {
                ...state,
                isMultiple: action.payload
            };
        }
        default:
            return state;
    }
}
