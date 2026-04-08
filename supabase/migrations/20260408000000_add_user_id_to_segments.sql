-- Enable Row Level Security
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone can read all segments (public read)
CREATE POLICY "segments_select_public"
  ON segments
  FOR SELECT
  USING (true);

-- INSERT: authenticated users only; user_id must match the caller
CREATE POLICY "segments_insert_authenticated"
  ON segments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: authenticated users only; user_id must match the caller
CREATE POLICY "segments_update_authenticated"
  ON segments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: authenticated users only; user_id must match the caller
CREATE POLICY "segments_delete_authenticated"
  ON segments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
