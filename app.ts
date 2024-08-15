import express from 'express';
import roleRoute from './routes/roleRoute';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.URI;


app.use(express.json());
app.use(`${uri}/roles`, roleRoute);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
