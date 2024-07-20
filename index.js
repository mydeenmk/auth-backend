import express from 'express';
import userRoute from './routes/auth.js';
import connectToMongoDB from './config/connect_mongo.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from "cors"
// const corsOptions = {
//     origin: "*",
//     optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));


dotenv.config();


// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/auth", userRoute);
// app.use("/productGet", productGetRoute);
// app.use("/productPost", productPost);
// app.use("/cart", userCart);
connectToMongoDB();

// app.get('/' , async(req,res) => {
//   res.send('Hi this is Test');
// });
const port = process.env.PORT;
// Connect to MongoDB and start server
// export const handler = serverless(app);
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

