const success = (message, data = null) => {
    return ({
        success: true,
        message: message,
        data: data,

    });
};

const failure = (message, error = null) => {
    return ({
        success: false,
        message: message,
        error: error,
    });
};

module.exports = {success, failure};