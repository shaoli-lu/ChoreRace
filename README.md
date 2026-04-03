# Chore Race

Turn boring decisions into a fast, playful race!

**Here's what was implemented:**
1. **Interactive Race:** Users can add multiple racers (or chores!). A random speed algorithm ensures unexpected winners, keeping the race thrilling each time.
2. **Supabase Integration:** The Supabase configuration has been embedded into `.env.local` linking up the app automatically to log recent race winners.
3. **Animations:** Canvas Confetti has been implemented so you get showers of confetti not just at the end of every race, but any time a user taps their screen anywhere!
4. **Modern Design:** Generative logo integrated, mobile-first responsiveness, and pure CSS layout for ultra-fast load execution, leveraging a polished dark/glassmorphism aesthetic. 

---

## 🛠 Supabase Database Setup

To make sure the application can log race histories properly to your backend, you will need to add a `race_history` table in Supabase.

1. Navigate to your Supabase Project (`cceejcsqxlaqlgfjrtve`).
2. Open the **SQL Editor**.
3. Paste and run the following query:

```sql
CREATE TABLE race_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  participants text[],
  winner_name text
);

-- Note: You may want to enable policies depending on your row-level security preferences.
-- To allow ANY insert directly from the client without logging in:
ALTER TABLE race_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON race_history FOR INSERT WITH CHECK (true);
```

## ▶️ Running the App
Once everything is ready, simply start up the development server:
1. Open your terminal in the project directory.
2. Run `npm run dev`
3. Navigate to `http://localhost:3000` via your web browser to enjoy!

Enjoy your sleek new app!
