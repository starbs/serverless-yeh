'use strict';

module.exports = {

   // invoked by CloudFront (viewer requests)
   handler: function(evt, context, cb) {
      console.log(JSON.stringify(evt));
      var req = evt.Records[0].cf.request;

      if (req.uri && req.uri.length) {
         var path = req.uri.split('.');

         if (path.length > 1) {
             req.uri = path[0];
         }
      }

      cb(null, req);
   },

};
