# Payment elemenent vertical layout

This repo contains a proof of concept of the payment element vertical layout. In order for the repo to fully work you need to be enabled on the beta. Contact Stripe sales through [this page](https://stripe.com/docs/elements/appearance-api). 

## Vertical layout

This is achieved using the following style when creating the `paymentElement`:

```
const paymentElement = elements.create('payment', {
    layout: {
      type: 'accordion',
      ...
    },
  });
```

## Handle selected payment method

In order to handle specific operation for particular payment method, the `updatePaymentIntent()`. The following code executes before the call to `confirmPayment()`:

```
 const result = await stripe.updatePaymentIntent({
      elements,
      params: {
        expand: ['payment_method'],
      },
    });

    if (result.error) {
      // Handle errors 
      ...
    } else {
      if (result.paymentIntent.payment_method.card) {
        // Handle cards related operations 
        ...
      }
    }
```

 Usage 

* Clone the repo locally 
* Copy `.env.example` to `'/server/.env`
* Fill in the values for the following variables (you can leave the rest as they are)
  * `STRIPE_PUBLISHABLE_KEY`
  * `STRIPE_SECRET_KEY`
* Install dependencies
```
cd server
npm install
```
* Run the server
``
(cd server)
npm start
``
* Open a browser to [`https//localhost:4242`](https//localhost:4242)
