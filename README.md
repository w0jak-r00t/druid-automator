# druid-automator

## Install
```bash
npm install --save https://github.com/w0jak-r00t/druid-automator
```

## Usage

```javascript
const DruidAutomator = require('druid-automator');

const device = new DruidAutomator();
await device.connect();
await device.findElement('//node[@text="Apps"]').then(element => element.click());
await device.waitForElement('//node[@text="Apps"]').then(element => element.click());
let elements = await device.findElements('//node[@text="Apps"]'); // returns Array of elements
for (var element of elements) {
  console.log(element.getAttribute('text'));
}
const deviceInfo = await device.info();
console.log(deviceInfo);
```
