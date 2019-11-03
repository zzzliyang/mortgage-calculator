import { SET_RESULT, SET_MULTIPLE } from "../actionTypes";

const initialState = {
    result: [],
    isMultiple: false
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
        default:
            return state;
    }
}
