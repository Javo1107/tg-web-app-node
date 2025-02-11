const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const https = require('https');
const fs = require('fs');

const token = '6586183439:AAHx-0XIJrnXWDX7sUerD-jfhroSVjGiP-k';
const webAppUrl = 'https://b379-93-188-83-203.ngrok-free.app';

const options = {
    key: fs.readFileSync('/etc/ssl/private/server.key'),
    cert: fs.readFileSync('/etc/ssl/certs/server.cert')
};

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors({
    origin: webAppUrl,
    methods: ['POST'],
    credentials: true
}));

https.createServer(options, app).listen(8000, () => {
    console.log(`Server running on https://<your-public-ip>`);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Press the button to fill out the form', {
            reply_markup: {
                keyboard: [
                    [{text: 'Fill the form', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Press the button to use our online shop', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Order food', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            await bot.sendMessage(chatId, 'Thank you for your responses!')
            await bot.sendMessage(chatId, 'Your country: ' + data?.country);
            await bot.sendMessage(chatId, 'Your street: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'All the information you have received in this chat');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {products = [], totalPrice, queryId} = req.body;
    console.log("hey its me");
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Successfull purchase',
            input_message_content: {
                message_text: ` Thanks for your purchase, the total price is ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        console.log(e)
        return res.status(500).json({})
    }
})

// const PORT = 8000;

// app.listen(PORT, () => console.log('server started on PORT ' + PORT))
