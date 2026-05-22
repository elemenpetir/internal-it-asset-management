require('dotenv').config()
const app = require('./src/app')
const port = process.env.PORT || 3000
const db = require('./src/config/db')

const testDbConnection = async () => {
    try {
        const connection = await db.getConnection()
        console.log('database connectedd')
        connection.release()
    } catch (error) {
        console.error('database connection failed')
    }
}
testDbConnection()

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})