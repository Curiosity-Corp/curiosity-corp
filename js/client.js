const stripe = Stripe('pk_live_AT18iGVWTZZk5wOtQqlfhOm0');
const fetchlink = 'https://stripedonate.azurewebsites.net/api/StripeHttpTrigger?code=/xlyHNsnNnqie7yQTDf0fVgPAGaC/D259rKok9dNWRraEIX8MhX5yg==';

const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');
const cardholderName = document.getElementById('cardholder-name');
const cardButton = document.getElementById('card-button');
var errorElement = document.getElementById('card-errors');
var email = document.getElementById('email').value;
var tel = document.getElementById('tel').value;
var address = document.getElementById('address').value;
var city = document.getElementById('city').value;
var state = document.getElementById('state').value;
var totalamount = 2500;
var subscription = false;
var membership = document.getElementById("membership").checked;

function updateForm(control) {
  errorElement = document.getElementById('card-errors');
  email = document.getElementById('email').value;
  tel = document.getElementById('tel').value;
  address = document.getElementById('address').value;
  city = document.getElementById('city').value;
  state = document.getElementById('state').value;
  var checkedAmount = document.querySelector("input[name=total-amount]:checked");
  totalamount = parseInt(checkedAmount ? checkedAmount.value : totalamount, 10);
  subscription = document.getElementById("subscription").checked;
  membership = document.getElementById("membership").checked;
  console.log("Subscription is " + subscription);
  console.log("Amount is " + totalamount);
}

// FOR SINGLE PAYMENT ONLY

  cardButton.addEventListener('click', async (ev) => {
  updateForm();

if(subscription == false){
  console.log("Single Payment Activated");
  console.log("Submit Clicked");
  const {paymentMethod, error} =
  await stripe.createPaymentMethod('card', cardElement, {
    billing_details: {name: cardholderName.value}
  });
  if (error) {
  errorElement.style.display = 'block';
  console.log(error.message);
  errorElement.textContent = error.message;
  } else {
  errorElement.style.display = 'none';
  console.log("Send Payment Stringify to Server");
  var fullbody = JSON.stringify({cardholderName: cardholderName.value, totalamount : totalamount, subscription : subscription, email : email, tel : tel, address: address, city : city, state : state, membership : membership, payment_method_id: paymentMethod.id});
  console.log(fullbody);

  const response = await fetch(fetchlink, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: fullbody
  });

  const json = await response.json();

  handleServerResponse(json);
  }
}
else{
  // FOR MONTHLY DONATION SUBSCRIPTION
  console.log("Monthly Payment Subscription");
  errorElement.textContent = "We will offer monthly donations in the future. Thank you!";
  document.getElementById("card-errors").style.display = "block";
}
});


const handleServerResponse = async (response) => {
  if (response.error) {
    document.getElementById("card-errors").style.display = "block";
    console.log(response.error.message);
    errorElement.textContent = response.error.message;
  } else if (response.requires_action) {
    const { error: errorAction, paymentIntent } =
    await stripe.handleCardAction(response.payment_intent_client_secret);

    if (errorAction) {
    console.log(errorAction.message);
    document.getElementById("card-errors").style.display = "block";
    errorElement.textContent = errorAction.message;
    } else {
      console.log("Send Payment (again) Stringify to Server");

      const serverResponse = await fetch(fetchlink, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_intent_id: paymentIntent.id })
      });
      

      handleServerResponse(await serverResponse.json());
    }
  } else {
    console.log("Payment Successful");    
    window.location.replace("get-involved/thankyou.html?name=" + encodeURIComponent(cardholderName.value) + "&amount=" + totalamount + "&membership=" + membership + "&subscription=" + subscription + "&email=" + email);
  }
}
