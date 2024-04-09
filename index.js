const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv');
const{dbConnection}=require('./database/database');
const foodRouter = require('./routes/foodrouter');
const userRouter = require('./routes/userrouter');
const orderRouter = require('./routes/orderrouter');
const uploadRouter = require('./routes/uploadrouter');
//const authMiddleware = require('./middleware/auth');
//const dirname = require('path');
//const  {fileURLToPath} = require('url');
const bodyParser = require('body-parser');

const PORT = process.env.PORT||8000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
dotenv.config();
const app = express();
app.use(cors({ // Use cors as a function
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200
      }));
      
app.use(express.static('/public'))
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
  //app.use(authMiddleware);
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

// const publicFolder = path.join(__dirname, 'public');
// app.use(express.static(publicFolder));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
