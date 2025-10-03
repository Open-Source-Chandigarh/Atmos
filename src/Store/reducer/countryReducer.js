const reducer = (state="in" ,action)=>{
    if(action.type === "CountryChange"){
        return state=action.payload
    }

    else{
        return state
    }
}


export default reducer