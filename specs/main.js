import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import http from 'k6/http';
import { check } from 'k6';

// Define the stages for the test
export let options = {
    stages: [
        // Ramp up to 1 VUs for 10 second
        { duration: "10s", target: 1 },
      ],
};

// Open the CSV file and parse the data using papaparse
const csvData = open('data.csv');
const parsedData = papaparse.parse(csvData).data;

// Remove header row from the CSV data
parsedData.shift();

export default function () {

  const baseUrl = 'https://fakestoreapi.com/auth/login';

  // Loop through the data and make a POST request for each row
  parsedData.forEach(row => {
    // Extract the username and password from the row
    const [coulmn1,coulmn2] = row;

    const data = JSON.stringify({
        "username": coulmn1,
        "password": coulmn2
    })

    let headers = {
        'Content-Type': 'application/json'
    }

    let response = http.post(`${baseUrl}`, data, {
        headers: headers
    });

    // Check the response for various conditions
    check(response, {
		// The status code should be 200
		'status is 200': (r) => r.status === 200,
        // The response time should be less than 200ms
        'response time < 200ms': (r) => r.timings.duration < 200
    });


    // If the status code is not 200, log the request body

    if (response.status !== 200) {
        console.log(response.json().token);
    }

  });
}
