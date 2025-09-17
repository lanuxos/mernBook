// utils/mqttClient.js
const mqtt = require('mqtt');

// connect to broker (can be public broker.emqx.io or your own)
// const client = mqtt.connect('mqtt://broker.emqx.io:1883');
// above endpoint work fine on localhost
const client = mqtt.connect('wss://broker.hivemq.com:443/mqtt');

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
