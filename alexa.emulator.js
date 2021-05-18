
//Emulator of Alexa API requests

const { Athena } = require("aws-sdk");
const axios = require("axios")
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIyIiwidXNlcm5hbWUiOiJhbGJlcnQiLCJ1dHlwZSI6InBhdGllbnQiLCJpYXQiOjE2MTg0MTM1MzF9.-451A2n2eor1PvE-BQUrgIhGNBkwCSF3zSoMhazmGFc";
const API_URL = "htpp://ec2-54-162-147-227.compute-1.amazonaws.com:3000";

class APIClient {

    constructor(apiUrl, userID, jwt) {
        this.userID = userID;
        this.apiUrl = apiUrl;
        this.jwt = jwt;
        this.axios = require("axios");
        const that = this;
        this.axios.interceptors.request.use(function (config) {
            console.log(typeof(config.url))
            if(!config.url.startsWith('http')) {
                config.url = that.apiUrl + config.url;
            }
            console.log(config.url);
            config.headers.Authorization =`Bearer ${that.jwt}`;
            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });
        
        //Auxiliar attributes
        this.weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday',
            'friday', 'saturday']
    }


    async getTodayMeals() {
        const date = new Date();
        const day = this.weekdays[date.getDay()];
        return this.getDayMeals(day);
    }

    async getDayMeals(day) {
        const response = await this.axios.get(`/api/plans/${this.userID}/meals`);
        // console.log("respuesat del server", response.data)
        console.log(response.data)
        let meals = response.data.weekdays[day];
        return meals;
    }
    
    
    async getTodayMedicines() {
        const date = new Date();
        const day = this.weekdays[date.getDay()];
        return this.getDayMedicines(day);
    }

    async getDayMedicines(day) {
        const response = await this.axios.get(`/api/plans/${this.userID}/medicines`);
        // console.log("respuesat del server", response.data)
        let medicines = response.data.weekdays[day].medicines;
        // Protection
        medicines = this._splitMedicines(medicines);
        //
        return this._compactMedicines(medicines);
    }

    async getTodayActivities() {
        const date = new Date();
        const day = this.weekdays[date.getDay()];
        return this.getDayActivities(day);
    }

    async getDayActivities(day) {
        const response = await this.axios.get(`/api/plans/2/activities?day=${day}`);
        return response.data.weekdays[day].activities.exercises;
    }

    _splitMedicines(medicines) {
        let splitMedicines = [];
        medicines.forEach((medicine) => {
            if (medicine.at.constructor === Array) {
                const slots = [];
                medicine.at.forEach((hour) => {
                    slots.push({
                        at: hour,
                        code: medicine.code,
                    })
                });
                // console.log("pushing", slots)
                splitMedicines = splitMedicines.concat(slots);
            } else {
                splitMedicines.push(medicine);
            }
        });
        // console.log(splitMedicines)
        // splitMedicines.sort((a, b) => {
        //     console.log("comparando", a, b);
        //     return a.at < b.at;
        // });
        // console.log("sorted", splitMedicines)

        return splitMedicines;
    }



    _compactMedicines(medicines) {
        const compactSlots = [];
        medicines.forEach((slot) => {
          const compactSlot = compactSlots.find(compactSlot => compactSlot.code === slot.code);

          if(compactSlot) {
            compactSlot.at.push(slot.at);
          } else {
            const medicineSlot = {
              at: [slot.at],
              code: slot.code
            }
            compactSlots.push(medicineSlot);
          }
        });
        return compactSlots;
      }


      async getDisorders() {
        const response = await this.axios.get(`/api/users/2/disorders`);
        return response.data.disorders;
      }


      async addTrackingEvent(registerID, data, at) {
          const now = new Date()
          const body = {
              data,
              timestamp: now.toISOString(),
              at
          }
          const response = await this.axios.patch("/api/registers/1/tracking", body);
          return response;
      }
}


const client = new APIClient(API_URL, 2, token);


// client.getDayMedicines("friday").then(medicines => console.log("las medicinas son", medicines))
// client.getTodayMedicines().then(medicines => console.log("las medicinas de hoy son", medicines))
// client.getDayActivities("friday").then(exercises => console.log("los ejercicios del viernes son", exercises))
// client.getTodayActivities().then(exercises => console.log("los ejercicios de hoy son", exercises))
// client.getDayMeals("friday").then(meals => console.log("las el viernes para desayunar se debe", meals["lunch"]))
client.getTodayMeals().then(meals => console.log("hoy para desayunar se debe", meals["breakfast"]))
axios.get("https://cima.aemps.es/cima/rest/medicamento?nregistro=68331").then(_ => console.log(_))

// client.getDisorders().then(enfermedades => console.log("mis enfermedades son", enfermedades))

// client.addTrackingEvent(1, 5.4, "prior")
//     .then(response => console.log(response.data))
//     .catch(error => console.error(error))


// const integer = 5;
// const decimal = 4;
// const decimalOrder = 10 ** String(decimal).length
// const data = integer + decimal / ((decimalOrder > 0) ? decimalOrder : 1);
// console.log(data)