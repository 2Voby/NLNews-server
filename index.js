require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./router/index");
const errorMiddleware = require("./middlewares/error-middleware");
const ParserService = require("./service/parser-service");
const senderService = require("./service/sender-service");
const userModel = require("./models/user-model");
const ApiError = require("./exceptions/api-error");
const serviceModel = require("./models/service-model");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  cors({
    origin: ["https://lyceum-schedule.ztu.edu.ua", "http://localhost:5403"], // Укажите разрешенный источник
    methods: ["GET", "POST", "PUT", "DELETE"], // Укажите разрешенные HTTP методы
    allowedHeaders: ["Content-Type", "Authorization"], // Укажите разрешенные заголовки
  })
);

app.use("/api", router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`));

    // senderService.sendTestPost();

    // // визиваємо функцію кожних 30 секунд (хвилину в зібраному режимі)

    let service = await serviceModel.findOne({ serviceId: 1 });
    if (service) {
      if (service.serviceStatus == "on") {
        await ParserService.parseAllPages("https://lyceum.ztu.edu.ua");
      } else {
        console.log(
          "Сервіс вимкнено! Для активації зайдіть в панель управління"
        );
      }
    } else {
      console.error("Неможливо отримати статус сервісу");
    }

    setInterval(async () => {
      let service = await serviceModel.findOne({ serviceId: 1 });
      if (service) {
        if (service.serviceStatus == "on") {
          await ParserService.parseAllPages("https://lyceum.ztu.edu.ua");
        } else {
          console.log(
            "Сервіс вимкнено! Для активації зайдіть в панель управління"
          );
        }
      } else {
        console.error("Неможливо отримати статус сервісу");
      }
    }, 60000);
  } catch (e) {
    console.log(e);
  }
};

start();
