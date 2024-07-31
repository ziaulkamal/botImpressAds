require('dotenv').config(); 
const { exec } = require('child_process');


const numberOfBrowsers = process.env.NUMBER_OF_BROWSERS || 1; 


const scripts = Array.from({ length: numberOfBrowsers }, () => 'node main.js');

scripts.forEach((script, index) => {
  exec(script, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error in script ${index + 1}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr in script ${index + 1}: ${stderr}`);
      return;
    }
    console.log(`stdout from script ${index + 1}: ${stdout}`);
  });
});