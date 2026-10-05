const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();

// ============================================
// FUNCTION 1: CREATE CHECKOUT SESSION
// ============================================
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = context.auth.uid;
  const { tierName } = data;

  try {
    // Validate tier
    if (!['shadow', 'abyss'].includes(tierName)) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid tier');
    }

    // Get user document
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    let stripeCustomerId = userData.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebaseUID: uid,
          username: userData.username
        }
      });
      stripeCustomerId = customer.id;

      // Save customer ID to Firestore
      await admin.firestore().collection('users').doc(uid).update({
        stripeCustomerId: stripeCustomerId
      });
    }

    // Product IDs from Stripe Dashboard
    const productIds = {
      shadow: 'prod_shadow_xxxxx',    // REPLACE with your actual Stripe product ID
      abyss: 'prod_abyss_xxxxx'       // REPLACE with your actual Stripe product ID
    };

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: productIds[tierName],
            recurring: {
              interval: 'month'
            },
            unit_amount: tierName === 'shadow' ? 999 : 1699  // In cents ($9.99 or $16.99)
          },
          quantity: 1
        }
      ],
      success_url: 'nyxscream://payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'nyxscream://payment-cancelled'
    });

    console.log(`Checkout session created: ${session.id} for user ${uid}`);

    return {
      checkoutUrl: session.url,
      sessionId: session.id
    };
  } catch (error) {
    console.error('Checkout session error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ============================================
// FUNCTION 2: STRIPE WEBHOOK
// ============================================
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

// Helper: Handle subscription created/updated
async function handleSubscriptionEvent(subscription) {
  const customerId = subscription.customer;
  const items = subscription.items.data;

  if (!items || items.length === 0) {
    console.error('No items in subscription');
    return;
  }

  // Get tier name from product
  const priceId = items[0].price.id;
  let tierName = 'shadow'; // default

  // Query Firestore to find user with this stripeCustomerId
  const usersSnapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`User not found for customer: ${customerId}`);
    return;
  }

  const userDoc = usersSnapshot.docs[0];
  const uid = userDoc.id;

  // Determine tier from price
  if (priceId.includes('abyss')) {
    tierName = 'abyss';
  } else {
    tierName = 'shadow';
  }

  // Update Firestore subscription
  const now = admin.firestore.Timestamp.now();
  const currentPeriodEnd = admin.firestore.Timestamp.fromDate(
    new Date(subscription.current_period_end * 1000)
  );
  const currentPeriodStart = admin.firestore.Timestamp.fromDate(
    new Date(subscription.current_period_start * 1000)
  );

  await admin.firestore().collection('users').doc(uid).update({
    subscription: {
      tier: tierName,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: currentPeriodStart,
      currentPeriodEnd: currentPeriodEnd
    },
    lastPaymentDate: now,
    updatedAt: now
  });

  console.log(`Subscription updated for user ${uid}: ${tierName} (${subscription.status})`);
}

// Helper: Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;

  // Find user
  const usersSnapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`User not found for customer: ${customerId}`);
    return;
  }

  const uid = usersSnapshot.docs[0].id;

  // Update subscription status
  await admin.firestore().collection('users').doc(uid).update({
    subscription: {
      tier: 'void',
      status: 'cancelled',
      stripeSubscriptionId: subscription.id
    },
    cancelledAt: admin.firestore.Timestamp.now()
  });

  console.log(`Subscription cancelled for user ${uid}`);
}

// Helper: Handle payment succeeded
async function handlePaymentSucceeded(invoice) {
  const customerId = invoice.customer;

  const usersSnapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.log(`User not found for payment: ${customerId}`);
    return;
  }

  const uid = usersSnapshot.docs[0].id;

  // Log payment
  const paymentRecord = {
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    date: admin.firestore.Timestamp.fromDate(new Date(invoice.created * 1000)),
    invoiceId: invoice.id,
    status: 'succeeded'
  };

  await admin
    .firestore()
    .collection('users')
    .doc(uid)
    .update({
      lastPaymentDate: admin.firestore.Timestamp.now(),
      paymentHistory: admin.firestore.FieldValue.arrayUnion(paymentRecord)
    });

  console.log(`Payment succeeded for user ${uid}: $${paymentRecord.amount}`);
}

// Helper: Handle payment failed
async function handlePaymentFailed(invoice) {
  const customerId = invoice.customer;

  const usersSnapshot = await admin
    .firestore()
    .collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.log(`User not found for failed payment: ${customerId}`);
    return;
  }

  const uid = usersSnapshot.docs[0].id;

  // Update subscription status to past_due
  await admin
    .firestore()
    .collection('users')
    .doc(uid)
    .update({
      'subscription.status': 'past_due',
      lastFailedPaymentDate: admin.firestore.Timestamp.now()
    });

  console.log(`Payment failed for user ${uid}`);
}

// ============================================
// FUNCTION 3: CANCEL SUBSCRIPTION
// ============================================
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const uid = context.auth.uid;

  try {
    // Get user document
    const userDoc = await admin.firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }

    const userData = userDoc.data();
    const stripeSubscriptionId = userData.subscription?.stripeSubscriptionId;

    if (!stripeSubscriptionId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'No active subscription found'
      );
    }

    // Cancel subscription at Stripe
    const cancelledSubscription = await stripe.subscriptions.del(
      stripeSubscriptionId
    );

    // Update Firestore
    await admin.firestore().collection('users').doc(uid).update({
      'subscription.status': 'cancelled',
      cancelledAt: admin.firestore.Timestamp.now()
    });

    console.log(`Subscription cancelled for user ${uid}`);

    return {
      success: true,
      message: 'Subscription cancelled successfully',
      subscriptionId: stripeSubscriptionId
    };
  } catch (error) {
    console.error('Cancellation error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});