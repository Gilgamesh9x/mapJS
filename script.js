"use strict";

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//////////////////////////////////////////////////////////////////////////////

class Workout {
  options = {
    month: "long",
    day: "numeric",
  };
  date = new Intl.DateTimeFormat("en-US", this.options).format(new Date());
  id = Date.now();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

///////////////////////
/// Running Child Class

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.pace = duration / distance;
    this._createHTMLWorkout(
      this.id,
      this.date,
      this.distance,
      this.duration,
      this.pace,
      this.cadence
    );
  }
  _createHTMLWorkout(id, date, distance, duration, pace, cadence) {
    const HTMLContent = `
    <li class="workout workout--running" data-id="${id}">
    <h2 class="workout__title">Running on ${date}</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${pace}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
    `;

    form.insertAdjacentHTML("afterend", HTMLContent);
  }
}

/// Cycling Child Class

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.speed = distance / (duration / 60);
    this._createHTMLWorkout(
      this.id,
      this.date,
      this.distance,
      this.duration,
      this.speed,
      this.elevationGain
    );
  }
  _createHTMLWorkout(id, date, distance, duration, speed, elevationGain) {
    const HTMLContent = `
    <li class="workout workout--cycling" data-id="${id}">
    <h2 class="workout__title">Cycling on ${date}</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${speed}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>
    `;
    form.insertAdjacentHTML("afterend", HTMLContent);
  }
}

////////////////////////

class App {
  #map;
  #mapEvent;
  workouts = [];
  workout;
  constructor() {
    // since the constructor gets called every time we create an object, let's make it call the methods when we create ab object
    this._getPosition();
    this._toggleElevationField();
    form.addEventListener("submit", this._newWorkout.bind(this));
    containerWorkouts.addEventListener(
      "click",
      this._showWorkoutLocation.bind(this)
    );
    // get storage item when reload
    /* this._getLocalStorage(); */
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Can't get your location");
        }
      );
    }
  }

  _loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coords = [latitude, longitude];

    // Leaflet
    this.#map = L.map("map").setView(coords, 13); // 13 is the zoom level, the highter the number, the more we zoom in
    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handle clicks on map
    this.#map.on("click", this._showForm.bind(this));
    //
    this._getLocalStorage();
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputType.addEventListener("change", function () {
      inputElevation
        .closest(".form__row")
        .classList.toggle("form__row--hidden");
      inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    });
  }

  _newWorkout(e) {
    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];
    // Collect data
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;
    const type = document.querySelector(".form__input").value;
    //
    /* let workout; */

    // Decide if it's running or cycling:
    if (type === "running") {
      if (
        inputDistance.value > 0 &&
        inputDuration.value > 0 &&
        inputCadence.value > 0
      ) {
        this.workout = new Running(coords, distance, duration, cadence);
        this.workouts.push(this.workout);
        // Hide the form
        form.classList.add("hidden");
      } else {
        alert("Invalid Input");
      }
    } else {
      if (
        inputDistance.value > 0 &&
        inputDuration.value > 0 &&
        typeof elevation === "number"
      ) {
        this.workout = new Cycling(coords, distance, duration, elevation);
        this.workouts.push(this.workout);
        // Hide the form
        form.classList.add("hidden");
      } else {
        alert("Invalid Input");
      }
    }
    // Clear input fields
    inputDistance.value = "";
    inputDuration.value = "";
    inputCadence.value = "";
    inputElevation.value = "";
    //
    this._marker(coords, type, this.workout.date);
    //
    this._setLocalStorage();
  }
  // Create marker
  _marker(c, t, date) {
    L.marker(c)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${t}-popup`,
        }).setContent(
          `${t === "running" ? "🏃‍♂️ Running" : "🚴‍♀️ Cycling"} on ${date}`
        )
      )
      .openPopup();
  }

  _showWorkoutLocation(e) {
    const WorkoutEl = e.target.closest(".workout");
    if (WorkoutEl) {
      const workout = this.workouts.find(
        (workout) => String(workout.id) === WorkoutEl.dataset.id
      );
      this.#map.setView(workout.coords, 13);
    }
  }

  // Set local storage to all workouts
  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.workouts)); // setItem is a key value store. so "workouts is the key" and the second argument is the value and it should always be a string. we can convert an object to a string by doing JSON...
  }
  // Get local storage of all workouts
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;

    // html restored
    this.workouts = data.map((workout) => {
      if (workout.cadence) {
        return new Running(
          workout.coords,
          workout.distance,
          workout.duration,
          workout.cadence
        );
      } else {
        return new Cycling(
          workout.coords,
          workout.distance,
          workout.duration,
          workout.elevationGain
        );
      }
    });
    // marker stored
    this.workouts.forEach((workout) => {
      this._marker(
        workout.coords,
        workout instanceof Running ? "running" : "cycling",
        workout.date
      );
    });
  }
  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}
const app = new App();
//////////////////////////////////////////////////////////////////////////////
