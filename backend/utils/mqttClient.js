// utils/mqttClient.js
const mqtt = require('mqtt');

// Connect to the standard MQTT port (1883), not the WebSocket port (8084).
// The backend uses the native MQTT protocol, while the frontend uses WebSockets.
// const client = mqtt.connect('mqtt://broker.emqx.io:1883');
// const client = mqtt.connect('ws://broker.emqx.io:8083/mqtt'); // wss://broker.emqx.io:8084/mqtt
const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt'); // 

client.on('connect', () => {
    console.log('✅ MQTT connected from backend');
});

client.on('error', (err) => {
    console.error('❌ MQTT error:', err);
});

// helper to publish messages
const publishBookingUpdate = (topic, payload) => {
    client.publish(topic, JSON.stringify(payload), { qos: 1 });
};

module.exports = { publishBookingUpdate };
