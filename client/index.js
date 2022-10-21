document.addEventListener('DOMContentLoaded', async () => {
  // Load the publishable key from the server. The publishable key
  // is set in your .env file.
  const {publishableKey} = await fetch('/config').then((r) => r.json());
  if (!publishableKey) {
    addMessage(
      'No publishable key returned from the server. Please check `.env` and try again'
    );
    alert('Please set your Stripe publishable API key in the .env file');
  }

  const stripe = Stripe(publishableKey, {
    apiVersion: '2020-08-27;server_side_confirmation_beta=v1',
    betas: [
      'payment_element_vertical_layout_beta_1',
      'server_side_confirmation_beta_1',
    ],
  });

  // On page load, we create a PaymentIntent on the server so that we have its clientSecret to
  // initialize the instance of Elements below. The PaymentIntent settings configure which payment
  // method types to display in the PaymentElement.
  const {error: backendError, clientSecret} = await fetch(
    '/create-payment-intent'
  ).then((r) => r.json());
  if (backendError) {
    addMessage(backendError.message);
  }
  addMessage(`Client secret returned.`);

  // Initialize Stripe Elements with the PaymentIntent's clientSecret,
  // then mount the payment element.
  const elements = stripe.elements({clientSecret});
  const paymentElement = elements.create('payment', {
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: false,
    },
  });
  paymentElement.mount('#payment-element');

  // When the form is submitted...
  const form = document.getElementById('payment-form');
  let submitted = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable double submission of the form
    if (submitted) {
      return;
    }
    submitted = true;
    form.querySelector('button').disabled = true;

    const nameInput = document.querySelector('#name');

    // Optional - Check payment intent before confirming it
    const result = await stripe.updatePaymentIntent({
      elements,
      params: {
        expand: ['payment_method'],
      },
    });

    if (result.error) {
      // Handle errors 
      if (
        result.error.type === 'card_error' ||
        result.error.type === 'validation_error'
      ) {
        addMessage(error.message);
      } else {
        addMessage('An unexpected error occurred.');
      }
      setLoading(false);
      return;
    } else {
      if (result.paymentIntent.payment_method.card) {
        // Handle cards related operations 
        addMessage('Card selected as payment method')
      }
    }
    
    // Confirm the card payment given the clientSecret
    // from the payment intent that was just created on
    // the server.
    const {error: stripeError} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/return.html`,
      },
    });

    if (stripeError) {
      addMessage(stripeError.message);

      // reenable the form.
      submitted = false;
      form.querySelector('button').disabled = false;
      return;
    }
  });
});
