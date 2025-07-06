function monad(arr=[]) {
    return {
        getValue:()=> arr ?? [],
        map:(callBack)=> monad(callBack(arr??[])) ,
        bind:(callBack)=>callBack(arr??[])
    }
}


function storeOnStorage(arr=[] ) {
   localStorage.setItem("weather" , JSON.stringify(arr));    
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

function render(day={} ) {   
    const cardsContainer = document.getElementById("cardsContainer");   
    const col = document.createElement("div");
    col.classList.add("col-md-4");    
    const card = document.createElement("div");
    card.classList.add("card");
    const h5 = document.createElement("h5");
    h5.classList.add("card-title" ,"text-secondary" , "d-flex" , "justify-content-between" , "mb-auto");
    const h5Span1 = document.createElement("span");
    h5Span1.textContent = day.day // day name
    const h5Span2 = document.createElement("span");
    h5Span2.textContent = day.month // day number & month name
    h5.append(h5Span1 , h5Span2);   
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    const h6 = document.createElement("h6");
    h6.classList.add("card-subtitle" ,"mb-2" ,"text-secondary");
    h6.textContent = day.country; // country name
    const p = document.createElement("p");
    p.classList.add("card-text" ,"display-1" ,"text-light");
    p.textContent = day.avgtemp_c+"c"; //temp
    const img = document.createElement("img");
    img.setAttribute("src" ,day.condition.icon); // weather icon
    img.setAttribute("alt" , "Weather Icon");
    const p2 = document.createElement("p");
    p2.classList.add("text-primary","fs-6");
    p2.textContent= day.condition.text // waether description
    const cardFooter = document.createElement("div");
    cardFooter.classList.add("card-footer" , "d-flex" ,"flex-row" , "flex-md-column" , "flex-lg-row", "text-light" , "gap-3" , "overflow-hidden" , "justify-content-center") ;
    const footerP1 = document.createElement("p");
    footerP1.classList.add("d-flex","gap-2" );
    const footerP2 = document.createElement("p");
    footerP2.classList.add("d-flex","gap-2");
    const footerP3 = document.createElement("p");
    footerP3.classList.add("d-flex" ,"gap-2");
    const pSpan1  = document.createElement("span");
    pSpan1.textContent = day.avghumidity; // humadidty
    const pImg1 = document.createElement("img");
    pImg1.setAttribute("src" , "/imgs/imgi_3_icon-umberella.png");
    pImg1.setAttribute("alt" , "umbrella icon");
    pImg1.setAttribute("width" , 25);
    footerP1.append( pImg1 , pSpan1 ,);
    const pSpan2  = document.createElement("span");
    pSpan2.textContent = day.maxwind_kph; // wind spead
    const pImg2 = document.createElement("img");
    pImg2.setAttribute("src" , "/imgs/imgi_4_icon-wind.png");
    pImg2.setAttribute("alt" , "wind icon");
    pImg2.setAttribute("width" , 25);
    footerP2.append(pImg2 , pSpan2);
    const pSpan3  = document.createElement("span");
    pSpan3.textContent = day.windDir // wind diretion
    const pImg3 = document.createElement("img");
    pImg3.setAttribute("src" , "/imgs/imgi_5_icon-compass.png");
    pImg3.setAttribute("alt" , "compass icon");
    pImg3.setAttribute("width" , 25);
    footerP3.append( pImg3 , pSpan3);  
    cardFooter.append(footerP1 , footerP2 , footerP3);   
    cardBody.append(h6 , p , img , p2);   
    card.append(h5 , cardBody , cardFooter);   
    col.append(card);   
    cardsContainer.append(col)
 }

 function childKiller(element) {    
    if (!element || !element.firstChild) {   
        storeOnStorage([]);      
        return ;
    }
    element.removeChild(element.firstChild);
    childKiller(element);    
 }

 const DateTransForm = {
    days: [ "SunDay" , "MonDay" ,  "TuesDay" ,"WednesDay", "ThrusDay" ,"FriDay" , "SuterDay" ], 
    months:[
        "Jenuary" , "Febraury" ,"Marh" , "April"
         , "May" , "June" , "July" , "Augostus" , "Septemper" , 
         "Octoper" , "November" , "Decemper"
        ] ,
    combineDay:function (date) {       
        const getDate = new Date(date);
        return this.days[getDate.getDay()]
    } ,
    combineMonth: function (date="") {
        const getMonth = new Date(date);
        if (Number(date.charAt(date.length-2))) {         
        return String(date.charAt(date.length-2)) + date.charAt(date.length-1) +" "+ this.months[getMonth.getMonth()];
        } else {
          return  date.charAt(date.length-1) +" "+ this.months[getMonth.getMonth()];
        }
    }
 }

 const unifiedMonoid = {
    idnitity:"" ,
    combine:function (obj , country) {
        const dayObj = obj.day;
        const windDir = obj.hour[0].wind_dir;
        const day = DateTransForm.combineDay(obj.date);   
        const month = DateTransForm.combineMonth(obj.date);                
        return {...dayObj , day , month , country , windDir}
    }
 }


 function returnWeatherStruture(arr=[] , country="cairo") {
   const newArr =  arr.map(function (obj) {
        return unifiedMonoid.combine(obj , country);
    })
    storeOnStorage(newArr);
    return newArr;   
 }

function getCounry(url , key , days) {   
    document.getElementById("button-addon2").addEventListener("click" , function () {
        childKiller(document.getElementById("cardsContainer"));
        const inputValue = this.previousElementSibling.value;
        getWeather(url , key ,inputValue, days)
        .then(function (data) {      
           const unifiedData = data.map(function (data) {
            return returnWeatherStruture(data , inputValue);
          });
          console.log(unifiedData.getValue());
          
          unifiedData.getValue().forEach(function (WeatherObj) {
             render(WeatherObj); 
         });                
        });               
    });
}


const dataArr = JSON.parse(localStorage.getItem("weather"));
dataArr ? dataArr.forEach((obj)=>render(obj)) : [];
getCounry("http://api.weatherapi.com/v1/forecast.json" );


