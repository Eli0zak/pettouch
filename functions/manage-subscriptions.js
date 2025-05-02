const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event, context) => {
  const { action, userId, plan, status } = JSON.parse(event.body);

  try {
    if (action === 'get') {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*');

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify(data) };
    } else if (action === 'update' && userId && status) {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('user_id', userId);

      if (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
      }

      return { statusCode: 200, body: JSON.stringify({ message: `Subscription status updated to ${status} for user ${userId}` }) };
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action or missing parameters' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};