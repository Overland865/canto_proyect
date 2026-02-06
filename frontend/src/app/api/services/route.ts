
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Check Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized', message: 'Debes iniciar sesión para publicar un servicio.' }, { status: 401 });
        }

        // 2. Validate Provider Role (Optional but recommended)
        // For now, we assume any logged in user can try (RLS will handle ultimate security, but good to check here)

        // 3. Parse Body
        const body = await request.json();
        const { title, description, category, price, location, image, gallery } = body;

        // 4. Validate Required Fields
        if (!title || !price || !category) {
            return NextResponse.json({ error: 'Missing fields', message: 'Título, precio y categoría son obligatorios.' }, { status: 400 });
        }

        // 5. Insert into Database
        // Note: 'image' is expected to be the main image string.
        const { data, error } = await supabase
            .from('services')
            .insert({
                provider_id: user.id,
                title,
                description,
                category,
                price,
                location,
                image: image || (gallery && gallery.length > 0 ? gallery[0] : null), // Use first gallery image if main image missing
                // Add other fields if necessary and available in schema
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Insert Error:', error);
            return NextResponse.json({ error: error.code, message: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Simple fetch of all services
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.code, message: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
