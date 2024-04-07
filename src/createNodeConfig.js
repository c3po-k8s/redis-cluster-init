'use strict'
const log = require('./logger')
const minio = require('./minio')
const fs = require('fs')
let POD_NAME = process.env.POD_NAME, BUCKET = process.env.S3_SYNC_BUCKET
const getFile = async()=>{
  try{
    return await minio.get(BUCKET, POD_NAME, 'nodes.conf')
  }catch(e){
    throw(e)
  }
}
const setPerms = ()=>{
  return new Promise((resolve, reject)=>{
    try{
      fs.chmod('/app/data/nodes.conf', 511, (err)=>{
        if(err) reject(err)
        resolve()
      })
    }catch(e){
      reject(e)
    }
  })
}
module.exports = async()=>{
  try{
    await fs.writeFileSync('/app/data/nodes.conf', '')
    let data = await getFile()
    if(data){
      log.info(`writing existing nodes.conf to disk...`)
      await fs.writeFileSync('/app/data/nodes.conf', data)
    }
    await setPerms()
    return true
  }catch(e){
    throw(e)
  }
}
