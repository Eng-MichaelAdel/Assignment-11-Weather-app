// ********** Asssigning Elements & values Functions **********
var SubmitBtnElem = document.querySelector("#SubmitId");
var SubmitMsgElem = document.querySelector("#SearchMsgId");

var SearchInputElem = document.querySelector("#SearchByCountry");

var LoadingMsgElem = document.querySelector(".sk-chase");
// ********** initializing data  **********
var InputRegex = /^[a-zA-Z\s\-]{3,}$/;
SubmitMsgElem.classList.add("d-none");

var ForecastData = [];
var LocatioData = {};

window.addEventListener("DOMContentLoaded", () => {
  if (!SearchInputElem.value) {
    navigator.geolocation.getCurrentPosition(async function (location) {
      LocatioData.long = location.coords.longitude;
      LocatioData.lat = location.coords.latitude;
      console.log(LocatioData.lat, ",", LocatioData.long);
      await Get_SetForecastData();
    });
  }
});

SearchInputElem.addEventListener("input", function () {
  LocatioData.CityName = SearchInputElem.value;
  if (LocatioData.CityName) {
    if (!InputRegex.test(LocatioData.CityName.trim())) {
      SubmitMsgElem.classList.remove("d-none");
      console.log("at least 3 char");
    } else {
      SubmitMsgElem.classList.add("d-none");
      console.log("you are typing", LocatioData.CityName);
      console.log("you are typing", LocatioData.CityName.length);
      Get_SetForecastData();
    }
  } else {
    SubmitMsgElem.classList.add("d-none");
  }
});

SubmitBtnElem.addEventListener("click", function (eInfo) {
  eInfo.preventDefault();
  LocatioData.CityName = SearchInputElem.value;
  if (!InputRegex.test(LocatioData.CityName.trim())) {
    SubmitMsgElem.classList.remove("d-none");
    console.log("at least 3 char");
  } else {
    SubmitMsgElem.classList.add("d-none");
    console.log("now more than 3 char");
    console.log("you are typing", LocatioData.CityName);
    console.log("you are typing", LocatioData.CityName.length);
    Get_SetForecastData();
  }
});

async function Get_SetForecastData() {
  var UserKey = "4f1f7c876dcc470f9b582026252606";
  var lat = LocatioData.lat;
  var long = LocatioData.long;
  var CityName = LocatioData.CityName;
  try {
    LoadingMsgElem.classList.remove("d-none");
    SubmitMsgElem.classList.add("d-none");

    if (!CityName) {
      var response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${UserKey}&q=${lat},${long}&days=3&aqi=no&alerts=no `,
        {
          cache: "default",
        }
      );
    } else {
      var response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${UserKey}&q=${CityName}&days=3&aqi=no&alerts=no `,
        {
          cache: "default",
        }
      );
    }

    ForecastData = await response.json();
    if (ForecastData.error) {
      SubmitMsgElem.classList.remove("d-none");
      SubmitMsgElem.textContent = ForecastData.error.message;
      return;
    }
    SetAllTheForecastData();
    console.log(ForecastData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  } finally {
    LoadingMsgElem.classList.add("d-none");
  }
}
function SetAllTheForecastData() {
  var CountryElement = document.querySelector(".Country");
  var CountryName = ForecastData.location.name;
  CountryElement.innerHTML = CountryName;

  SetDate_WeekDays();
  SetTemperature();
  SetCondition();
  SetWind_RainData();
}

//! ********** Set the Date & WeekDays for All Dayes **********
function SetDate_WeekDays() {
  //! *** initialize data ***
  var DayElems = document.querySelectorAll(".day");
  var TodayDateElem = document.querySelector(".date");
  var DayDate;
  var DateOfDayFromData;

  for (var i = 0; i < 3; i++) {
    DateOfDayFromData = ForecastData.forecast.forecastday[i].date;
    DayDate = new Date(DateOfDayFromData);

    //! *** Set Date for Today only ***
    if (i == 0) {
      var ShortDate = DayDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      TodayDateElem.innerHTML = ShortDate;
    }

    //! *** Set WeekDay For all Days ***
    var WeekDay = DayDate.toLocaleDateString("en-GB", { weekday: "long" });
    var DayElement = DayElems[i];
    DayElement.innerHTML = WeekDay;
  }
}

//^ ********** Set the Tempreture for All Dayes **********
function SetTemperature() {
  var MaxDegElems = document.querySelectorAll(".MaxDeg");
  var MinDegElems = document.querySelectorAll(".MinDeg");
  var AvgDegElems = document.querySelector(".AvgDeg");

  var DayTemp = {};

  //^ *** Set Today Tempreture only ***
  DayTemp.Avg = ForecastData.forecast.forecastday[0].day.avgtemp_c;
  AvgDegElems.innerHTML = DayTemp.Avg + "&deg;C";

  //^ *** Set Temp For the rest of days ***
  for (var i = 0; i < 2; i++) {
    DayTemp.Max = ForecastData.forecast.forecastday[i + 1].day.maxtemp_c;
    DayTemp.Min = ForecastData.forecast.forecastday[i + 1].day.mintemp_c;

    var MaxDegElement = MaxDegElems[i];
    var MinDegElement = MinDegElems[i];

    MaxDegElement.innerHTML = DayTemp.Max + "&deg;C";
    MinDegElement.innerHTML = DayTemp.Min + "&deg;C";
  }
}

//& ********** Set Condition Text & Pic *******
function SetCondition() {
  var ConditionTextElems = document.querySelectorAll(".Condition");
  var ConditionPicElems = document.querySelectorAll(".ConditionPic img");

  var DayCondition = {};

  for (var i = 0; i < 3; i++) {
    DayCondition.Text = ForecastData.forecast.forecastday[i].day.condition.text;
    DayCondition.Pic = ForecastData.forecast.forecastday[i].day.condition.icon;

    var ConditionTextElement = ConditionTextElems[i];
    var ConditionPicElement = ConditionPicElems[i];

    ConditionTextElement.innerHTML = DayCondition.Text;
    ConditionPicElement.setAttribute("src", DayCondition.Pic);
  }
}

//~ ********** Set Wind & Rain Data for today only*******
function SetWind_RainData() {
  const directions = {
    N: "North",
    NE: "Northeast",
    E: "East",
    SE: "Southeast",
    S: "South",
    SW: "Southwest",
    W: "West",
    NW: "Northwest",
    NNE: "North-Northeast",
    ENE: "East-Northeast",
    ESE: "East-Southeast",
    SSE: "South-Southeast",
    SSW: "South-Southwest",
    WSW: "West-Southwest",
    WNW: "West-Northwest",
    NNW: "North-Northwest",
  };

  var RainPercElem = document.querySelector(".RainPercentage");
  var WindSpeedElem = document.querySelector(".WindSpeed");
  var WindDirectionElem = document.querySelector(".WindDirection");

  var WindRainState = {
    RainPerc: ForecastData.forecast.forecastday[0].day.daily_chance_of_rain,
    WindSpeed: ForecastData.forecast.forecastday[0].day.maxwind_kph,
    WindDirection: ForecastData.current.wind_dir,
  };

  RainPercElem.innerHTML = WindRainState.RainPerc + "%";
  WindSpeedElem.innerHTML = WindRainState.WindSpeed + " km/hr";
  WindDirectionElem.innerHTML = directions[WindRainState.WindDirection];
}
