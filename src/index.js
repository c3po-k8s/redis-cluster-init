'use strict'
const log = require('./logger')
const k8Api = require('./k8Api')
const createRedisConfig = require('./createRedisConfig')
const createNodeConfig = require('./createNodeConfig')
let POD_NAME = process.env.POD_NAME, NAME_SPACE = process.env.NAME_SPACE
let serviceIp
const checkServiceExists = async()=>{
  try{
    if(!POD_NAME || !NAME_SPACE) throw(`Pod and namespace not provided...`)
    let service = await k8Api.getService()
    if(!service){
      log.info(`${POD_NAME} Service does not exist. Attempting to create...`)
      service = await k8Api.createService()
    }
    if(service){
      log.info(`${POD_NAME} Service does exists. Checking proper config...`)
      checkServiceConfig(service)
      return
    }
  }catch(e){
    log.error(e)
    setTimeout(checkServiceExists, 500)
  }
}
const checkServiceConfig = async(service = {})=>{
  try{
    if(service.spec?.ports?.filter(x=>x?.port === 6379 || x?.port === 16379).length === 2 && service.spec?.clusterIP){
      log.info(`${POD_NAME} service config is correct...`)
      createConfig(service.spec?.clusterIP)
      return
    }
    await k8Api.patchService()
    checkServiceExists()
  }catch(e){
    log.error(e)
    setTimeout(checkServicePorts, 5000)
  }
}
const createConfig = async(clusterIP)=>{
  try{
    if(clusterIP){
      let status = await createRedisConfig(clusterIP)
      if(status) status = await createNodeConfig()
      if(status){
        log.info('done')
        return
      }
    }
    setTimeout(checkServiceExists, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkServiceExists, 5000)
  }
}
checkServiceExists()
