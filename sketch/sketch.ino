#include <Arduino_RouterBridge.h>
#include "Arduino_LED_Matrix.h"
#include "Arduino_Modulino.h"

Arduino_LED_Matrix matrix;
ModulinoThermo thermo;

String degrees = "F";

void setup() {
  // Uno Q bridge typically uses 115200
  Serial.begin(115200); 
  Modulino.begin();
  thermo.begin();
  matrix.begin();
  Bridge.begin();
  Bridge.provide("setDegrees", setDegrees);
}

void loop() {
  float celsius = thermo.getTemperature();
  float fahrenheit = (celsius * 9 / 5) + 32;
  float humidity = thermo.getHumidity();
  
  String tempStr = degrees == "C" ? String((int)celsius) + "C" : String((int)fahrenheit) + "F";

  matrix.beginText(0, 1, 0xFFFFFF); // (x, y, color)
  matrix.textFont(Font_5x7);
  matrix.textScrollSpeed(200); // Speed in milliseconds
  matrix.print(tempStr);
  matrix.endText(SCROLL_LEFT); // Scroll direction

  // Print to the STM32 Microcontroller Log
  Serial.print("Temperature: "); 
  Serial.println(tempStr);
  Serial.print("Humidity: "); 
  Serial.println(String(humidity));

  Bridge.call("updateTemperature", celsius, fahrenheit, humidity);
  
  delay(2000);
}

void setDegrees(String deg) {
  degrees = deg;
}