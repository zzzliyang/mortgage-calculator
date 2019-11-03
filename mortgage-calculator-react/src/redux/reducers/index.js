import { combineReducers } from "redux";
import resultState from "./result";
import customerState from "./customer";

export default combineReducers({ resultState, customerState });
