require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const router = require("./router/index");
const errorMiddleware = require("./middlewares/error-middleware");
const ParserService = require("./service/parser-service");
const senderService = require("./service/sender-service");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  cors({
    origin: "*", // Укажите разрешенный источник
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
    await ParserService.parseAllPages("https://lyceum.ztu.edu.ua");

    setInterval(async () => {
      await ParserService.parseAllPages("https://lyceum.ztu.edu.ua");
    }, 60000);
  } catch (e) {
    console.log(e);
  }
};

start();
