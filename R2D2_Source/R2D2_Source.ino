#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <WebSocketsClient.h>


WiFiMulti wiFiMulti;
WebSocketsClient webSocket;

#define USE_SERIAL Serial

#define LW_START 12
#define LW_FORWARD 27
#define LW_BACKWARD 14

#define RW_START 33
#define RW_FORWARD 26
#define RW_BACKWARD 25


void onSocketMessage(char* message);

void hexdump(const void *mem, uint32_t len, uint8_t cols = 16) {
	const uint8_t* src = (const uint8_t*) mem;
	USE_SERIAL.printf("\n[HEXDUMP] Address: 0x%08X len: 0x%X (%d)", (ptrdiff_t)src, len, len);
	for(uint32_t i = 0; i < len; i++) {
		if(i % cols == 0) {
			USE_SERIAL.printf("\n[0x%08X] 0x%08X: ", (ptrdiff_t)src, i);
		}
		USE_SERIAL.printf("%02X ", *src);
		src++;
	}
	USE_SERIAL.printf("\n");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

	switch(type) {
		case WStype_DISCONNECTED:
			USE_SERIAL.printf("[WSc] Disconnected!\n");
			digitalWrite(13, LOW);
			break;
		case WStype_CONNECTED:
			USE_SERIAL.printf("[WSc] Connected to url: %s\n", payload);
			digitalWrite(13, HIGH);
			// send message to server when Connected
			webSocket.sendTXT("iot:connected");
			break;
		case WStype_TEXT:
			onSocketMessage((char*)payload);
			break;
		case WStype_BIN:
			USE_SERIAL.printf("[WSc] get binary length: %u\n", length);
			hexdump(payload, length);

			// send data to server
			// webSocket.sendBIN(payload, length);
			break;
		case WStype_ERROR:			
		case WStype_FRAGMENT_TEXT_START:
		case WStype_FRAGMENT_BIN_START:
		case WStype_FRAGMENT:
		case WStype_FRAGMENT_FIN:
			break;
	}

}

void setup() {
	USE_SERIAL.begin(115200);

	//Serial.setDebugOutput(true);
	USE_SERIAL.setDebugOutput(true);

  wiFiMulti.enableIPv6(true);
	wiFiMulti.addAP("PoleDeVinci_Private", "Creatvive_Lab_2024");

	//WiFi.disconnect();
	while(wiFiMulti.run(5000, true) != WL_CONNECTED) {
		delay(100);
	}

	webSocket.beginSslWithBundle("r2d2.a4.creativlab.ovh", 443, "/", NULL);

	// event handler
	webSocket.onEvent(webSocketEvent);

	// try ever 5000 again if connection has failed
	webSocket.setReconnectInterval(1000);

	// Let's fun
	pinMode(13, OUTPUT);
	pinMode(LW_START, OUTPUT);
	pinMode(LW_FORWARD, OUTPUT);
	pinMode(LW_BACKWARD, OUTPUT);
  pinMode(RW_START, OUTPUT);
	pinMode(RW_FORWARD, OUTPUT);
	pinMode(RW_BACKWARD, OUTPUT);
}

void onSocketMessage(char* message) {
	String msg = String(message);
	if (msg.startsWith("iot:")) {
		return; // skip msgs from myself
	}
	USE_SERIAL.printf("[WS] Received message: %s\n", message);
	// Process the message
	if (msg == "client:ping-request") {
		webSocket.sendTXT("iot:ping-response");
		return;
	}
	if (msg == "client:led-on") return digitalWrite(13, HIGH);
	if (msg == "client:led-off") return digitalWrite(13, LOW);
	if (msg == "client:run" || msg == "client:forward") {
		digitalWrite(LW_START, HIGH);
		digitalWrite(LW_FORWARD, HIGH);
		digitalWrite(LW_BACKWARD, LOW);
    digitalWrite(RW_START, HIGH);
		digitalWrite(RW_FORWARD, HIGH);
		digitalWrite(RW_BACKWARD, LOW);
	}
	if (msg == "client:backward") {
		digitalWrite(LW_START, HIGH);
		digitalWrite(LW_FORWARD, LOW);
		digitalWrite(LW_BACKWARD, HIGH);
    digitalWrite(RW_START, HIGH);
		digitalWrite(RW_FORWARD, LOW);
		digitalWrite(RW_BACKWARD, HIGH);
	}
	if (msg == "client:stop") {
		digitalWrite(LW_START, LOW);
		digitalWrite(LW_FORWARD, LOW);
		digitalWrite(LW_BACKWARD, LOW);
    digitalWrite(RW_START, LOW);
		digitalWrite(RW_FORWARD, LOW);
		digitalWrite(RW_BACKWARD, LOW);
	}
  if (msg == "client:left") {
		digitalWrite(LW_START, HIGH);
		digitalWrite(LW_FORWARD, HIGH);
		digitalWrite(LW_BACKWARD, LOW);
    digitalWrite(RW_START, HIGH);
		digitalWrite(RW_FORWARD, LOW);
		digitalWrite(RW_BACKWARD, HIGH);
	}
  if (msg == "client:right") {
		digitalWrite(LW_START, HIGH);
		digitalWrite(LW_FORWARD, LOW);
		digitalWrite(LW_BACKWARD, HIGH);
    digitalWrite(RW_START, HIGH);
		digitalWrite(RW_FORWARD, HIGH);
		digitalWrite(RW_BACKWARD, LOW);
	}
}

void loop() {
	webSocket.loop();
}