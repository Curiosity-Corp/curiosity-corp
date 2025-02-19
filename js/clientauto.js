
// ... HANDLEBAR STEP 2
const express = require('express');
const expressHandlebars = require('express-handlebars');
const app = express();

app.engine('.hbs', expressHandlebars({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

app.get('https://stripedonate.azurewebsites.net/api/StripeHttpTrigger?code=/xlyHNsnNnqie7yQTDf0fVgPAGaC/D259rKok9dNWRraEIX8MhX5yg==', async (req, res) => {
  const intent = // ... Fetch or create the PaymentIntent
  res.render('checkout', { client_secret: intent.client_secret });
});

app.listen(3000, () => {
  console.log('Running on port 3000')
});

// ... COLLECT PAYMENT STEP 3

var stripe = Stripe('pk_test_M4lUHJesnz3f9gWbUJzdncMV');

var elements = stripe.elements();
var cardElement = elements.create('card');
cardElement.mount('#card-element');



// ... SUBMIT PAYMENT STEP 4


var cardholderName = document.getElementById('cardholder-name');
var cardButton = document.getElementById('card-button');
var clientSecret = cardButton.dataset.secret;

cardButton.addEventListener('click', function(ev) {
  stripe.handleCardPayment(
    clientSecret, cardElement, {
      payment_method_data: {
        billing_details: {name: cardholderName.value}
      }
    }
  ).then(function(result) {
    if (result.error) {
      // Display error.message in your UI.
    } else {
      // The payment has succeeded. Display a success message.
    }
  });
});