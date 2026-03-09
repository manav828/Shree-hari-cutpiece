const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
});

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log('Fixing products is_featured...');
    const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .update({ is_featured: true })
        .neq('id', '00000000-0000-0000-0000-000000000000') // fake constraint to update all
        .select('id, name');
    console.log('Updated products count:', prodData?.length || 0, prodErr || 'Success');

    console.log('Fetching images...');
    const { data: imgData, error: imgErr } = await supabase.from('variant_images').select('id, image_url');
    if (imgErr) console.error(imgErr);

    const workingImages = [
        'https://images.unsplash.com/photo-1620799140408-ed26a9f14f52', // Fabric texture
        'https://images.unsplash.com/photo-1605000797499-95a51c5269ae', // Fabric
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809', // Silk 
        'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5', // Fabric rolls
    ];

    let count = 0;
    for (let img of imgData || []) {
        if (img.image_url.includes('unsplash.com')) {
            // Check if it has a dead UUID inside or anything. Just update all unsplash images to be safe.
            let p = workingImages[count % workingImages.length] + '?w=600&q=80';
            await supabase.from('variant_images').update({ image_url: p }).eq('id', img.id);
            count++;
        }
    }
    console.log('Updated images:', count);
}

fix();
