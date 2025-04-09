-- Create daily_waiting_lists table
CREATE TABLE IF NOT EXISTS daily_waiting_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add daily_list_id to waiting_list table
ALTER TABLE waiting_list
ADD COLUMN IF NOT EXISTS daily_list_id UUID REFERENCES daily_waiting_lists(id) ON DELETE CASCADE;

-- Create index on date for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_waiting_lists_date ON daily_waiting_lists(date);

-- Create index on daily_list_id for faster joins
CREATE INDEX IF NOT EXISTS idx_waiting_list_daily_list_id ON waiting_list(daily_list_id);

-- Add RLS policies
ALTER TABLE daily_waiting_lists ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read daily waiting lists
CREATE POLICY "Allow read access to all authenticated users" ON daily_waiting_lists
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to create daily waiting lists
CREATE POLICY "Allow create access to all authenticated users" ON daily_waiting_lists
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow all authenticated users to update daily waiting lists
CREATE POLICY "Allow update access to all authenticated users" ON daily_waiting_lists
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow all authenticated users to delete daily waiting lists
CREATE POLICY "Allow delete access to all authenticated users" ON daily_waiting_lists
    FOR DELETE
    TO authenticated
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_daily_waiting_lists_updated_at
    BEFORE UPDATE ON daily_waiting_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for daily waiting lists with entry counts
CREATE OR REPLACE VIEW daily_waiting_lists_with_counts AS
SELECT 
    dwl.*,
    COUNT(wl.id) as entry_count
FROM 
    daily_waiting_lists dwl
LEFT JOIN 
    waiting_list wl ON dwl.id = wl.daily_list_id
GROUP BY 
    dwl.id;

-- Add comment to table
COMMENT ON TABLE daily_waiting_lists IS 'Stores daily waiting lists for the Puppy Spa'; 