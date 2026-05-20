import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// The Playwright UI runner doesn't load .env.local; populate process.env by calling dotenv.config()
// dotenv.config() defaults to .env — explicitly point it to .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function deleteTestUserSegments() {
  const { data, error } = await supabase
    .from('segments')
    .delete()
    .eq('user_id', process.env.PLAYWRIGHT_TEST_USER_ID!);
  if (error) {
    throw new Error(`Error deleting test user segments: ${error.message}`);
  }
  return data;
}
