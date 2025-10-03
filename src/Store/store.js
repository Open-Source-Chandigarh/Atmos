import { applyMiddleware, createStore } from "redux";
import { thunk } from "redux-thunk"; // ← Change this line
import reducer from "./reducer";

const shop = createStore(reducer, {}, applyMiddleware(thunk));

export default shop;