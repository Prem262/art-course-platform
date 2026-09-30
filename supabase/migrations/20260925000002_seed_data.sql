-- ==============================================================================
-- ART COURSE PLATFORM — SEED DATA MIGRATION
-- Migration: 20260925000002_seed_data.sql
-- ==============================================================================

-- 1. INSERT 4 PRIMARY ART CLASSES
INSERT INTO public.classes (id, title, slug, description, short_description, cover_image_url, display_order, is_published)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Painting',
    'painting',
    'A gentle, immersive journey into the fluid qualities of water and pigment. Learn to mix luminous natural washes, control paper dampness, build layered depth, and translate botanical subjects with expressive confidence.',
    'Explore colour, water and expressive painting through guided practice.',
    '/images/painting.jpg',
    1,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Botanical Art',
    'botanical-art',
    'Step into the disciplined and meditative tradition of botanical illustration. Students learn accurate botanical morphology, magnifying delicate reproductive structures, and rendering leaf venation with scientific fidelity and artistic elegance.',
    'Learn to observe nature closely and translate its forms through line and colour.',
    '/images/botanical-art.jpg',
    2,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Zentangle',
    'zentangle',
    'An invitation to slow down and enter a calm, focused state through repetitive mark-making. Zentangle transforms simple pen strokes into mesmerizing intricate patterns that soothe the mind and cultivate effortless artistic flow.',
    'Discover mindful pattern-making through structured, intentional strokes.',
    '/images/zentangle.jpg',
    3,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Line Arts',
    'line-arts',
    'Master the timeless power of pure line. From delicate botanical contour studies to rich cross-hatching, stippling, and calligraphic line variations, this course cultivates patience, dexterity, and refined drafting confidence with fine ink pens.',
    'Explore intricate line work, patterns and drawing techniques through patient practice.',
    '/images/line-arts.jpg',
    4,
    true
)
ON CONFLICT (slug) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    cover_image_url = EXCLUDED.cover_image_url,
    display_order = EXCLUDED.display_order,
    is_published = EXCLUDED.is_published;

-- 2. INSERT 10 LESSONS FOR PAINTING (Class 1)
INSERT INTO public.lessons (class_id, title, description, display_order, video_id, video_provider, duration_seconds, is_published)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Introduction to Painting',
    'Welcome to the studio. We examine natural pigments, choosing cold-pressed cotton paper, and establishing a mindful painting routine.',
    1,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P01',
    'bunny',
    1100,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Understanding Colour',
    'Explore primary pigment mixing, warm and cool color balances, and creating organic botanical greens and earth pigments.',
    2,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P02',
    'bunny',
    1455,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Working with Water',
    'Master wet-on-wet flow, soft graduated washes, and dynamic edge control to let paint bloom naturally on dampened fibers.',
    3,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P03',
    'bunny',
    1930,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Brush & Stroke Practice',
    'Developing hand stillness and pressure sensitivity with round and mop brushes for tapered petals, slender stems, and delicate gestures.',
    4,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P04',
    'bunny',
    1720,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Light and Shadow',
    'Preserving untouched paper whites as your highest highlights while building transparent tonal glazes for deep dimensional shadows.',
    5,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P05',
    'bunny',
    1805,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Creating Texture',
    'Techniques for bark, veined surfaces, dry-brush scumbling, and delicate salt blooming to evoke tactile botanical realities.',
    6,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P06',
    'bunny',
    1590,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Composition',
    'Designing asymmetrical plant compositions with generous negative space, natural breathing room, and dynamic diagonal flow.',
    7,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P07',
    'bunny',
    2090,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Painting from Observation',
    'Setting up natural daylight conditions to study a fresh live cutting, recording subtle shifts in petal translucency and stem posture.',
    8,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P08',
    'bunny',
    2295,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Expressive Colour',
    'Moving beyond strict realism toward intuitive palette choices that capture mood, memory, and botanical character.',
    9,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P09',
    'bunny',
    1900,
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Final Painting',
    'Guided creation of your complete archival botanical painting from initial pencil contour to final luminous glazed details.',
    10,
    'REPLACE_WITH_BUNNY_VIDEO_ID_P10',
    'bunny',
    2700,
    true
);

-- 3. INSERT 10 LESSONS FOR BOTANICAL ART (Class 2)
INSERT INTO public.lessons (class_id, title, description, display_order, video_id, video_provider, duration_seconds, is_published)
VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Introduction to Botanical Art',
    'History and principles of botanical illustration. Understanding the dual commitment to scientific accuracy and aesthetic grace.',
    1,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B01',
    'bunny',
    1210,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Observing Nature',
    'Using loupes, calipers, and hand lenses to see micro-structures, symmetry, and geometric leaf distributions along the stem.',
    2,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B02',
    'bunny',
    1665,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Understanding Botanical Forms',
    'Simplifying complex florets, inflorescences, seed pods, and spiraling bracts into fundamental geometric masses.',
    3,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B03',
    'bunny',
    2000,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Leaves and Stems',
    'Foreshortened leaves, serrated margins, undulations, petiole joints, and vascular branching patterns.',
    4,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B04',
    'bunny',
    2175,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Drawing Flowers',
    'Constructing petals around the botanical receptacle with accurate perspective, curl, and overlapping petal folds.',
    5,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B05',
    'bunny',
    2370,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Light and Shadow in Nature',
    'Standard top-left botanical illumination convention to maximize volumetric clarity across curvilinear organic forms.',
    6,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B06',
    'bunny',
    1870,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Colour and Detail',
    'Color matching living tissue samples with miniature test strips, stippling stamens, and rendering nectar guides.',
    7,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B07',
    'bunny',
    2520,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Botanical Composition',
    'Composing full life-cycle plates showing buds, mature blooms, seed capsules, and cross-sections in balanced harmony.',
    8,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B08',
    'bunny',
    2140,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Working from Observation',
    'Managing rapid petal wilting and changes in living specimens through quick photographic records and primary notes.',
    9,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B09',
    'bunny',
    2650,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Final Botanical Study',
    'Completing a museum-grade archival botanical illustration with handwritten Latin nomenclature and scale measurements.',
    10,
    'REPLACE_WITH_BUNNY_VIDEO_ID_B10',
    'bunny',
    3000,
    true
);

-- 4. INSERT 10 LESSONS FOR ZENTANGLE (Class 3)
INSERT INTO public.lessons (class_id, title, description, display_order, video_id, video_provider, duration_seconds, is_published)
VALUES
(
    '33333333-3333-3333-3333-333333333333',
    'Introduction to Zentangle',
    'The philosophy of non-judgmental drawing. Exploring the standard square tile, archival ink pens, and intentional breathing.',
    1,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z01',
    'bunny',
    1000,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Understanding Pattern',
    'Deconstructing organic and geometric repetition into elemental lines: dots, curves, s-shapes, and orbs.',
    2,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z02',
    'bunny',
    1335,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Basic Strokes',
    'Foundational tangle patterns: Crescent Moon, Hollibaugh, Florz, and Bales with consistent spacing and pen weight.',
    3,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z03',
    'bunny',
    1530,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Creating Repeating Forms',
    'Grid-based tangles vs organic growth tangles. Cultivating muscle memory through slow rhythmic strokes.',
    4,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z04',
    'bunny',
    1740,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Building Organic Patterns',
    'Botanical-inspired tangles: Mooka, Pokeleaf, Paradox, and Verve mimicking tendrils, spore pods, and vines.',
    5,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z05',
    'bunny',
    1905,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Texture and Rhythm',
    'Contrasting dense black fill areas with delicate fine lines to generate dramatic optical rhythm and optical depth.',
    6,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z06',
    'bunny',
    1690,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Structured Composition',
    'Pencil string boundaries. How light graphite divides a tile without constraining creative interpretation.',
    7,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z07',
    'bunny',
    2000,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Layering Patterns',
    'The Hollibaugh principle: drawing behind, weaving ribbons, and establishing illusionary multi-tiered planes.',
    8,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z08',
    'bunny',
    2210,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Mindful Drawing Practice',
    'Shading with soft graphite pencils and tortillons to lift 2D pen patterns into pillowy, tactile sculptural forms.',
    9,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z09',
    'bunny',
    1800,
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Final Zentangle',
    'A complete mindful tile ritual from initial gratitude and four pencil corner dots to final monogram signature.',
    10,
    'REPLACE_WITH_BUNNY_VIDEO_ID_Z10',
    'bunny',
    2520,
    true
);

-- 5. INSERT 10 LESSONS FOR LINE ARTS (Class 4)
INSERT INTO public.lessons (class_id, title, description, display_order, video_id, video_provider, duration_seconds, is_published)
VALUES
(
    '44444444-4444-4444-4444-444444444444',
    'Introduction to Line Art',
    'The expressive vocabulary of the pen. Selecting pigment fineliners, dip pens, and smooth archival Bristol paper.',
    1,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L01',
    'bunny',
    1155,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Understanding Line',
    'Line weight modulation, tapered endings, unbroken continuous strokes, and using line speed to convey energy.',
    2,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L02',
    'bunny',
    1540,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Basic Drawing Techniques',
    'Parallel hatching, cross-hatching densities, contour hatching, and rhythmic stippling gradients for subtle tone.',
    3,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L03',
    'bunny',
    1790,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Contour and Form',
    'Blind contour exercises and modified cross-contour lines that wrap around organic botanical volumes.',
    4,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L04',
    'bunny',
    2060,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Pattern Development',
    'Translating natural plant textures (bark grooves, seed pod scales, thorn clusters) into repeatable graphic motifs.',
    5,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L05',
    'bunny',
    1930,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Intricate Line Work',
    'Micro-detail rendering: feather-light lines for dandelion seeds, dry thistle hairs, and papery calyx skins.',
    6,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L06',
    'bunny',
    2265,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Texture Through Line',
    'Combining varied line densities to convey surface roughness, velvety petal textures, and polished seed sheen.',
    7,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L07',
    'bunny',
    1995,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Composition',
    'Framing botanical line art within clean geometric margins and balancing dense ink clusters with open white spaces.',
    8,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L08',
    'bunny',
    2280,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Detailed Drawing Practice',
    'Full inking session from preliminary construction guidelines to the final erasure of underlying graphite marks.',
    9,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L09',
    'bunny',
    2490,
    true
),
(
    '44444444-4444-4444-4444-444444444444',
    'Final Line Artwork',
    'Culmination project: Creating a detailed botanical line artwork ready for gallery framing or botanical publication.',
    10,
    'REPLACE_WITH_BUNNY_VIDEO_ID_L10',
    'bunny',
    2880,
    true
);
