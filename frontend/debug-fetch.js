
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for testing since I can't easily load .env.local in a simple script without dotenv package if strictly not available, 
// but asking user to run it is better.
// Actually I will read the file manually or just use the values I see in the previous step if visible.
// But I don't see them yet. I will rely on the user having them or try to read them.
// Wait, I can read .env.local first.

const supabaseUrl = "https://ouyshfzqmkdykgnkltbj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eXNoZnpxbWtkeWtnbmtsdGJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NjIzNDgsImV4cCI6MjA4NDUzODM0OH0.tR4fRJtpMz-lp1vGTQmjTKEPNClcYshDxid1Yfn10UY";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials. Please run with NEXT_PUBLIC_SUPABASE_URL=... node debug-fetch.js");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log("Testing fetch from 'services' with profiles!inner...");
    const { data, error } = await supabase
        .from('services')
        .select(`
            id,
            title,
            provider_id,
            profiles!inner (
                status,
                full_name
            )
        `)

    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log(`Success! Fetched ${data.length} services with profiles.`);
        data.forEach(s => {
            console.log(`- Service: ${s.title}`);
            console.log(`  Provider Name: ${s.profiles?.full_name}`);
            console.log(`  Provider Status: ${s.profiles?.status}`);
        });
    }
}

testFetch();
