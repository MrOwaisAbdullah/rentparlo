SELECT id, name, price, is_active, display_order, char_length(name) as name_length
FROM public.subscription_packages 
WHERE name LIKE '%Basic%' OR name ILIKE '%basic%'
ORDER BY display_order;