const fs = require('fs');
const jwt = require('jsonwebtoken');

// Use 'utf8' to get string instead of byte array (512 bit key)
var privateKEY  = fs.readFileSync('./keys/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./keys/public.key', 'utf8');

module.exports = {
 sign: (payload, $Options) => {
    /*
     sOptions = {
      issuer: "Authorizaxtion/Resource/This server",
      subject: "iam@user.me", 
      audience: "Client_Identity" // this should be provided by client
     }
    */  // Token signing options
    var signOptions = {
      issuer:  $Options.issuer,
      subject:  $Options.subject,
      audience:  $Options.audience,
      expiresIn:  "30000d",    // 30 days validity
      algorithm:  "RS256"    
    };
    return jwt.sign(payload, privateKEY, signOptions);
  },

  verify: (token, $Option) => {
    /*
     vOption = {
      issuer: "Authorization/Resource/This server",
      subject: "iam@user.me", 
      audience: "Client_Identity" // this should be provided by client
     }  
     */
    var verifyOptions = {
      issuer:  $Option.issuer,
      subject:  $Option.subject,
      audience:  $Option.audience,
      expiresIn:  "30d",
      algorithm:  ["RS256"]
    };

    try {
      return jwt.verify(token, publicKEY, verifyOptions);
    } catch (err) {
      return false;
    }
  },

  // Returns null if token is invalid
  decode: (token) => {
    return jwt.decode(token, {complete: true});
  }
}