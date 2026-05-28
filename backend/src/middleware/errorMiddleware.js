const errorMiddleware = (err, req, res, next) => {
    console.error(err)

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