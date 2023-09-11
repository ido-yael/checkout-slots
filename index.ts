import { FullHttpResponse, FunctionsBuilder } from '@wix/serverless-api';
import { createHttpClient } from '@wix/http-client';
import {verify} from 'jsonwebtoken'

const httpClient = createHttpClient();

module.exports = function builder (builder: FunctionsBuilder) {
  return builder
    .addWebFunction('GET', '/app', async (ctx, req) => {
     const token:string = req.query.token
     const url = `https://www.wix.com/installer/install?token=${token}&appId=f1328fef-0e80-440d-8663-b17e7d4791a2&redirectUrl=https://manage.wix.com/checkout-slots-idoy/oauth`
     ctx.logger.info("token",token)
     return new FullHttpResponse({
      status: 302,
      headers: { Location: url }
    })
    }
    )
    .addWebFunction('GET', '/oauth', async (ctx, req) => {
      const code = req.query.code
      const data = JSON.stringify({
        "grant_type": "authorization_code",
        "client_id": "f1328fef-0e80-440d-8663-b17e7d4791a2",
        "client_secret": "3887b7f1-48c9-4c27-826b-16594233e8a3",
        "code": code
      })
     ctx.logger.info("code",code)
      const call =await httpClient.request({
          data: data,
         headers: { 'Content-Type': 'application/json' },
          maxRedirects: 0,
          method: 'post',
          url:'https://www.wixapis.com/oauth/access',
        });
      ctx.logger.info("data",call.data)
      //@ts-ignore
      const accessToken:string = call.data["access_token"]
      const url = `https://www.wix.com/installer/close-window?access_token=${accessToken}`
      return new FullHttpResponse({
        status: 302,
        headers: { Location: url }
      })

     })



     .addWebFunction('POST', '/v1/calculate-additional-fees', async (ctx, req) => {
      let amount = 0 
       const token = req.body
       const secret = ctx.getConfig("secret") as string
       const verified = verify(token,secret,{
         audience: "f1328fef-0e80-440d-8663-b17e7d4791a2",
         issuer: 'wix.com',
         algorithms: ['RS256'],
        })
        ctx.logger.info("extra-fees",verified)
        //@ts-ignore
        const currency = verified.data.metadata.currency
        //@ts-ignore
        const ecomID = verified.data.request.ecomId
        ctx.logger.info("ecomID",ecomID)

        const dataOfEcomId = await ctx.cloudStore.keyValueStore.get(ecomID);
        ctx.logger.info("checkBoxOfEcomId", dataOfEcomId);
        const checkBoxOfEcomId = (dataOfEcomId as any).data;
        ctx.logger.info("checkBoxOfEcomId", checkBoxOfEcomId);
        
        if (checkBoxOfEcomId === true) {
          ctx.logger.info("The checkbox is true");
          //@ts-ignore
         const instanceID =  verified.data.metadata.instanceId
         ctx.logger.info("instanceID",instanceID);
          const dataByInstance = await ctx.cloudStore.keyValueStore.get(instanceID);
          ctx.logger.info("dataByInstance",dataByInstance)
          const amounByinstance = (dataByInstance as any).data.amount
          ctx.logger.info("amounByinstance",amounByinstance)
          amount = amounByinstance //need to convert *******************************
        }
        else 
          ctx.logger.info("the checkbox is false")

      return new FullHttpResponse({
       status: 200,
       body: {
        "currency": currency,
        "additionalFees": [
          {
            "code": "extra-fee",
            "name": amount+` ${currency} was added`,
            "price": amount,
            "taxDetails": {
              "taxable": true
            }
          }
        ]
      }
     })
     })

     .addWebFunction('OPTIONS', '/settings', async () => {
      return new FullHttpResponse({
        status: 200,
        body: null,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
          'Access-Control-Allow-Headers': '*'
        },
      });
    })

     .addWebFunction('POST', '/settings', async (ctx, req) => {
      const instanceID = req.body.instanceID as string
      const settings = req.body.settings
      ctx.logger.info("instanceID",instanceID)
      ctx.logger.info("settings",settings)

      await ctx.cloudStore.keyValueStore.set({key: instanceID, data: settings});

     return new FullHttpResponse({
      status: 200,
      body: {},
      headers: {'Access-Control-Allow-Origin': '*'}
    })
    })

    .addWebFunction('GET', '/settings', async (ctx, req) => {
      const instanceID = req.query.instanceId as string
      ctx.logger.info("instanceID details",instanceID,typeof instanceID)
 
      const settings = await ctx.cloudStore.keyValueStore.get(instanceID);

     return new FullHttpResponse({
      status: 200,
      body: settings,
      headers: {'Access-Control-Allow-Origin': '*'}
    })
    })

    .addWebFunction('OPTIONS', '/checkbox', async () => {
      return new FullHttpResponse({
        status: 200,
        body: null,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, POST',
          'Access-Control-Allow-Headers': '*'
        },
      });
    })

    .addWebFunction('POST', '/checkbox', async (ctx, req) => {
      ctx.logger.info("the body",req.body)
      const ecomID = req.body.EcomId
      const checkBox = req.body.checkBox
      ctx.logger.info("the key ecomID",ecomID)
      const settings = await ctx.cloudStore.keyValueStore.set({key: ecomID,data: checkBox});

     return new FullHttpResponse({
      status: 200,
      body: settings,
      headers: {'Access-Control-Allow-Origin': '*'}
      
    })
    })




 
     };
     
  


