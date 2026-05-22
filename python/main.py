import time
import random
from datetime import datetime, timezone
from arduino.app_utils import App, Bridge
from arduino.app_bricks.web_ui import WebUI

# globals
Degrees = "F"
Celsius = 0.0
Fahrenheit = 0.0
Humidity = 0.0

# API call
def getTemp():
    global Celsius, Fahrenheit, Humidity
    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "celsius": Celsius,
        "fahrenheit": Fahrenheit,
        "humidity": Humidity
    }

# set up web interface
ui = WebUI()
ui.expose_api("GET", "/", getTemp)

# callback from hardware side
def updateTemperature(celsius: float, fahrenheit: float, humidity: float):
    global Celsius, Fahrenheit, Humidity
    Celsius = celsius
    Fahrenheit = fahrenheit
    Humidity = humidity
    print(f"Celsius: {Celsius}\tFahrenheit: {Fahrenheit}\tHumidity: {Humidity}")

Bridge.provide("updateTemperature", updateTemperature)

# toggle F/C
def changeDegrees():
    global Degrees
    Degrees = "C" if Degrees == "F" else "F"
    print(f"Degrees changed to {Degrees}")
    Bridge.call("setDegrees", Degrees)

def loop():
    # flip a coin and change degrees
    if random.randint(1, 100) % 2 == 0:
        changeDegrees()
    time.sleep(10)

App.run(user_loop=loop)
