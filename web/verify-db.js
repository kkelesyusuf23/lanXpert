require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log("Checking Supabase connection...");
    // Try to select from questions table to check existance and permissions
    const { data, error } = await supabase.from('questions').select('count', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') {
            console.error("❌ FAILED: Table 'questions' not found. It seems the SQL schema hasn't been applied yet.");
        } else {
            console.error(`❌ FAILED: Connection error: ${error.message}`);
        }
    } else {
        console.log("✅ SUCCESS: Connected to Supabase and verified 'questions' table exists.");
    }
}

testSupabase();
