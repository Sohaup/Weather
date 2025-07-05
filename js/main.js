function monad(arr=[]) {
    return {
        getValue:()=> arr ?? [],
        map:(callBack)=> monad(callBack(arr??[])) ,
        bind:(callBack)=>callBack(arr??[])
    }
}

async function getWeather(url , key='e66c862685e14a64848121247250507', q="cairo" , days=3 ) {
    try {
    const response = await fetch(url+`?key=${key}`+`&q=${q}`+`&days=${days}`);
    const data = await response.json();     
    return monad(data.forecast.forecastday);
    } catch(err) {
        console.log(err);
        return monad([]); 
    }

}

function render(day={} , country="cairo") {   
    const cardsContainer = document.getElementById("cardsContainer");   
    const col = document.createElement("div");
    col.classList.add("col-md-4");    
    const card = document.createElement("div");
    card.classList.add("card");
    const h5 = document.createElement("h5");
    h5.classList.add("card-title" ,"text-secondary" , "d-flex" , "justify-content-between" , "mb-auto")
    const h5Span1 = document.createElement("span");
    h5Span1.textContent = day.day // day name
    const h5Span2 = document.createElement("span");
    h5Span2.textContent = day.month // day number & month name
    h5.append(h5Span1 , h5Span2);   
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    const h6 = document.createElement("h6");
    h6.classList.add("card-subtitle" ,"mb-2" ,"text-secondary");
    h6.textContent = country; // country name
    const p = document.createElement("p");
    p.classList.add("card-text" ,"display-1" ,"text-light")
    p.textContent = day.avgtemp_c; //temp
    const img = document.createElement("img");
    img.setAttribute("src" ,day.condition.icon); // weather icon
    img.setAttribute("alt" , "Weather Icon");
    const p2 = document.createElement("p");
    p2.classList.add("text-primary","fs-6");
    p2.textContent= day.condition.text // waether description
    cardBody.append(h6 , p , img , p2);   
    card.append(h5 , cardBody);   
    col.append(card);   
    cardsContainer.append(col)
 }

 function childKiller(element) {    
    if (!element || !element.firstChild) {         
        return ;
    }
    element.removeChild(element.firstChild);
    childKiller(element);    
 }

 const DateTransForm = {
    days: [ "SunDay" , "MonDay" ,  "TuesDay" ,"WednesDay", "ThrusDay" ,"FriDay" , "SuterDay" ], 
    months:[
        "jenuary" , "febraury" ,"marh" , "april"
         , "may" , "june" , "july" , "augostus" , "septemper" , 
         "octoper" , "november" , "decemper"
        ] ,
    combineDay:function (date) {       
        const getDate = new Date(date);
        return this.days[getDate.getDay()]
    } ,
    combineMonth: function (date="") {
        const getMonth = new Date(date);
        return date.charAt(date.length-1) +" "+ this.months[getMonth.getMonth()]
    }
 }

 const unifiedMonoid = {
    idnitity:"" ,
    combine:function (obj) {
        const dayObj = obj.day;
        const day = DateTransForm.combineDay(obj.date);   
        const month = DateTransForm.combineMonth(obj.date);                
        return {...dayObj , day , month}
    }
 }

function getCounry(url , key , days) {   
    document.getElementById("button-addon2").addEventListener("click" , function () {
        childKiller(document.getElementById("cardsContainer"));
        const inputValue = this.previousElementSibling.value;
        getWeather(url , key ,inputValue, days)
        .then(function (data) {         
               data.getValue().forEach(function (value) {             
               render(unifiedMonoid.combine(value) , inputValue);
            })       
        });               
    })
}


getCounry("http://api.weatherapi.com/v1/forecast.json" )


