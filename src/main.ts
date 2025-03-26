import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Express } from 'express'
import bodyParser from 'body-parser'
import configureRoutes from '@routes/index'

dotenv.config()

const port = process.env.My_PORT
const app: Express = express()

app.use(cors())
app.use(express.json())
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Testing new auto deployment - PORT: ' + port)
})

const router = express.Router()
configureRoutes(router)
app.use(router)

app.listen(port)
