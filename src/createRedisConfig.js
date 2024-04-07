'use strict'
const log = require('./logger')
const fs = require('fs')
const readFile = ()=>{
  try{
    let conf = fs.readFileSync('/app/src/redis.conf')
    return conf?.toString()
  }catch(e){
    throw(e)
  }
}
module.exports = async(clusterIP)=>{
  try{
    let str = await readFile()
    if(str){
      str += `cluster-announce-ip ${clusterIP}`
      fs.writeFileSync('/app/data/redis.conf', str)
      log.info(`app/data/redis.conf saved...`)
      return true
    }
  }catch(e){
    throw(e)
  }
}
