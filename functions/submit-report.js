const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async (event, context) => {
  const { nfc_id, details, location, reporter_phone, found_photo, found_details, found_location } = JSON.parse(event.body);

  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([
        { nfc_id, details, location, reporter_phone, found_photo, found_details, found_location },
      ]);

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Report submitted successfully' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};