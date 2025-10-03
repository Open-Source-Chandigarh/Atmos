export const countryChange = (country)=>{
    console.log("djdfjk")
    return(dispatch)=>{
        
        dispatch({
            type:"CountryChange",
            payload: country
        })
    }
}