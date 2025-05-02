const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  try {
    const { nfcId, details, location } = JSON.parse(event.body);

    if (!nfcId || !location) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing nfcId or location' })
      };
    }

    const { error } = await supabase
      .from('reports')
      .insert([{ nfc_id: nfcId, details, location }]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Report submitted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};