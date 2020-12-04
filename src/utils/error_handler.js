

const handleHttpErrorResponse = (res , error , code) => { 
    return res.status(code).send({
        message : error.message,
        success : false ,
    })
}





module.exports = {
    handleHttpErrorResponse,
}

