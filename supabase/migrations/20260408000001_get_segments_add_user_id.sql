DROP FUNCTION IF EXISTS public.get_segments();

CREATE OR REPLACE FUNCTION public.get_segments()
  RETURNS TABLE(id uuid, rating integer, geometry text, user_id uuid)
  LANGUAGE sql
AS $function$
  SELECT id, rating, ST_AsGeoJSON(geometry) AS geometry, user_id FROM segments;
$function$;
