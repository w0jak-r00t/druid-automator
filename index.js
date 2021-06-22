const util = require('util');
const exec = util.promisify(require('child_process').exec);
const xpath = require('xpath-html');
const UIAutomator = require('uiautomator-server');
const sleep = require('util').promisify(setTimeout);

module.exports = class DruidAutomator extends UIAutomator {
  connect(keepApks=false) {
    super.connect(keepApks);
    // await this.shell('ime set com.android.adbkeyboard/.AdbIME');
  }

  click(coords) {
    super.click(coords[0], coords[1]);
  }

  getCoordsOfElement(element) {
    let bounds = element.getAttribute('bounds');
    bounds = JSON.parse(bounds.replace('][', ','));
    let centerOfElement = [Math.round((bounds[0]+bounds[2])/2), Math.round((bounds[1]+bounds[3])/2)]
    return centerOfElement;
  }

  async findElement(expression) {
    let xml = await super.dump(false);
    let element = xpath.fromPageSource(xml).findElement(expression);
    let coords = this.getCoordsOfElement(element);
    element.click = () => { return this.click(coords) };
    element.longClick = (duration = 100) => { return super.swipe(coords[0], coords[1], coords[0], coords[1], duration) };
    return element;
  }

  async findElements(expression) {
    let xml = await super.dump(false);
    let elements = xpath.fromPageSource(xml).findElements(expression);
    let newElements = [];
    for (let element of elements) {
      let coords = this.getCoordsOfElement(element);
      element.click = () => { return this.click(coords) };
      element.longClick = (duration = 100) => { return super.swipe(coords[0], coords[1], coords[0], coords[1], duration) };
      newElements.push(element);
    }
    return newElements;
  }

  async waitForElement(expression, timeout = undefined) {
    let element;
    let iterations = timeout ? Math.round(timeout/500) : 99999;
    for (let i = 0; i <= iterations; i++) {
      try {
        let xml = await super.dump(false);
        element = xpath.fromPageSource(xml).findElement(expression);
        let coords = this.getCoordsOfElement(element);
        element.click = () => { return this.click(coords) };
        element.longClick = (duration = 100) => { return super.swipe(coords[0], coords[1], coords[0], coords[1], duration) };
        return element;
      }
      catch { await sleep(300); }
    }
    xpath.fromPageSource('<html></html>').findElement(expression);
  }

  async input(text) {
    await this.shell(`am broadcast -a ADB_INPUT_TEXT --es msg "${text}"`);
    return true;
  }

  async shell(command) {
    const { stdout, stderr } = await exec(`adb shell '${command}'`);
    if (stderr) {
      return stderr;
    } else {
      return stdout;
    }
  }

}
