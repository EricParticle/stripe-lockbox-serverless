import Stripe from 'stripe'
import { sendRequest } from '../../utils/particle.mjs'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(`O accept POST method, you tried: ${event.httpMethod}`)
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error('No secret key provided')
    }
    const stripe = new Stripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('No webhook secret provided')
    }

    const sig = event?.headers['Stripe-Signature']
    const stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret)
    const eventType = stripeEvent?.type ?? ''
    let deviceId
    switch (eventType) {
      case 'checkout.session.completed':
        deviceId = stripeEvent.data.object.metadata.device_id
        if (!deviceId) {
          throw new Error('Missing Thing ID metadata!')
        }
        await sendRequest(deviceId, 'UNLOCK')
        console.log('checkout session completed!', stripeEvent.data.object.customer_details)
        break
      default:
        console.log(`Unhandled event type ${eventType}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify(event)
    }
  } catch (e) {
    console.log(e)
    return {
      statusCode: 500,
      body: e.message
    }
  }
}
