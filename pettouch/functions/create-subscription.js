const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  try {
    const { plan, userId } = JSON.parse(event.body);

    if (!plan || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing plan or userId' })
      };
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending' // Pending until admin verifies payment
      });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscription request submitted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};