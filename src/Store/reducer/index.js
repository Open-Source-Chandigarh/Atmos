import{combineReducers} from "redux";
import countryReducer from "./countryReducer"

const reducer = combineReducers({
    country:countryReducer
})

export default reducer 