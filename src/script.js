'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date();
  id = new Date().toISOString().slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duraction = duration;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duraction / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.cadence = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// APPLICATION ARCHITECTURE--------------------------------

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Class App is the main app from where the js engine is loaded
class App {
  // Properties of the class
  #map;
  #mapEvent;
  #workouts = [];
  // Construtor invoked when the page is fully loaded
  constructor() {
    this._getPosition(); // Fetch user position

    // EVENT LISTENERS
    form.addEventListener('submit', this._newWorkout.bind(this));

    // Add an event listener to listen to the change in type of activity
    inputType.addEventListener('change', this._toggleElevationField);
  }

  // Method to fetch user location co-ordinates
  _getPosition() {
    function error() {
      alert('Please allow us to access your location!');
    }

    if (!navigator.geolocation) {
      console.log('Geolocation is not supported on your system.');
    } else {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), error);
    }
  }

  // Method to render map and place markers on the map
  _loadMap(position) {
    const coords = [position.coords.latitude, position.coords.longitude];

    // create map using the user location coordinates
    this.#map = L.map('map', {
      center: coords,
      zoom: 13,
    });

    // add design style to the map
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    }).addTo(this.#map);

    // handle clicks on the map. map.on is similar to an event listener on the map.
    this.#map.on('click', this._showForm.bind(this));
  }

  // Method to show the workout input form when map is clicked
  _showForm(mapE) {
    form.classList.remove('hidden');
    inputDistance.focus();
    this.#mapEvent = mapE;
  }

  // Method to change variables based on activity
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // Method to create a new activity when form is submitted to save the data from the form
  _newWorkout(e) {
    // Helper function to validate if the input values are  numbers
    function validateInputs(...inputs) {
      return inputs.every(input => Number.isFinite(input));
    }

    // Helper function to validate if the input values are positive integers
    function checkPositiveInputs(...inputs) {
      return inputs.every(input => input > 0);
    }

    // Submitting the form automatically refreshes the page
    e.preventDefault();

    // Get data from the form
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout is running, create running object
    if (type == 'running') {
      const cadence = Number(inputCadence.value);
      // check if the data is valid
      if (
        !validateInputs(cadence, distance, duration) &&
        !checkPositiveInputs(distance, cadence, duration)
      )
        return alert('Please enter a positive number!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout is cycling, create cycle object
    if (type == 'cycling') {
      const elevation = Number(inputElevation.value);
      // check if the data is valid
      if (
        !validateInputs(elevation, distance, duration) &&
        !checkPositiveInputs(distance, elevation)
      )
        return alert('Please enter a positive number!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);

    // Call the render method to render marker on the map
    this._renderWorkoutMarker(workout);

    // Clear the input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    // Create a marker on the map
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.type)
      .openPopup();
  }
}

const app = new App();
