document.addEventListener("DOMContentLoaded", function() {
  async function getDataWeather(url) {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, received ${res.status}`);
    }

    return res.json();
  }

  async function initWeather() {
    const json = await getDataWeather(
      "https://api.openweathermap.org/data/2.5/forecast?q=самара&lang=ru&units=metric&APPID=d7370c4f4680389e97fe267bbac3955e"
    );
    createWeather(json);
  }

  const createWeather = data => {
    let itemOnPage; // Количество карточек на странице
    const weatherIconMap = [];
    const weekday = [];
    const dateStr = [];
    const description = [];
    const temp = [];

    const weatherDiv = document.querySelector(".weather-slider");
    const box = document.querySelector("#weather-slider__inner");

    const optionsDate = {
      month: "long",
      day: "numeric"
    };

    const optionsDay = {
      weekday: "long"
    };

    const { list } = data;

    let todayFlag = true;
    let countItem = 0;

    const items = list.filter((item, id) => {
      if (new Date(item.dt * 1000) >= new Date()) {
        if (
          todayFlag &&
          new Date(item.dt * 1000).getDate() == new Date().getDate()
        ) {
          todayFlag = false;
          countItem++;
          return item;
        } else if (
          countItem < 8 &&
          item.dt % 43200 == 0 &&
          new Date(item.dt * 1000).getDate() !== new Date().getDate()
        ) {
          countItem++;
          return item;
        }
      }
    });

    items.forEach((item, i) => {
      dateStr[i] = new Date(item.dt * 1000);
      weatherIconMap[i] = item.weather[0].icon;
      description[i] = item.weather[0].description;
      temp[i] = Math.round(item.main.temp);
      if (dateStr[i].getDate() !== new Date().getDate()) {
        weekday[i] =
          dateStr[i]
            .toLocaleString("ru", optionsDay)
            .charAt(0)
            .toUpperCase() +
          dateStr[i]
            .toLocaleString("ru", optionsDay)
            .substr(1)
            .toLowerCase();
      } else {
        weekday[i] = "Сегодня";
      }
    });

    items.forEach((item, i) => {
      if (i % 2 == 0) {
        const child = document.createElement("div");
        child.className = "weather-slider__item weather-card";

        const dayTxt =
          i == 0
            ? `<p class="weather-card__temp">Ближайшее время ${
                temp[i]
              }&deg;</p>`
            : `<p class="weather-card__temp">Днем ${temp[i]}&deg;</p>`;

        if (i !== items.length - 1) {
          child.innerHTML = `
          <p class="weather-card__weekday">${weekday[i]}</p>
          <h2 class="weather-card__date">${dateStr[i].toLocaleString(
            "ru",
            optionsDate
          )}</h2>
          <img class="weather-card__img" src="http://openweathermap.org/img/w/${
            weatherIconMap[i]
          }.png" />
          ${dayTxt}
          <p class="weather-card__description">${description[i]}</p>
          <hr class="weather-card__separate">
          <img class="weather-card__img" src="http://openweathermap.org/img/w/${
            weatherIconMap[i + 1]
          }.png" />
          <p class="weather-card__temp">Ночью ${temp[i + 1]}&deg;</p>
          <p class="weather-card__description">${description[i + 1]}</p>
          `;
        } else {
          child.innerHTML = `
          <p class="weather-card__weekday">${weekday[i]}</p>
          <h2 class="weather-card__date">${dateStr[i].toLocaleString(
            "ru",
            optionsDate
          )}</h2>
          <img class="weather-card__img" src="http://openweathermap.org/img/w/${
            weatherIconMap[i]
          }.png" />
          ${dayTxt}
          <p class="weather-card__description">${description[i]}</p>
          `;
        }

        box.appendChild(child);
      }
    });

    let currentSlide = 0;

    const slide = weatherDiv.querySelector(".weather-slider__item");
    const slideWidth =
      slide.offsetWidth +
      parseInt(getComputedStyle(slide).marginLeft) +
      parseInt(getComputedStyle(slide).marginRight);

    function showSlide(i) {
      const slides = Array.from(box.childNodes).slice();

      if (i >= slides.length || i < 0) {
        return false;
      }

      weatherDiv.classList.remove("first", "last");
      if (slides.length <= itemOnPage) {
        weatherDiv.classList.add("first", "last");
      }
      if (i <= 0) {
        weatherDiv.classList.add("first");
      } else if (i == slides.length - itemOnPage) {
        weatherDiv.classList.add("last");
      }

      box.style.transform = `translateX(${-slideWidth * i}px)`;

      currentSlide = i;
    }

    weatherDiv.querySelectorAll(".weather-slider__arrow").forEach(item => {
      item.classList.add("is-active");
      item.addEventListener("click", () => {
        if (item.classList.contains("weather-slider__arrow--prev")) {
          showSlide(currentSlide - 1);
        } else {
          showSlide(currentSlide + 1);
        }
      });
    });

    const sliderWidth = () => {
      if (window.innerWidth <= 600) {
        itemOnPage = 1;
      } else if (window.innerWidth <= 800) {
        itemOnPage = 2;
      } else if (
        window.innerWidth <= 1100 ||
        (window.innerWidth >= 1100 && items.length < 7)
      ) {
        itemOnPage = 3;
      } else {
        itemOnPage = 4;
      }
      const sliderWidth = slideWidth * itemOnPage;

      weatherDiv.querySelector(
        ".weather-slider__wrap"
      ).style.width = `${sliderWidth}px`;
    };

    sliderWidth();

    showSlide(0);

    window.addEventListener("resize", () => {
      sliderWidth();
      showSlide(0);
    });
  };

  initWeather();
});
