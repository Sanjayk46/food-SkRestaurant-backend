const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const{dbConnection}=require('./database/database');
const foodRouter = require('./routes/foodrouter');
const userRouter = require('./routes/userrouter');
const orderRouter = require('./routes/orderrouter');
const uploadRouter = require('./routes/uploadrouter');
const bodyParser = require('body-parser');

const PORT = process.env.PORT||8000;

dotenv.config();
const app = express();
app.use(cors({ // Use cors as a function
        //origin: 'http://localhost:3000',
       // origin:'https://food-app-skrestaurant.netlify.app',
        origin:'https://skrestaurant-food.netlify.app', 
        //origin:'http://51.20.9.18:3000',
       // origin:'http://food-mern-app.s3-website.eu-north-1.amazonaws.com',
        optionsSuccessStatus: 200
      }));     
app.use(express.json());
dbConnection();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      res.status(400).json({ message: "Bad request: invalid JSON" });
    } else {
      next();
    }
  });
app.get('/',(req,res)=>{
    try {
       res.status(200).send({
        message:"working"
       }) 

    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
})
app.use('/api/users',userRouter)
app.use('/api/foods',foodRouter)
app.use('/api/orders',orderRouter)
app.use('/api/upload',uploadRouter)


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
