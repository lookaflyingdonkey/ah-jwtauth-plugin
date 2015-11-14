var jsonwebtoken = require('jsonwebtoken');

module.exports = {

    initialize: function(api, next) {

        var jwtmiddleware = {
            name: 'jwt token validator',
            global: true,
            preProcessor: function(data, next) {
                if (data.actionTemplate.authenticate && api.config.jwtauth.enabled[data.connection.type] && api.config.jwtauth.enabled[data.connection.type] === true) {
                    var req = data.connection.rawConnection.req;
                    if ( !req && data.connection.mockHeaders ) {
                        req = {
                            headers: data.connection.mockHeaders
                        };
                    }

                    var token = '';

                    // extract token from http headers
                    if (req.headers && req.headers['authorization']) {
                        var parts = req.headers['authorization'].split(' ');
                        if (parts.length != 2) {
                            next({
                                code: 500,
                                message: 'Invalid Authorization Header'
                            });
                        }
                        else {
                            if (parts[0].toLowerCase() != 'token') {
                                next({
                                    code: 500,
                                    message: 'Invalid Authorization Header'
                                });
                            }
                            else {
                                token = parts[1];
                            }
                        }
                    }

                    // if GET parameter for tokens is allowed, use it
                    if (!token && api.config.jwtauth.enableGet && data.connection.rawConnection.req.uri && data.connection.rawConnection.req.uri.query && data.connection.rawConnection.req.uri.query.token) {
                        token = data.connection.rawConnection.req.uri.query.token;
                    }

                    if (token) {
                        api.jwtauth.processToken(token, function(tokenData) {
                            data.connection._jwtTokenData = tokenData;
                            next();
                        }, function(err) {
                            next(err);
                        });
                    }
                    else {
                        next({
                            code: 500,
                            message: 'Authorization Header Not Set'
                        });
                    }
                }
                else {
                    next();
                }
            },
            stop: function(api, next) {
                next();
            }
        }


        api.actions.addMiddleware(jwtmiddleware);
        next();
    }
};