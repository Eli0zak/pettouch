const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event, context) => {
  const { userId, plan, startDate, endDate } = JSON.parse(event.body);

  if (!userId || !plan || !startDate || !endDate) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required parameters' }) };
  }

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        { user_id: userId, plan, start_date: startDate, end_date: endDate, status: 'active' },
      ]);

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Subscription created successfully' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};