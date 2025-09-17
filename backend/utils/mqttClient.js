// utils/mqttClient.js
const mqtt = require('mqtt');

// connect to broker (can be public broker.emqx.io or your own)
// const client = mqtt.connect('mqtt://broker.emqx.io:1883');
// above endpoint work fine on localhost
const client = mqtt.connect('48c086e2145d4b3eb554c49bcd039382.s1.eu.hivemq.cloud', {
    username: 'mernbook',
    password: 'T00r@123'
});

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
