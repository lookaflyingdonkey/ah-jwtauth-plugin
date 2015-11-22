var jsonwebtoken = require('jsonwebtoken');

module.exports = {

    initialize: function(api, next) {

        var jwtMiddleware = {
            name: 'jwt token validator',
            global: true,
            preProcessor: function(data, next) {

                // not configured to be used
                if (!data.actionTemplate.authenticate || !api.config.jwtauth.enabled[data.connection.type]) {
                    return next();
                }

                // get request data from the required sources
                var token = '';
                var req = {
                    headers: data.params.httpHeaders || (data.connection.rawConnection.req ? data.connection.rawConnection.req.headers : undefined) || data.connection.mockHeaders || {},
                    uri: data.connection.rawConnection.req ? data.connection.rawConnection.req.uri : {}
                };

                var authHeader = req.headers.authorization ||  req.headers.Authorization ||  false;

                // extract token from http headers
                if (authHeader) {
                    var parts = authHeader.split(' ');
                    if (parts.length != 2 || parts[0].toLowerCase() !== 'token') {
                        return next({
                            code: 500,
                            message: 'Invalid Authorization Header'
                        });
                    }
                    token = parts[1];
                }

                // if GET parameter for tokens is allowed, use it
                if (!token && api.config.jwtauth.enableGet && req.uri.query && req.uri.query.token) {
                    token = req.uri.query.token;
                }

                if (!token) {
                    return next({
                        code: 500,
                        message: 'Authorization Header Not Set'
                    });
                }

                // process token and save in connection
                api.jwtauth.processToken(token, function(tokenData) {
                    data.connection._jwtTokenData = tokenData;
                    next();
                }, next);
            },

            stop: function(api, next) {
                next();
            }
        }

        api.actions.addMiddleware(jwtMiddleware);
        next();
    }
};
