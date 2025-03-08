const { createClient } = require('@supabase/supabase-js');

module.exports.supabase = createClient(
  process.env.FILES_DB_URL,
  process.env.FILES_DB_API_KEY
);
