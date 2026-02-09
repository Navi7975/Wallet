import express from "express";
import cors from "cors";
import sequelize from "./config/db";
import userRoutes from "./routes/userRoutes";
import walletRoutes from "./routes/walletRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);

const start = async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("DB Connected");

    app.listen(5000, () =>
        console.log("Server running at http://localhost:5000")
    );
};

start();
