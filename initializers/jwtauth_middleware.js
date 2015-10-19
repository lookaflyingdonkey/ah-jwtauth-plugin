var jsonwebtoken = require ('jsonwebtoken');

module.exports = {

  initialize: function(api, next){

    var jwtmiddleware = {
        name: 'jwt token validator',
        global: true,
        preProcessor: function(data, next) {
            if(data.actionTemplate.authenticate && api.config.jwtauth.enabled[data.connection.type] && api.config.jwtauth.enabled[data.connection.type] === true) {
              var req = data.connection.rawConnection.req;
              if(!req && data.mockHeaders) {
                req = {
                  headers: data.mockHeaders
                };
              }
              if(req.headers && req.headers['authorization']) {
                var parts = req.headers['authorization'].split(' ');
                if(parts.length != 2) {
                  next({
                    code: 500,
                    message: 'Invalid Authorization Header'
                  });
                } else {
                  if(parts[0].toLowerCase() != 'token') {
                    next({
                      code: 500,
                      message: 'Invalid Authorization Header'
                    });
                  } else {
                    api.jwtauth.processToken(parts[1], function(tokenData) {
                      data._jwtTokenData = tokenData;
                      next();
                    }, function(err) {
                      next(err);
                    });
                  }
                } 
              } else {
                  next({
                    code: 500,
                    message: 'Authorization Header Not Set'
                  });
              }
            } else {
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
