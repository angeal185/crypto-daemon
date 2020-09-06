const fs = require('fs'),
crypto = require('crypto'),
config = require('./config');

const key = crypto.pbkdf2Sync(config.secret, config.salt, config.iterations, 32, config.hash);

const utils = Object.freeze({
  encrypt(ctext){
    try {
      let iv = crypto.randomBytes(32),
      cipher = crypto.createCipheriv('aes-256-gcm', key, iv),
      encrypted = Buffer.concat([cipher.update(ctext, 'utf8'), cipher.final()]);
      return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('hex')
    } catch (err) {
      return null;
    }
  },
  decrypt(ctext){
    try {
      ctext = Buffer.from(ctext, 'hex');
      let decipher = crypto.createDecipheriv('aes-256-gcm', key, ctext.slice(0,32)).setAuthTag(ctext.slice(32,48));
      return decipher.update(ctext.slice(48), 'binary', 'utf8') + decipher.final('utf8');
    } catch (err) {
      return null;
    }
  },
  write(dest, data, cb){
    fs.writeFile(dest, data, function(err){
      if(err){return cb(err)}
      cb(false)
    })
  },
  read(src, cb){
    fs.readFile(src, 'utf8',function(err, data){
      if(err){return cb(err)}
      cb(false, data)
    })
  },
  del(src, cb){
    fs.unlink(src,function(err){
      if(err){return cb(err)}
      cb(false)
    })
  },
  watch_enc(){
    fs.watch(config.working_dir + 'encrypt', function(evt, file){
      let encDir = config.working_dir + 'encrypt',
      finalDir = config.working_dir + 'data',
      src = encDir +'/'+ file,
      dest = finalDir +'/'+ file + config.ext;
      utils.read(src, function(err,res){
        if(err){return}
        res = utils.encrypt(res);
        if(res){
          utils.write(dest, res, function(err,res){
            if(err){return console.error(err)}
            utils.del(src, function(err,res){
              if(err){return}

            })
          })
        }
      })

    })
  },
  watch_dec(){
    fs.watch(config.working_dir + 'decrypt', function(evt, file){
      let decDir = config.working_dir + 'decrypt',
      finalDir = config.working_dir + 'data',
      src = decDir +'/'+ file,
      dest = finalDir +'/'+ file.slice(0,- config.ext.length);

      utils.read(src, function(err,res){
        if(err){return}
        res = utils.decrypt(res);
        if(res){
          utils.write(dest, res, function(err,res){
            if(err){return console.error(err)}
            utils.del(src, function(err,res){
              if(err){return}

            })
          })
        }
      })
    })
  }
})

module.exports = utils;
