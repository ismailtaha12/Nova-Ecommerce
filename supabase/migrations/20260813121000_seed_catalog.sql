-- Catalog seed: products, variants, reviews, coupons, inventory logs.

INSERT INTO public.products (
  id, slug, name, tagline, description, price, compare_at_price, category,
  images, stock, featured, best_seller, newest, on_sale, specs, shipping, returns
) VALUES
(
  'pulse', 'pulse-headphones', 'Pulse Headphones', 'Studio silence, made portable.',
  'Pulse is a closed-back wireless headphone designed for long listening. Memory-foam cups, a machined aluminum yoke, and a 40-hour battery keep the focus on the music—not the hardware.',
  349, NULL, 'audio',
  ARRAY['/products/pulse.png','https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80'],
  42, true, true, false, false,
  '{"Drivers":"40 mm dynamic","Frequency response":"10 Hz – 22 kHz","Battery":"40 hours","Weight":"265 g","Connectivity":"Bluetooth 5.3, USB-C","ANC":"Adaptive hybrid"}'::jsonb,
  'Free two-day shipping on orders over $75. Most orders leave our Oakland warehouse within 24 hours.',
  '30-day returns. Unopened accessories are eligible for a full refund; opened products receive store credit after inspection.'
),
(
  'pulse-studio', 'pulse-studio', 'Pulse Studio', 'Reference listening, at your desk.',
  'An open-back sibling to Pulse, built for mixing and long sessions. A wider soundstage, detachable cable, and a quieter headband make Studio the choice for rooms that stay still.',
  449, NULL, 'audio',
  ARRAY['/products/pulse.png','https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1545127398-14699f3230aa?auto=format&fit=crop&w=1600&q=80'],
  18, true, false, true, false,
  '{"Drivers":"50 mm planar","Impedance":"32 Ω","Weight":"298 g","Cable":"Detachable 2 m","Connectivity":"3.5 mm, 4.4 mm balanced","Open-back":"Yes"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns on unused products in original packaging.'
),
(
  'arc', 'arc-earbuds', 'Arc Earbuds', 'All-day clarity, almost invisible.',
  'Arc sits low in the ear with a matte ceramic shell. Spatial audio, six mics, and a case that charges from any Charge pad—designed for commutes, calls, and everything between.',
  179, NULL, 'audio',
  ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1600&q=80'],
  86, true, true, false, false,
  '{"Drivers":"11 mm custom","Battery":"8 + 28 hours","Water resistance":"IPX4","Weight":"4.8 g each","Connectivity":"Bluetooth 5.4","ANC":"Adaptive"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Ear tips are excluded once opened for hygiene.'
),
(
  'arc-pro', 'arc-pro', 'Arc Pro', 'For rooms that never quiet down.',
  'A denser seal, stronger ANC, and a transparency mode that actually sounds like the room. Arc Pro is for studios adjacent to the street, and trains that refuse to be ignored.',
  249, 279, 'audio',
  ARRAY['https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1631868924066-23c2b0d3dc0f?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1645003112297-0b45c31c3309?auto=format&fit=crop&w=1600&q=80'],
  24, false, false, true, true,
  '{"Drivers":"Dual 10 mm","Battery":"7 + 24 hours","ANC":"Dual-mode adaptive","Water resistance":"IP54","Weight":"5.4 g each","Connectivity":"Bluetooth 5.4, LC3"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Ear tips excluded once opened.'
),
(
  'halo', 'halo-speaker', 'Halo Speaker', 'A room, filled with intention.',
  'Halo is a cylindrical home speaker with a fabric wrap and a downward-firing sub. Place it in a corner or the center of a table—room calibration does the rest.',
  399, NULL, 'audio',
  ARRAY['/products/halo.png','https://images.unsplash.com/photo-1545454675-3538b1d29bb7?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1600&q=80'],
  31, true, true, false, false,
  '{"Drivers":"25 mm tweeter + 4.5 in woofer","Power":"120 W peak","Connectivity":"Wi-Fi 6, Bluetooth 5.3, AirPlay-compatible","Room calibration":"Yes","Weight":"2.4 kg","Dimensions":"168 × 240 mm"}'::jsonb,
  'White-glove available in select cities. Standard shipping is free over $75.',
  '30-day returns. Original packaging required.'
),
(
  'halo-mini', 'halo-mini', 'Halo Mini', 'The same voice, a smaller room.',
  'A compact Halo for desks, kitchens, and nightstands. The same fabric, a simpler driver array, and a handle that makes it honest about being moved.',
  149, NULL, 'audio',
  ARRAY['/products/halo.png','https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1545454675-3538b1d29bb7?auto=format&fit=crop&w=1600&q=80'],
  0, false, false, false, false,
  '{"Drivers":"Full-range 2.5 in","Battery":"12 hours","Connectivity":"Bluetooth 5.3","Weight":"680 g","Water resistance":"IPX5"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'orbit', 'orbit-timepiece', 'Orbit Timepiece', 'A watch that stays out of the way.',
  'Orbit is a sapphire-faced wearable with a 10-day battery in time-only mode. Health sensors are present; they do not shout. The bracelet is brushed steel, or woven polymer for sport.',
  429, NULL, 'wearables',
  ARRAY['/products/orbit.png','https://images.unsplash.com/photo-1524592094714-0f2333898906?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1600&q=80'],
  22, true, false, true, false,
  '{"Display":"1.9 in sapphire OLED","Battery":"10 days / 36 hours GPS","Water resistance":"10 ATM","Sensors":"HR, SpO2, temperature, GPS","Weight":"38 g (case)","Compatibility":"iOS and Android"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Personalized engravings are final sale.'
),
(
  'orbit-sport', 'orbit-sport', 'Orbit Sport', 'Built for miles, not meetings.',
  'A polymer case, a brighter display, and dual-frequency GPS. Orbit Sport is lighter, louder about recovery, and ready for weather that is not.',
  279, NULL, 'wearables',
  ARRAY['/products/orbit.png','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1600&q=80'],
  54, false, true, false, false,
  '{"Display":"1.4 in always-on","Battery":"16 days / 30 hours GPS","GPS":"Dual-frequency","Water resistance":"10 ATM","Weight":"29 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'beam', 'beam-desk-lamp', 'Beam Desk Lamp', 'Light, calibrated for work.',
  'A CNC-aluminum arm, a high-CRI LED, and a dimmer that remembers the hour. Beam is a lamp that treats color temperature as a setting, not an accident.',
  189, NULL, 'lighting',
  ARRAY['https://images.unsplash.com/photo-1507473886605-74d4bb4d3ace?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1600&q=80'],
  40, true, false, false, false,
  '{"CRI":"95+","Temperature":"2700–6500 K","Power":"12 W","Dimming":"Stepless, app + touch","Reach":"480 mm","Weight":"1.1 kg"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'beam-floor', 'beam-floor', 'Beam Floor', 'A quiet column of light.',
  'Floor-standing Beam with an uplight and a reading head. Two independently dimmable sources, one switch, no visual noise.',
  329, NULL, 'lighting',
  ARRAY['https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1507473886605-74d4bb4d3ace?auto=format&fit=crop&w=1600&q=80'],
  9, false, false, true, false,
  '{"CRI":"95+","Temperature":"2700–4000 K","Height":"148 cm","Power":"24 W","Weight":"4.2 kg"}'::jsonb,
  'Oversize. Delivery windows shown at checkout.',
  '30-day returns. Original packaging required.'
),
(
  'charge-hub', 'charge-hub', 'Charge Hub', 'One pad. Three devices. No tangle.',
  'A three-coil charging tray in recycled aluminum. Phone, Orbit, and Arc case sit in shallow wells so nothing slides off the nightstand.',
  89, NULL, 'power',
  ARRAY['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1591290619762-c657d1414556?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1609091834311-8e26282902c6?auto=format&fit=crop&w=1600&q=80'],
  120, false, true, false, false,
  '{"Output":"15 W + 5 W + 5 W","Input":"USB-C PD 30 W","Standard":"Qi2","Material":"Recycled aluminum","Weight":"340 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'charge-travel', 'charge-travel', 'Charge Travel Kit', 'Power that packs as small as it should.',
  'A 10,000 mAh brick, a 65 W GaN charger, and two braided cables in a felt sleeve. Enough for a weekend without occupying the entire bag pocket.',
  129, 149, 'power',
  ARRAY['https://images.unsplash.com/photo-1609091834311-8e26282902c6?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80'],
  67, false, false, true, true,
  '{"Capacity":"10,000 mAh","Charger":"65 W GaN","Ports":"2× USB-C, 1× USB-A","Weight":"290 g kit","Airline safe":"Yes"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Used batteries inspected before refund.'
);

INSERT INTO public.product_variants (id, product_id, sku_key, name) VALUES
  ('pulse:standard', 'pulse', 'standard', 'Standard'),
  ('pulse:travel', 'pulse', 'travel', 'Travel case'),
  ('pulse-studio:standard', 'pulse-studio', 'standard', 'Standard'),
  ('pulse-studio:balanced', 'pulse-studio', 'balanced', 'Balanced cable'),
  ('arc:standard', 'arc', 'standard', 'Standard'),
  ('arc:mag', 'arc', 'mag', 'Mag case'),
  ('arc-pro:standard', 'arc-pro', 'standard', 'Standard'),
  ('arc-pro:foam', 'arc-pro', 'foam', 'Memory foam tips'),
  ('halo:standard', 'halo', 'standard', 'Standard'),
  ('halo:stand', 'halo', 'stand', 'With stand'),
  ('halo-mini:standard', 'halo-mini', 'standard', 'Standard'),
  ('orbit:40', 'orbit', '40', '40 mm'),
  ('orbit:44', 'orbit', '44', '44 mm'),
  ('orbit-sport:s', 'orbit-sport', 's', 'S band'),
  ('orbit-sport:m', 'orbit-sport', 'm', 'M/L band'),
  ('beam:standard', 'beam', 'standard', 'Standard'),
  ('beam-floor:standard', 'beam-floor', 'standard', 'Standard'),
  ('charge-hub:us', 'charge-hub', 'us', 'US plug'),
  ('charge-hub:eu', 'charge-hub', 'eu', 'EU plug'),
  ('charge-travel:standard', 'charge-travel', 'standard', 'Standard');

INSERT INTO public.reviews (product_id, author, rating, title, body, verified, created_at) VALUES
  ('pulse', 'Maya Chen', 5, 'The commute disappeared.', 'ANC is the best I have used without that pressurized feeling. The sand color looks better in person than on a screen.', true, '2026-06-12'),
  ('pulse', 'Jonah Ellis', 4, 'Almost perfect.', 'Sound is even and unfatiguing. I wish the case were a little slimmer, but the cups are genuinely comfortable after three hours.', true, '2026-05-02'),
  ('arc', 'Priya Nair', 5, 'Finally, earbuds that stay put.', 'I run in them. They do not fall out. Calls are clear enough that people stop asking if I am outside.', true, '2026-07-19'),
  ('halo', 'Chris Adeyemi', 5, 'Filled the apartment without shouting.', 'Room calibration took two minutes. Bass is present, not bloated. It looks like furniture, which is the point.', true, '2026-04-08'),
  ('orbit', 'Elena Voss', 4, 'A watch I actually wear.', 'Battery lasts the week. The interface is restrained. Notifications are optional and stay that way.', true, '2026-03-22'),
  ('beam', 'Sam Ortiz', 5, 'My desk looks finished.', 'Color temperature tracking through the afternoon is subtle and correct. Build quality is what the price suggests.', true, '2026-02-14');

INSERT INTO public.coupons (code, description, discount, status, uses, limit_count) VALUES
  ('WELCOME10', '10% off first order', '10%', 'active', 1840, 5000),
  ('STUDIO50', '$50 off select audio', '$50', 'active', 312, 800),
  ('SUMMER26', 'Seasonal shipping promo', 'Free ship', 'expired', 2201, 2201),
  ('FALL-PRE', 'Fall preview, 15% off lighting', '15%', 'scheduled', 0, 1000);

INSERT INTO public.inventory_logs (product_id, sku, change, reason, created_at) VALUES
  ('halo-mini', 'NV-HALOMINI', -12, 'Order batch', '2026-08-10'),
  ('halo-mini', 'NV-HALOMINI', -18, 'Sold through', '2026-08-08'),
  ('beam-floor', 'NV-BEAMFLR', -4, 'Order NV-88301', '2026-08-07'),
  ('pulse', 'NV-PULSE', 40, 'Restock', '2026-08-04'),
  ('orbit', 'NV-ORBIT', 16, 'Restock', '2026-08-01');
