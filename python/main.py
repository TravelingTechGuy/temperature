import time
import random
from datetime import datetime, timezone
from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

# globals
DeviceUnits = "F"
Celsius = 0.0
Fahrenheit = 0.0
Humidity = 0.0

# callback from hardware side
def updateTemperature(celsius: float, fahrenheit: float, humidity: float):
    global Celsius, Fahrenheit, Humidity
    Celsius = celsius
    Fahrenheit = fahrenheit
    Humidity = humidity
    print(f"Celsius: {Celsius}\tFahrenheit: {Fahrenheit}\tHumidity: {Humidity}")

Bridge.provide("updateTemperature", updateTemperature)

# toggle F/C
def toggleDeviceUnits():
    global DeviceUnits
    DeviceUnits = "C" if DeviceUnits == "F" else "F"
    print(f"Degrees changed to {DeviceUnits}")
    Bridge.call("setDegrees", DeviceUnits)
    return getDeviceUnits()

# API call
def getTemp():
    global Celsius, Fahrenheit, Humidity
    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "celsius": Celsius,
        "fahrenheit": Fahrenheit,
        "humidity": Humidity
    }

def getDeviceUnits():
    return {"units": DeviceUnits}

# set up web interface
ui = WebUI()
ui.expose_api("GET", "/temp", getTemp)
ui.expose_api("GET", "/units", getDeviceUnits)
ui.expose_api("GET", "/setUnits", toggleDeviceUnits)

def loop():
    time.sleep(10)

App.run(user_loop=loop)
