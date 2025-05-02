const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  try {
    const { action, userId, status } = JSON.parse(event.body);

    if (action === 'get') {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    } else if (action === 'update' && userId && status) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;
      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Subscription ${status} successfully` })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid action or missing parameters' })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};