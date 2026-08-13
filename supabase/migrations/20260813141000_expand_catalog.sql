-- Expand catalog so every category has a full shelf.

UPDATE public.products
SET stock = 28
WHERE id = 'halo-mini' AND stock = 0;

INSERT INTO public.products (
  id, slug, name, tagline, description, price, compare_at_price, category,
  images, stock, featured, best_seller, newest, on_sale, specs, shipping, returns
) VALUES
(
  'pulse-lite', 'pulse-lite', 'Pulse Lite', 'Everyday listening, without the studio tax.',
  'On-ear Pulse with a lighter clamp, a folding yoke, and a 30-hour battery. Same voicing as the full-size cups, scaled for bags that are already full.',
  199, NULL, 'audio',
  ARRAY['/products/pulse.png','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=1600&q=80'],
  64, false, true, false, false,
  '{"Drivers":"32 mm dynamic","Battery":"30 hours","Weight":"186 g","Connectivity":"Bluetooth 5.3, USB-C","Folding":"Yes","ANC":"Hybrid"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'arc-sport', 'arc-sport', 'Arc Sport', 'Sweat, rain, and a lock that holds.',
  'A sport-fit Arc with wingtips, IP57, and a case that clips to a bag strap. Transparency stays open so street noise is a choice, not a surprise.',
  129, NULL, 'audio',
  ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1600&q=80'],
  91, false, false, true, false,
  '{"Drivers":"10 mm","Battery":"9 + 27 hours","Water resistance":"IP57","Weight":"5.1 g each","Connectivity":"Bluetooth 5.4","Fit":"Wingtip + three seals"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Ear tips excluded once opened.'
),
(
  'halo-pair', 'halo-pair', 'Halo Pair', 'Stereo, without a rack of boxes.',
  'Two Halo speakers that calibrate as a pair. Place them on a shelf or a credenza; they agree on the room and stay that way.',
  749, NULL, 'audio',
  ARRAY['/products/halo.png','https://images.unsplash.com/photo-1545454675-3538b1d29bb7?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1600&q=80'],
  14, true, false, true, false,
  '{"Configuration":"Stereo pair","Power":"2 × 120 W peak","Connectivity":"Wi-Fi 6, AirPlay-compatible","Room calibration":"Paired","Weight":"2.4 kg each"}'::jsonb,
  'White-glove available in select cities. Standard shipping is free over $75.',
  '30-day returns. Original packaging required.'
),
(
  'veil', 'veil-band', 'Veil Band', 'Open-ear sound for days that stay in motion.',
  'An open-ear band that sits on the cheek, not in the canal. Useful for cycling, kitchens, and any hour you still need the room.',
  99, 129, 'audio',
  ARRAY['https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80'],
  73, false, false, false, true,
  '{"Drivers":"16 mm open-ear","Battery":"18 hours","Weight":"32 g","Water resistance":"IPX5","Connectivity":"Bluetooth 5.3"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'orbit-classic', 'orbit-classic', 'Orbit Classic', 'Steel, leather, and a quieter face.',
  'Orbit in a 42 mm steel case with a leather strap. Always-on time, weekly battery, and health sensors that stay in the background until asked.',
  499, NULL, 'wearables',
  ARRAY['/products/orbit.png','https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1600&q=80'],
  19, true, false, false, false,
  '{"Display":"1.5 in sapphire OLED","Case":"42 mm steel","Battery":"8 days","Water resistance":"5 ATM","Strap":"Italian leather","Weight":"52 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Personalized engravings are final sale.'
),
(
  'drift', 'drift-band', 'Drift Band', 'Recovery, without a second screen on your wrist.',
  'A slim fitness band with a week-plus battery, haptic alarms, and a display that only wakes when you turn it toward you.',
  159, NULL, 'wearables',
  ARRAY['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1600&q=80'],
  88, false, true, false, false,
  '{"Display":"AMOLED 1.1 in","Battery":"12 days","Sensors":"HR, SpO2, sleep, skin temp","Water resistance":"5 ATM","Weight":"18 g","Compatibility":"iOS and Android"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'nova-loop', 'nova-loop', 'Nova Loop', 'A ring that measures, then gets out of the way.',
  'Titanium sleep and recovery ring. Charge it on Charge Hub. Read the week on your phone, not on your hand.',
  249, NULL, 'wearables',
  ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1600&q=80'],
  41, true, false, true, false,
  '{"Material":"Grade 5 titanium","Battery":"6 days","Sensors":"HR, HRV, temp, motion","Sizes":"6–13","Weight":"3–5 g","Water resistance":"10 ATM"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Sizing kit required before final sale on engraved rings.'
),
(
  'orbit-band', 'orbit-milanese', 'Orbit Milanese Band', 'A strap that behaves like the watch.',
  'Magnetic milanese mesh for Orbit 40 and 44. Brushed steel, a low profile clasp, and no extra hardware on the wrist.',
  79, NULL, 'wearables',
  ARRAY['https://images.unsplash.com/photo-1524592094714-0f2333898906?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?auto=format&fit=crop&w=1600&q=80','/products/orbit.png'],
  110, false, false, false, false,
  '{"Fit":"Orbit 40 / 44","Material":"316L mesh","Closure":"Magnetic","Width":"20 mm","Weight":"22 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Unworn, original pouch.'
),
(
  'beam-pendant', 'beam-pendant', 'Beam Pendant', 'A single point of light over the table.',
  'A 30 cm disc, high-CRI LEDs, and a dimmer that holds a dinner temperature without looking theatrical. Hang it 70 cm above the surface and stop adjusting.',
  259, NULL, 'lighting',
  ARRAY['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1507473886605-74d4bb4d3ace?auto=format&fit=crop&w=1600&q=80'],
  26, false, false, true, false,
  '{"CRI":"95+","Temperature":"2700–4000 K","Diameter":"300 mm","Power":"22 W","Drop":"1.8 m adjustable","Weight":"1.6 kg"}'::jsonb,
  'Oversize. Delivery windows shown at checkout.',
  '30-day returns. Original packaging required.'
),
(
  'beam-clamp', 'beam-clamp', 'Beam Clamp', 'Task light for a desk that is already occupied.',
  'The Beam head on a clamp. Reaches 420 mm, remembers the last temperature, and does not ask for a second hole in the oak.',
  129, NULL, 'lighting',
  ARRAY['https://images.unsplash.com/photo-1507473886605-74d4bb4d3ace?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1565814329452-a88b8c267026?auto=format&fit=crop&w=1600&q=80'],
  52, false, true, false, false,
  '{"CRI":"95+","Temperature":"2700–6500 K","Reach":"420 mm","Clamp":"Up to 54 mm","Power":"10 W","Weight":"740 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'lumen', 'lumen-panel', 'Lumen Panel', 'A wall that knows what time it is.',
  'A 60 cm bias panel for behind a desk or a television. Indirect, high-CRI, and scheduled so the room does not slam from noon to night.',
  219, NULL, 'lighting',
  ARRAY['https://images.unsplash.com/photo-1565814329452-a88b8c267026?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1600&q=80'],
  33, true, false, false, false,
  '{"CRI":"95+","Temperature":"2200–6500 K","Size":"600 × 80 × 18 mm","Power":"18 W","Mount":"Wall or shelf","Weight":"890 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'dusk', 'dusk-sconce', 'Dusk Sconce', 'Hallway light that does not announce itself.',
  'A shallow sconce with a linen diffuser. Up and down throw, a warm default, and a dimmer that works from the existing switch.',
  179, NULL, 'lighting',
  ARRAY['https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1507473886605-74d4bb4d3ace?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1565814329452-a88b8c267026?auto=format&fit=crop&w=1600&q=80'],
  37, false, false, false, false,
  '{"CRI":"90+","Temperature":"2700 K","Power":"8 W","Install":"Standard junction","Finish":"Brushed aluminum","Weight":"620 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Electrical install not included.'
),
(
  'charge-brick', 'charge-brick', 'Charge Brick', 'A day of power, in a jacket pocket.',
  'A 10,000 mAh brick with two USB-C ports and a display that only shows numbers you can use. No lights that stay on in a bag.',
  79, NULL, 'power',
  ARRAY['https://images.unsplash.com/photo-1609091834311-8e26282902c6?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1591290619762-c657d1414556?auto=format&fit=crop&w=1600&q=80'],
  140, false, true, false, false,
  '{"Capacity":"10,000 mAh","Output":"2 × USB-C 30 W shared","Input":"USB-C 20 W","Weight":"188 g","Airline safe":"Yes"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Used batteries inspected before refund.'
),
(
  'charge-desk', 'charge-desk', 'Charge Desk', 'The dock that ends the cable drawer.',
  'A desk dock: 96 W laptop out, two downstream USB-C, HDMI, and a Charge pad on top for Orbit or a phone. One cable to the wall.',
  159, NULL, 'power',
  ARRAY['https://images.unsplash.com/photo-1591290619762-c657d1414556?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1609091834311-8e26282902c6?auto=format&fit=crop&w=1600&q=80'],
  45, true, false, true, false,
  '{"Laptop":"USB-C PD 96 W","Downstream":"2 × USB-C 15 W","Video":"HDMI 2.0","Wireless":"Qi2 15 W","Material":"Recycled aluminum","Weight":"620 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'charge-car', 'charge-car', 'Charge Car', 'Fast charging that does not occupy both sockets.',
  'A dual USB-C car charger, 60 W shared, with a body that sits flush in the socket. Cable not included—use Charge Cables.',
  59, NULL, 'power',
  ARRAY['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1609091834311-8e26282902c6?auto=format&fit=crop&w=1600&q=80'],
  96, false, false, false, false,
  '{"Output":"60 W shared, 2 × USB-C","Input":"12–24 V","Standard":"PD 3.0","Weight":"42 g"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns.'
),
(
  'charge-cables', 'charge-cables', 'Charge Cable Set', 'Three lengths. One finish. No hunting.',
  'USB-C to USB-C in 0.5 m, 1 m, and 2 m. Braided, 60 W, and a felt wrap so they stay a set.',
  39, 49, 'power',
  ARRAY['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1591290619762-c657d1414556?auto=format&fit=crop&w=1600&q=80','https://images.unsplash.com/photo-1609091834311-8e26282902c6?auto=format&fit=crop&w=1600&q=80'],
  200, false, false, false, true,
  '{"Lengths":"0.5 m, 1 m, 2 m","Rating":"60 W USB-C","Finish":"Braided charcoal","Wrap":"Felt sleeve"}'::jsonb,
  'Free two-day shipping on orders over $75.',
  '30-day returns. Opened packs accepted if unused.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.product_variants (id, product_id, sku_key, name) VALUES
  ('pulse-lite:standard', 'pulse-lite', 'standard', 'Standard'),
  ('pulse-lite:case', 'pulse-lite', 'case', 'With case'),
  ('arc-sport:standard', 'arc-sport', 'standard', 'Standard'),
  ('arc-sport:wing', 'arc-sport', 'wing', 'High-lock wingtips'),
  ('halo-pair:standard', 'halo-pair', 'standard', 'Standard'),
  ('halo-pair:stands', 'halo-pair', 'stands', 'With stands'),
  ('veil:black', 'veil', 'black', 'Graphite'),
  ('veil:sand', 'veil', 'sand', 'Sand'),
  ('orbit-classic:black', 'orbit-classic', 'black', 'Black leather'),
  ('orbit-classic:tan', 'orbit-classic', 'tan', 'Tan leather'),
  ('drift:s', 'drift', 's', 'S band'),
  ('drift:m', 'drift', 'm', 'M/L band'),
  ('nova-loop:kit', 'nova-loop', 'kit', 'Sizing kit first'),
  ('nova-loop:8', 'nova-loop', '8', 'Size 8'),
  ('nova-loop:10', 'nova-loop', '10', 'Size 10'),
  ('orbit-band:40', 'orbit-band', '40', '40 mm'),
  ('orbit-band:44', 'orbit-band', '44', '44 mm'),
  ('beam-pendant:black', 'beam-pendant', 'black', 'Black'),
  ('beam-pendant:al', 'beam-pendant', 'al', 'Aluminum'),
  ('beam-clamp:standard', 'beam-clamp', 'standard', 'Standard'),
  ('lumen:warm', 'lumen', 'warm', 'Warm bias'),
  ('lumen:full', 'lumen', 'full', 'Full spectrum'),
  ('dusk:left', 'dusk', 'left', 'Left throw'),
  ('dusk:right', 'dusk', 'right', 'Right throw'),
  ('charge-brick:standard', 'charge-brick', 'standard', 'Standard'),
  ('charge-desk:us', 'charge-desk', 'us', 'US plug'),
  ('charge-desk:eu', 'charge-desk', 'eu', 'EU plug'),
  ('charge-car:standard', 'charge-car', 'standard', 'Standard'),
  ('charge-cables:standard', 'charge-cables', 'standard', 'Standard')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (product_id, author, rating, title, body, verified, created_at) VALUES
  ('pulse-lite', 'Alex Romero', 5, 'The one I actually pack.', 'Folds small, sounds like Pulse, and does not crush the laptop sleeve. Battery lasted a coast-to-coast with mix left over.', true, '2026-07-02'),
  ('arc-sport', 'Nia Blake', 4, 'Stayed in for a 10K.', 'Wingtips work. ANC is lighter than Arc Pro, which is correct for a run. Case clip is the feature I did not know I wanted.', true, '2026-06-21'),
  ('halo-pair', 'Owen Park', 5, 'The room finally has a left and a right.', 'Calibration as a pair is the difference. It looks like two objects, not a stereo system.', true, '2026-05-30'),
  ('orbit-classic', 'Hana Sato', 5, 'Dress watch that still does the week.', 'Leather broke in. Battery is honest. I forget it is a computer, which is the brief.', true, '2026-04-18'),
  ('drift', 'Marcus Cole', 4, 'Sleep data without a brick on the wrist.', 'I wear it at night. The haptics are polite. Twelve days is not marketing.', true, '2026-07-08'),
  ('nova-loop', 'Ivy Laurent', 5, 'The only wearable I keep on.', 'Charge Hub takes it overnight once a week. The app is quiet. That is the product.', true, '2026-08-01'),
  ('lumen', 'Theo Grant', 5, 'Bias light that does not look like RGB.', 'Behind the monitor it just makes evenings easier. Schedule it and leave it.', true, '2026-03-11'),
  ('beam-clamp', 'Rae Kim', 4, 'Saved the desk.', 'No extra base. Color temp is the same as Beam. Clamp is tighter than it looks.', true, '2026-06-04'),
  ('charge-desk', 'Jordan Hale', 5, 'One cable, finally.', 'Laptop, phone, Orbit. HDMI just works. The pad on top is why I did not buy a cheaper dock.', true, '2026-07-28'),
  ('charge-brick', 'Mina Costa', 4, 'Pocketable and dull, in the good way.', 'No party lights. Two ports. Lasted a day of photos and maps.', true, '2026-05-16');
