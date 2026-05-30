import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error(".env.local file not found.");
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.trim().match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

const categoriesToSeed = [
  {
    name: "Textiles",
    slug: "textiles",
    description: "Hand-woven layers and natural linens.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL8VZ8oIMfm_4FcKCpgeyhkM6iZ4--UJOonP0t22Khmj8vtEVNACVdwQN_bVoP7AjWl4Lg7pV7Xm2-txauTE9wIhH50lCEIVPZvScNeYG0heC3NHO8--7rn12O8cATkvmlsfAxxt_jR2Rqi8GdQdUNRwR2931gKKz00BdR0mZ_qpkJbddCS_BBaQ6zaFu7RePUS9co1mLCoudOxoUGQbZhQr_cEXzbUMiP9Doe5DdZxGVNs6gqERlpxbB4qTKYO8pbWWqlqwxBOis",
    filter_layout: "sidebar"
  },
  {
    name: "Ceramics",
    slug: "ceramics",
    description: "Earth-fired pottery and table forms.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLLCC3vYv9B1aoLSfPhHU6_wr3GRPvLNo_tyBS5L8xIXKRyVGUVeWW4quhGqd9UgGCtkD63nZWX5fK7cZksw5fd8VAI2IQ00tdRXSAHGjj1RhVzZ1bMgqjHruPiYGPKt-EmBvhGT6XCavt69H0afNXXZajZjPvnrkiKSqGKREtaLaEa_LZWzVlB-wWeAIaGhudrZq-nTtnuvEkugbp2T8K79IvW-5xYmXKbQOb57A46wtyQcgRC2xqP-ioj_tRhZHZBhsSC-t5Zfw",
    filter_layout: "top"
  },
  {
    name: "Living",
    slug: "living",
    description: "Soft forms for intentional spaces.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjBr8G9Yit57JiHVHCxBvGFgOG67Hn2Em-b3mraJR-jwiQa3rYOBL92tFuZ29o-UKXyusW6QrfujdZz1dRTCEdRjYYOxO4dpDNdkRw6GzO_gfPfilgnU0WwzsDgfyhTZ1IKKzXK-qMAJLw695wvuGN12gjf8EHRw-saHtcqYGZ3dFunH9ysLrLNI0KpFLIJGSl0uBVPv3dAheR_YLZhouEEf-NSb3HnV3mEEqRqyTg_qi7IL64mVQslyyiWCbLtjuDxSFU3mR4CXY",
    filter_layout: "top"
  },
  {
    name: "Kitchen",
    slug: "kitchen",
    description: "Functional craft for daily rituals.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLnB-vzpjJdhX39TNk_BZSxJrxVjhoUhJHk2XKE0XyLawhiYQcS8_i9S3Z-Xr-St9bICk30COJzsq-ATUyewElyNo_Mxo2S3ttQrWsRe0dk-n68-088InBe9Ppo-uJ0jpVyEN07PcGGlSpkhzoV0n1uk0OGZWqJkAOI92wbs9IAYx8agXNHTNpz7M5qZK_A6LPABnFhGD0QAKF8ByfBwCF2R8Bzrfbr8ayCM5jYjihaoPchxu4VA9rrgJRbbYtPhy9JMk4AZgOy28",
    filter_layout: "sidebar"
  },
  {
    name: "Rugs",
    slug: "rugs",
    description: "Woven anchors for cozy rooms.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNwv_YRuzDgBYftHCyIG8sj8TXxECng4ufKiK6qYUcRvOvJXcqQXXKI9DoMVa-rPdXwmmxTe0h4DfElMvJAhtm7Rc22skgwe28yq6NaADKzoD0B3GTA0PEkyrwyoIrvtsg4vQhqdxrGxIa5a6cc0t8vAj7S57xPwn7bOydmNyBj5CvP793BkY_IUrTz2_6pUkfqMQxiiSbF211qW0GF4SfktMK_7tgy62PTyn4hLnVUOI96g2NvRG23Irueqv6v8K1a-52M-k1Ii8",
    filter_layout: "sidebar"
  },
  {
    name: "Decor",
    slug: "decor",
    description: "Small accents with quiet character.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUHosQ2mk2S5Xr_dTCorKhsbLM3rAIGGhE_Xh_p3oHu0isbmEhWWQ95nSG8npExRN7EKw_pQLYdrrPmKgWJENSlaKTWyrDFPmBsfphbJt5VDuYf98aezQ4fqcg7PcfdMCBGS4AjT-Ged74xyT51gqMx8y2xOBP-FWf4AdJxdx5M_JprG2JYAY_Hyr26-9F1lbfxCs44D1y8d-MJu-tsDKqh2cRkb6CLfzXh0LIFVVkmUwSGDjmyNTUvchJCdJ_5TyuvmNHZv8TQZk",
    filter_layout: "top"
  },
  {
    name: "Furniture",
    slug: "furniture",
    description: "Natural forms in wood and fiber.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDenhfvTY2v8l0yTaL3DrhTv2EUR7cwm6_VFo68qC4nZoacoWTpxet3fROwWcTQOerR0C0-TnqkQa8Vg0mth1HQeF_b_qduB1FJzKuNGUmEi7J0LNb1NfE2517qbQ1ZbCQXUdmrj6pElD_cF3UWqLOV50lb7bPLwJ2-HLcLJxaBCz59lmn6IJuJSRLkRDA0lBUSTUkxccQWwqbM0jnsMzmzWDyWncRlDPZkNRxJU__PD7ojwwmKlMcFfyOUD3andsJmf-F0mXGAr7I",
    filter_layout: "sidebar"
  },
  {
    name: "Lighting",
    slug: "lighting",
    description: "Handmade luminaires and glow.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHQWXqYCTzh29hCgG-5S1b4ulV8ByYnTAl7SgsfISWyHtZCBTKLXYswnMxGHQTbSVQPAn5qTv6oL5D_opPhP-YTWDVLLmyhMJbaUS5L3uFi63B_iCb7c7bbbohlrj_AejB2uPXE6ql6ZeP7iYP6IBHMMYHQvzDdx8518EtTUVr9-bly-MNLnMrW12M6ymWsS7wpZgpcH9LAdX9QY5pF7iR81rzUTnYWUEHVDsWN_ljFKQ3G6rChla2OFNORVS_L2PGLuELyJleE-Y",
    filter_layout: "sidebar"
  },
  {
    name: "Wall Art",
    slug: "wall-art",
    description: "Textural art in warm palette.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2y8SFEHkdvduzBVAHF3-i5UyE7AUlZS6hSuHGeAWeiyPuAQxUq6O_DMkurcwuBzVSIH2nUvJo6vPgciMtbEWxMuW570sQcAxQyGjkkmqNtKazCg4_iHwJv0qIV0Rs_l_X8Vv0VQEn1KZKDczyYxvWRkrT6RlgxCo6rdZuHQ0DiBFrCBXz0FoAbe5Zm9UoaDacbbYWOerhZYkL3upCyaI9gym1fDrO0CHHGK_IxO-OqLBFVkZuVg9XJuBkeHzC4N5XNdF_uREARdc",
    filter_layout: "sidebar"
  },
  {
    name: "Bedding",
    slug: "bedding",
    description: "Soft-touch sleep layers and throws.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL8VZ8oIMfm_4FcKCpgeyhkM6iZ4--UJOonP0t22Khmj8vtEVNACVdwQN_bVoP7AjWl4Lg7pV7Xm2-txauTE9wIhH50lCEIVPZvScNeYG0heC3NHO8--7rn12O8cATkvmlsfAxxt_jR2Rqi8GdQdUNRwR2931gKKz00BdR0mZ_qpkJbddCS_BBaQ6zaFu7RePUS9co1mLCoudOxoUGQbZhQr_cEXzbUMiP9Doe5DdZxGVNs6gqERlpxbB4qTKYO8pbWWqlqwxBOis",
    filter_layout: "sidebar"
  },
  {
    name: "Dining",
    slug: "dining",
    description: "Earthy table styling essentials.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLLCC3vYv9B1aoLSfPhHU6_wr3GRPvLNo_tyBS5L8xIXKRyVGUVeWW4quhGqd9UgGCtkD63nZWX5fK7cZksw5fd8VAI2IQ00tdRXSAHGjj1RhVzZ1bMgqjHruPiYGPKt-EmBvhGT6XCavt69H0afNXXZajZjPvnrkiKSqGKREtaLaEa_LZWzVlB-wWeAIaGhudrZq-nTtnuvEkugbp2T8K79IvW-5xYmXKbQOb57A46wtyQcgRC2xqP-ioj_tRhZHZBhsSC-t5Zfw",
    filter_layout: "sidebar"
  },
  {
    name: "Planters",
    slug: "planters",
    description: "Clay homes for indoor greens.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUHosQ2mk2S5Xr_dTCorKhsbLM3rAIGGhE_Xh_p3oHu0isbmEhWWQ95nSG8npExRN7EKw_pQLYdrrPmKgWJENSlaKTWyrDFPmBsfphbJt5VDuYf98aezQ4fqcg7PcfdMCBGS4AjT-Ged74xyT51gqMx8y2xOBP-FWf4AdJxdx5M_JprG2JYAY_Hyr26-9F1lbfxCs44D1y8d-MJu-tsDKqh2cRkb6CLfzXh0LIFVVkmUwSGDjmyNTUvchJCdJ_5TyuvmNHZv8TQZk",
    filter_layout: "sidebar"
  },
  {
    name: "Storage",
    slug: "storage",
    description: "Beautiful baskets and utility forms.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNwv_YRuzDgBYftHCyIG8sj8TXxECng4ufKiK6qYUcRvOvJXcqQXXKI9DoMVa-rPdXwmmxTe0h4DfElMvJAhtm7Rc22skgwe28yq6NaADKzoD0B3GTA0PEkyrwyoIrvtsg4vQhqdxrGxIa5a6cc0t8vAj7S57xPwn7bOydmNyBj5CvP793BkY_IUrTz2_6pUkfqMQxiiSbF211qW0GF4SfktMK_7tgy62PTyn4hLnVUOI96g2NvRG23Irueqv6v8K1a-52M-k1Ii8",
    filter_layout: "sidebar"
  },
  {
    name: "Mirrors",
    slug: "mirrors",
    description: "Organic shapes with soft reflection.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDenhfvTY2v8l0yTaL3DrhTv2EUR7cwm6_VFo68qC4nZoacoWTpxet3fROwWcTQOerR0C0-TnqkQa8Vg0mth1HQeF_b_qduB1FJzKuNGUmEi7J0LNb1NfE2517qbQ1ZbCQXUdmrj6pElD_cF3UWqLOV50lb7bPLwJ2-HLcLJxaBCz59lmn6IJuJSRLkRDA0lBUSTUkxccQWwqbM0jnsMzmzWDyWncRlDPZkNRxJU__PD7ojwwmKlMcFfyOUD3andsJmf-F0mXGAr7I",
    filter_layout: "sidebar"
  }
];

const productsToSeed = [
  // textiles products
  {
    name: "The Solstice Throw",
    slug: "solstice-throw",
    category_slug: "textiles",
    short_description: "Soft tassel throw in warm neutral tones.",
    price: 185,
    material: "Sustainable Linen",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV94lDjRNBvql1-sAuBHx3RcKcyzhXAvWpXD0-J5ZoGJnPqCQMHn8sI62il0QbNyOUir-urdoglPzkT9hegl0DWnSOV7PCGVF4YNLEGpXm-mTU0dJIwUT-dYa6CPz-Gtv-DO0N2M6wD_ii6eMV8STRGv6SoihShyA2MSGJnKynzpoOVZBPPpAg0PvQ9SONySxB0iI3UXupnqxM7XWj-Gm7UOjaHVz7mpU9HEv_ne-A8zK83r-g73cabXxwPN7-iu6B2_TR2SRfAHQ",
    is_new_arrival: false,
    is_featured: true
  },
  {
    name: "Earthen Napkin Set",
    slug: "earthen-napkin-set",
    category_slug: "textiles",
    short_description: "Everyday napkins with a grounded terracotta tone.",
    price: 45,
    material: "Organic Cotton",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAP0B3_NaVEA3SBcsvM7s1GbJMidZaWbvid3y3TlpFZ-qiwEb1hsGY5LDSAE83C_Wf-4p56G1wk9vNuDGNumfQiseGwPiZg8qLNfd-ACVGiedHsxeMdVKZQezvEeENP8GYj4FkthP-xZgDrYFCgpxCo8TqQ_OlFeZFESd04wmqO1Oc98vHyyUPgNky9FjM-qjFBXeuUs1PKgpW8pglgLrfY56kDUvu1CH3WeJm56fWy8bj4okb7tOjbhsI_4Yq85rXs5e06ZjPV1w0",
    is_new_arrival: false,
    is_featured: true
  },
  {
    name: "Nomad Wall Tapestry",
    slug: "nomad-wall-tapestry",
    category_slug: "textiles",
    short_description: "Textured wall art with earthy geometric rhythm.",
    price: 320,
    material: "Jute and Wool",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJleu9GsGVN9amQqXU7dDZIylqOQeLk7Q1j9re1k42XoeXEBgtj015FU9pyvrPYMwgsmszqpxlGbT5ZeKAqFdsMkx7TRimUU9c0jrdCGcL7LOsTqI1DKBXURruURy1LSObUV50PMJGPaSM2HbQaqfQ4fxRhr13aVx5GPqvAcJNu56RmvErtSCWwvtt5-oYV_Xt0ZKjVoPv9Mk_KJ6WyrTA6hXIwiTQmXF4IJcRXAjVzVe5lnMeBMOBmWaJ1oU28gSiL7HifdmzVFQ",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Sage Waffle Cushion",
    slug: "sage-waffle-cushion",
    category_slug: "textiles",
    short_description: "Muted texture designed for layered seating.",
    price: 65,
    material: "Belgian Linen",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOhv7gSiZnLqZ2iPGsN6JvN6JjhaXmW0q5XufQSZMpQXjRCSUmUI0gWMNwUi_RlwutY0j4KEFBhFxc0yAAUhVEu6Zmu_qcDU3ybkE4iWCnauSgp8N7cgv2JUY2jo_KMUuvvzNJqtc1aO-uwm0jaHnz9Jlncxo2VqYrMlQXSZFN9bPzUhXcwYBa07xHvwy0W7l3yxtoG4xk8LzfA4-64mQbIgwzYr6euPeyC0UbrX_NT1MlH24yUAxsTG5BnjiII3t2qVL40MmkujQ",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Amber Bed Runner",
    slug: "amber-bed-runner",
    category_slug: "textiles",
    short_description: "Warm hand-woven accent for layered bedding.",
    price: 145,
    material: "Recycled Wool",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIiNfJseCHzvelERnUORKQSU_famV441nW951xqtd2c4h8eO2NPy2cNXr0jKEnV5VenmZYJo_4-mmec-aVyKWJgVnqJNznnKgm10KD5ApT-nZCK_JM95YBrLrfgbp9q7DQvDOG-bdXPCudVABi99sh0X9Cgu2_499op6Ik0hMyAAgyICgZJJY9ehl5QC1eRVnIGO4xVHy1bpoapT4Wqyk7ONIQfW_5whcnkSXedv3LoA5lKalIB4aDlYbc4VeYTw07MCBaWyPUTBs",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Tectonic Table Runner",
    slug: "tectonic-table-runner",
    category_slug: "textiles",
    short_description: "Structured lines for a slow dining ritual.",
    price: 88,
    material: "Sustainable Cotton",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBotdZHkARTAKMSfeysghfXkjGuHkp-rEbysTytjTN9mpjIhQZTSPAO22iAmBI3P40dagxgO2-nEdKmpKtgOY881OLdfkXBZbeYqJ6VfwV8G3tRC_Oa3B2YuTQTLuWAzRGtYsWQmjsgB7K0r0aaPRpV7CiRJwOLPXWl7fBRz6Y09TqQntRRDYX7xpOerW5IROyepoGQAFFmmUOEEPL610fB0imqgWxrzyhQciAwOGyUwa5bClWItwc0IfUr2cxEnXeQ6W6rxWqUDpE",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "The Atlas Throw",
    slug: "atlas-throw",
    category_slug: "textiles",
    short_description: "Hand-spun organic wool.",
    price: 280,
    material: "Organic Wool",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK2qxA80Rfeq7_Fqd64_cu1UI35d76lF7VjSRsx3sOh5_lx01mAuCqmGVpssqErGczwHoulg9MWKxVEYN6Oyr01c0s1zVqD7oFyossFkVnMEowLXCvqWGyX1zpnBQ-91qLurG_N4RvoGNGBinuMBeYq2lyATaH_RqlE3uhz56p0hc4fHtDuk4A3iu1vfZl9qz6fdSCNZui2fIpjjjWOVemaCKk5a_UuebtnloBXyGrvs8DhjsPYRz0UcCfgmxoKrHgugXslS1kkQI",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Dusk Indigo Cushion",
    slug: "dusk-indigo-cushion",
    category_slug: "textiles",
    short_description: "Hand-dyed botanical pigments.",
    price: 125,
    material: "Natural Pigment",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuACH8SLNGkokfUscn8-LdexJRNMu3-QwypkSGHrjty_5V6ssVD1HzJ-sMHlJI2Ge2aXZZF2CpLZH3JliX2e4yz0J_QCOC3HUttMpRBtKrr-9aO6dXrMs3j1PVVoQhjW3KXNqULBC9B98jMJYGIos8kI09G2N1vWrBwCCCtXl6c1sTSecw2bJDF1UQARqlL9BNNfsGtHbTlHZCzYD1-01G6KD4v-L3_oMIVxYjWGm3BwFs4rOon8G9fSt87SKsWKvJ3RNMt08zYXtkg",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Oaxaca Runner",
    slug: "oaxaca-runner",
    category_slug: "textiles",
    short_description: "Flat-weave traditional wool.",
    price: 340,
    material: "Wool",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiLnfiiHeE2wseuPkFD8Qw6uW9Mim2-qfdsKgmx9IGVPyTQksxYBp7JYkZwJxxJamPYlaFp4S_6wTY5eF540pVQq9P4BD4BYGlj0mAQsHMhhLwzgjuvrIs_shsBLEwM3DiDtz6a_ThyNmHyIUv6eLUKX8I1XjTSV-ECpJbBXXZctSym71arprkZs8j1Il3L2ovR3CIZXL6_9H4xMnFiLbBEGbHivfR9QWNr_-M0NQX0c7uSe6GxIuv0kq1PM4kK27UM20ZFBmdxFg",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Muted Sage Blanket",
    slug: "muted-sage-blanket",
    category_slug: "textiles",
    short_description: "Recycled cotton and silk blend.",
    price: 195,
    material: "Cotton Blend",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdCNRYzVY13jeNGRR40C_S9IKJoKnq9JdSocRxDVBfKyVzLKn2iVlO3eSaybN5nXWJYAZMW2Wi9uIkxMvrDIfma4daKjL-0FPRT8zHgmhdxvCsaHX3jazBNM-MWcybXpPdxPxW0YemZ8Kvr36f-pXE57D7NB1VXME7P1HbFdge1TVa6dR_MPj1nm3Ro1kctSqR3HlT6q5bnR7ZBXNFwjzv9vH4s9gYavAtFt07F8TOmVw3lrqfqPKJFleRUwfoym4Nz-c4WpymoqY",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Earth Tier Cushion Set",
    slug: "earth-tier-cushion-set",
    category_slug: "textiles",
    short_description: "Stonewashed heavy linen.",
    price: 110,
    material: "Linen",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2nVKc4iUa4W_1V_M20vN3w-y-HdSBPyLg7OdWVHud8gCVyXvPnaD5H_XkwRCNWPeMnQuJKLRXpsL3g1Z38QwdpSmB0abhzL6umvwvpSQSQxNQAFJkI_Qqr0tL126mwXITX52BaCs4bveU9EqgSJGonV66KOFHYyogSi3A45bLe_3bvw_KfHPx6c3Gjmd4mRlWhXvTJEs1QIqm_VbCXKG0HqDt1pbafFAoOp0sbW2e3kiAn9ZfX5YlRX8hg6EbS850BXZyiO_iqWc",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "Horizon Tapestry",
    slug: "horizon-tapestry",
    category_slug: "textiles",
    short_description: "Hand-knotted jute and hemp.",
    price: 420,
    material: "Jute and Hemp",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlxkDnR5Ct-eabsDqb2ec86WHeys-jdLJ96MYEkrwWJfdaVC-gsNL5vYX5baBzQkozgRCKCmcDdejzzZavlvV9fIgSSjM9XLn2DL7XAHsbaiIwBtga0qaCEZtzFvUlyJoi5imWnvNWNGZa4pK4jGerGuimUeqhj8wxf6Ipw1u503PGhklz0xXEeVJhuti5XRVLyEPXhIWRaXsM7JtNWNughcdu5UzbYcl2MQBDhBEz99BU8DgZiaVcVrkA0KWh_Zs0QRV3vG9tnCQ",
    is_new_arrival: false,
    is_featured: false
  },
  {
    name: "The Saharan Drift Throw",
    slug: "saharan-drift-throw",
    category_slug: "textiles",
    short_description: "Each Saharan Drift throw is hand-woven by a collective of women in the Atlas Mountains, using wool naturally dyed with indigo and pomegranate skins.",
    price: 245,
    material: "Natural Indigo Dyed Wool",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdYMMrk_iP8YI9r1TcSRJChlJxrF5_rPlKZEDvnGgqJkL-Jll4RGcXwnKg8e0ykkeSKBg9a3Ie1LRnwnVoZ1-ecU3WcyO3gh5aBxN7Mn7e0DwIPSGuNkOij5DAvUNYncfMFCcqFr_rPV7MwRFHfJjocOv3n1XZ1qqgTlpuXA1SOiVZ866hFFLg62dcIOV8N0N4j_Nu5kKT8Wx0s8WINMpKrTpukDykyMcEhR7ugo6gTN6Hucq5sV83CZYbI-avqR7vUgCSupzP974",
    is_new_arrival: false,
    is_featured: true
  },
  // ceramics
  {
    name: "Arid Clay Vase",
    slug: "arid-clay-vase",
    category_slug: "ceramics",
    short_description: "Tall minimalist clay vase with a rough, sandy texture and single dried flower stem.",
    price: 88,
    material: "Clay",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE7n-xjJ0KT5jhua9ISVzx6avgS6zJZ8CDTg2pFMpJIdmgOSY_dg5yv5YRxLZH6VrrZEQSAqXGuGGtnB7YcR7sEuBpTirTSK3sEr5ffAHL3tHeuAq4hqEAdVqqanDdb2EX7eJ0eGFkY-ePkUpytWnNu9L2OafVY5ZtOLaxTH5tEB8D7-F1cQWXeJ8wQVbs9_hWazqFhbZl4FmJGuAiKAZSPkOPaji5ySu7cWvo9U6Td_v-l2lyV9TfMtcBt1ezznW-CRZ45IFxjNg",
    is_new_arrival: true,
    is_featured: true,
    discount_label: "Limited"
  },
  // decor
  {
    name: "Dusk Glow Candle",
    slug: "dusk-glow-candle",
    category_slug: "decor",
    short_description: "Handcrafted beeswax candles in textured amber glass jars on a rustic wooden tray.",
    price: 34,
    material: "Beeswax",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAU6KYGk0mGhSIzp9AieDxEfKb2FJ6hB3iRKg6JaQBIyzLcbLzxU5rvfucrdz4a8lJTVs6wmenbFDWGGYnKmF6ljlfxIOXBNMZMToAhDfnq_4gCoMgpXR1RhlsqLNIRGvyQN3sXjRVFpOXkbPM2136JjOq4KFboKkptV7J4FlJ4Im12xpSheKhFnLhutXGQLrOgANgAGh9zeAiRe5X1iq4Ga9nXxpwjhTE8t8B8XP9pOx2XfZePDLGm50Dfqss-7rO6dfAlzna9ZsE",
    is_new_arrival: true,
    is_featured: false
  },
  // storage
  {
    name: "Seagrass Coven Basket",
    slug: "seagrass-coven-basket",
    category_slug: "storage",
    short_description: "Natural woven seagrass storage baskets in various sizes with leather handles.",
    price: 110,
    material: "Seagrass",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAJPLjNZbaft28_YyZeWuIGgjNADIWXncBGWppgDIPNRXW-707oz_4v_5NfPcUl2uArriTUeJjVOoGNGQMyTQHRz4NylAF9smjBSpo-JipydMxgmC31CiQkC4dKwHaze2cb69iJfZE4EvYHtM_5TlUNMvytgM-zvcnW2HtqH0Ztg0ZWMUoZ3OH1TSs6g7YvEuks2dlX39CkOqQNey3zu9EDJpyaYKSI0ZfarsCxk3N7swPFRD_Jk72B7BruwQBXqrWsYUoUUMU76A",
    is_new_arrival: true,
    is_featured: false
  },
  // wall art
  {
    name: "Plaster Muse Wall Sculpture",
    slug: "plaster-muse-wall-sculpture",
    category_slug: "wall-art",
    short_description: "Minimalist abstract face wall sculpture made of white plaster on a warm beige wall.",
    price: 165,
    material: "Plaster",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5qKUxT83TaJjeQ3_CwnPtkpdP9JrviycoOt7JxZjzXKeSuZSB6xusNIl2sojEo_yROXyk6Qmy642M7uGH-CqSV-OaL4qJLPxCiXuL1xPpHNDPy5zOH8tdNdKIaGice7zbwIY1Rv3wwXrsDQfG4OZi2u544qO0Gs7NTUFUVN9N1UQHOlmSCvzt2ROPBZ9-JE-pfipLhKWVI6ZuTT1JNDZCiQmN_QV6b2S7OfHwIyYYcSdaMJHemMxbn-Xc18Zv7t24yCwkHQblUhQ",
    is_new_arrival: true,
    is_featured: false
  }
];

// Helper to download image and upload to Supabase storage
async function downloadAndUploadImage(url, bucketName, filePath) {
  try {
    console.log(`Downloading ${url}...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Uploading to bucket '${bucketName}' path '${filePath}'...`);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        upsert: true,
        contentType: response.headers.get('content-type') || 'image/jpeg'
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log(`Public URL: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error(`Failed to transfer image ${url}:`, err.message);
    return url; // fallback to original url if download/upload fails
  }
}

async function seed() {
  console.log("Starting Bohemian DB seed...");

  // 1. Seed Categories
  const categoryIdMap = {};
  for (let cat of categoriesToSeed) {
    console.log(`Seeding category: ${cat.name}`);
    
    // Check if category exists
    const { data: existingCat, error: getCatError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCatError) {
      console.error(getCatError);
      continue;
    }

    let finalImageUrl = cat.image;
    // Upload image to cms-assets
    if (cat.image && cat.image.startsWith('http')) {
      const ext = cat.image.split('?')[0].split('.').pop() || 'jpg';
      const safeExt = ext.length > 4 ? 'jpg' : ext;
      const storagePath = `categories/${cat.slug}.${safeExt}`;
      finalImageUrl = await downloadAndUploadImage(cat.image, 'cms-assets', storagePath);
    }

    let catId;
    if (existingCat) {
      catId = existingCat.id;
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: cat.name,
          description: cat.description,
          image: finalImageUrl,
          image_url: finalImageUrl,
          filter_layout: cat.filter_layout,
          is_active: true
        })
        .eq('id', catId);
      if (updateError) console.error("Update category error:", updateError);
    } else {
      const { data: newCat, error: insertError } = await supabase
        .from('categories')
        .insert({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: finalImageUrl,
          image_url: finalImageUrl,
          filter_layout: cat.filter_layout,
          is_active: true
        })
        .select('id')
        .single();
      
      if (insertError) {
        console.error("Insert category error:", insertError);
        continue;
      }
      catId = newCat.id;
    }
    categoryIdMap[cat.slug] = catId;
  }

  // 2. Seed Products
  for (let prod of productsToSeed) {
    console.log(`Seeding product: ${prod.name}`);
    const catId = categoryIdMap[prod.category_slug];
    if (!catId) {
      console.error(`Category ${prod.category_slug} not found in seeded list. Skipping product.`);
      continue;
    }

    // Check if product exists
    const { data: existingProd, error: getProdError } = await supabase
      .from('products')
      .select('id')
      .eq('slug', prod.slug)
      .maybeSingle();

    if (getProdError) {
      console.error(getProdError);
      continue;
    }

    let prodId;
    if (existingProd) {
      prodId = existingProd.id;
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: prod.name,
          category_id: catId,
          short_description: prod.short_description,
          is_featured: prod.is_featured,
          is_new_arrival: prod.is_new_arrival,
          is_active: true,
          discount_label: prod.discount_label || ""
        })
        .eq('id', prodId);
      
      if (updateError) {
        console.error("Update product error:", updateError);
        continue;
      }
    } else {
      const { data: newProd, error: insertError } = await supabase
        .from('products')
        .insert({
          name: prod.name,
          slug: prod.slug,
          category_id: catId,
          short_description: prod.short_description,
          is_featured: prod.is_featured,
          is_new_arrival: prod.is_new_arrival,
          is_active: true,
          discount_label: prod.discount_label || ""
        })
        .select('id')
        .single();

      if (insertError) {
        console.error("Insert product error:", insertError);
        continue;
      }
      prodId = newProd.id;
    }

    // Seed/Update Variant
    const { data: existingVariant, error: getVariantError } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', prodId)
      .eq('color_name', 'Default')
      .maybeSingle();

    if (getVariantError) {
      console.error(getVariantError);
      continue;
    }

    let variantId;
    if (existingVariant) {
      variantId = existingVariant.id;
      const { error: updateVariantError } = await supabase
        .from('product_variants')
        .update({
          price: prod.price,
          material_label: prod.material,
          stock: 100,
          is_default: true
        })
        .eq('id', variantId);
      
      if (updateVariantError) console.error("Update variant error:", updateVariantError);
    } else {
      const { data: newVariant, error: insertVariantError } = await supabase
        .from('product_variants')
        .insert({
          product_id: prodId,
          color_name: 'Default',
          color_hex: '#EBE8E3',
          material_label: prod.material,
          price: prod.price,
          stock: 100,
          is_default: true
        })
        .select('id')
        .single();

      if (insertVariantError) {
        console.error("Insert variant error:", insertVariantError);
        continue;
      }
      variantId = newVariant.id;
    }

    // Upload product image to product-images bucket
    let finalProductImageUrl = prod.image;
    if (prod.image && prod.image.startsWith('http')) {
      const ext = prod.image.split('?')[0].split('.').pop() || 'jpg';
      const safeExt = ext.length > 4 ? 'jpg' : ext;
      const storagePath = `products/${prod.slug}.${safeExt}`;
      finalProductImageUrl = await downloadAndUploadImage(prod.image, 'product-images', storagePath);
    }

    // Seed/Update Variant Image
    const { data: existingImages, error: getImgError } = await supabase
      .from('variant_images')
      .select('id')
      .eq('variant_id', variantId);

    if (getImgError) {
      console.error(getImgError);
      continue;
    }

    if (existingImages && existingImages.length > 0) {
      const { error: updateImgError } = await supabase
        .from('variant_images')
        .update({
          image_url: finalProductImageUrl,
          is_primary: true
        })
        .eq('id', existingImages[0].id);
      
      if (updateImgError) console.error("Update image error:", updateImgError);
    } else {
      const { error: insertImgError } = await supabase
        .from('variant_images')
        .insert({
          variant_id: variantId,
          image_url: finalProductImageUrl,
          is_primary: true,
          sort_order: 0
        });

      if (insertImgError) console.error("Insert image error:", insertImgError);
    }
  }

  console.log("Bohemian database seed complete!");
}

seed();
