'use strict'
const log = require('./logger')
const k8s = require('@kubernetes/client-node');
let POD_NAME = process.env.POD_NAME, NAME_SPACE = process.env.NAME_SPACE
const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const appsApi = kc.makeApiClient(k8s.AppsV1Api);
const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const serviceBody = {
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    name: POD_NAME,
    namespace: NAME_SPACE
  },
  spec: {
    selector: {
      'statefulset.kubernetes.io/pod-name': POD_NAME
    },
    ports: [{
      name: 'client',
      port: 6379,
      targetPort: 6379
    },{
      name: 'gossip',
      port: 16379,
      targetPort: 16379
    }]
  }
}
module.exports.getService = async()=>{
  try{
    let data = await coreApi.readNamespacedService(POD_NAME, NAME_SPACE)
    return data?.body
  }catch(e){
    if(e?.body?.message){
      log.error(e.body.message)
    }else{
      log.error(e)
    }
  }
}
module.exports.createService = async()=>{
  try{
    let data = await coreApi.createNamespacedService(NAME_SPACE, serviceBody)
    return data?.response?.body
  }catch(e){
    if(e?.body?.message) throw(e.body.message)
    throw(e)
  }
}
module.exports.patchService = async()=>{
  try{
    let data = await coreApi.patchNamespacedService(POD_NAME, NAME_SPACE, serviceBody, undefined, undefined, undefined, undefined, undefined, { headers: { 'Content-type': 'application/merge-patch+json' } })
    return data?.response?.body
  }catch(e){
    if(e?.body?.message) throw(e.body.message)
    throw(e)
  }
}
