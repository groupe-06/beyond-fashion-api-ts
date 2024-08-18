import express from 'express';
import roleRoute from './routes/roleRoute';
import userRoute from './routes/userRoute';
import Rechargerouter from './routes/recharRoutes';
import 'dotenv/config';
import postRouter from './routes/postRoute';
import reportRouter from './routes/reportRouter';
import reactionRouter from './routes/reactionpostRoute';

const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.URI;


app.use(express.json());
app.use(`${uri}/roles`, roleRoute);
app.use(`${uri}/users`, userRoute);
app.use(`${uri}/users`, Rechargerouter);
app.use(`${uri}/post`, postRouter);
app.use(`${uri}/post`, reportRouter);
app.use(`${uri}/post`, reactionRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
