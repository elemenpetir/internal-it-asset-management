const errorMiddleware = (err, req, res, next) => {
    console.error(err)

    // errors carrying an explicit statusCode (e.g. 404 from models, B6)
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            status: 'failed',
            message: err.message
        })
    }

    if(err.code === 'ER_DUP_ENTRY'){
        return res.status(409).json({
            status: 'failed',
            message: 'duplicate value already exists'
        })
    }

    if(err.code === 'ER_NO_REFERENCED_ROW_2'){
        return res.status(400).json({
            status: 'failed',
            message: 'related data not found'
        })
    }

    return res.status(500).json({
        status: 'failed',
        message: 'internal server error'
    })
}

module.exports = errorMiddleware