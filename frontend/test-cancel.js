import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setCompleted() {
    console.log("Fetching a confirmed or pending booking...");
    try {
        const { data: booking, error } = await supabase
            .from("bookings")
            .select("id")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.log("Error inside select:", error);
            return;
        }

        console.log("Found booking:", booking.id, "- marking as completed");

        const { data: updated, error: updateError } = await supabase
            .from("bookings")
            .update({ status: "completed" })
            .eq("id", booking.id)
            .select();

        if (updateError) {
            console.log("Error updating:", updateError);
        } else {
            console.log("Successfully marked as completed!", updated);
        }

    } catch (err) {
        console.log("Caught error:", err);
    }
}

setCompleted();
