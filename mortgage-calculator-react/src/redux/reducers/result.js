import { SET_RESULT, SET_MULTIPLE, SET_TOTAL_1, SET_TOTAL_2 } from "../actionTypes";

const initialState = {
    result: [],
    isMultiple: false,
    totalAmount1: 0,
    totalInterest1: 0,
    totalAmount2: 0,
    totalInterest2: 0,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case SET_RESULT: {
            const newResult = action.payload;
            return {
                ...state,
                result: newResult
            };
        }
        case SET_MULTIPLE: {
            return {
                ...state,
                isMultiple: action.payload
            };
        }
        case SET_TOTAL_1: {
            const totalAmount1 = action.payload.totalAmount1;
            const totalInterest1 = action.payload.totalInterest1;
            return {
                ...state,
                totalAmount1: totalAmount1,
                totalInterest1: totalInterest1
            };
        }
        case SET_TOTAL_2: {
            const totalAmount2 = action.payload.totalAmount2;
            const totalInterest2 = action.payload.totalInterest2;
            return {
                ...state,
                totalAmount2: totalAmount2,
                totalInterest2: totalInterest2
            };
        }
        default:
            return state;
    }
}
