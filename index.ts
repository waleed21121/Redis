import express from 'express';
import cuisinesRouter from './routes/cuisines';
import resturantsRouter from './routes/resturants';
import { errorHandler } from './middlewares/errorHandler';
import redisClient from './utils/client';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());


app.use('/api/resturants', resturantsRouter);
app.use('/api/cuisines', cuisinesRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`App is listining on port ${PORT}`);
    await redisClient.connect();
})