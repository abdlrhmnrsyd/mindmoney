const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyD48RMK30BAJnpx6GPF6yd5aWQGgi0qXZ8";

async function test() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    }
}

test();
