
-- Create teams table for storing quiz attempts
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 20,
    current_question INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]'::jsonb,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_time_seconds INTEGER,
    warnings INTEGER DEFAULT 0,
    is_disqualified BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    question_order JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin_passwords table
CREATE TABLE public.admin_passwords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Public can insert teams (for starting quiz)
CREATE POLICY "Anyone can create teams" ON public.teams FOR INSERT WITH CHECK (true);

-- Public can read their own team by id
CREATE POLICY "Anyone can read teams" ON public.teams FOR SELECT USING (true);

-- Public can update teams (for quiz progress)
CREATE POLICY "Anyone can update teams" ON public.teams FOR UPDATE USING (true);

-- Public can read questions
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);

-- Admin passwords readable for verification
CREATE POLICY "Anyone can read admin passwords for verification" ON public.admin_passwords FOR SELECT USING (true);

-- Enable realtime for teams
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;

-- Insert default admin password
INSERT INTO public.admin_passwords (password) VALUES ('ignitron2025');

-- Insert sample questions (20 tech questions)
INSERT INTO public.questions (question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
('What does CPU stand for?', 'Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Computer Processing Unit', 'A'),
('Which programming language is known as the backbone of web development?', 'Python', 'JavaScript', 'C++', 'Java', 'B'),
('What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language', 'A'),
('Which company developed the Windows operating system?', 'Apple', 'Google', 'Microsoft', 'IBM', 'C'),
('What is the primary function of RAM?', 'Long-term storage', 'Temporary memory for running programs', 'Graphics processing', 'Network connectivity', 'B'),
('Which of these is a NoSQL database?', 'MySQL', 'PostgreSQL', 'MongoDB', 'Oracle', 'C'),
('What does API stand for?', 'Application Programming Interface', 'Advanced Program Integration', 'Automated Processing Input', 'Application Process Integration', 'A'),
('Which protocol is used for secure web browsing?', 'HTTP', 'FTP', 'HTTPS', 'SMTP', 'C'),
('What is the time complexity of binary search?', 'O(n)', 'O(log n)', 'O(n²)', 'O(1)', 'B'),
('Which data structure uses LIFO principle?', 'Queue', 'Stack', 'Array', 'Linked List', 'B'),
('What does CSS stand for?', 'Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Colorful Style Sheets', 'B'),
('Which company owns Android?', 'Apple', 'Microsoft', 'Google', 'Samsung', 'C'),
('What is Git primarily used for?', 'Database management', 'Version control', 'Web hosting', 'Image editing', 'B'),
('Which of these is a frontend framework?', 'Django', 'Flask', 'React', 'Express', 'C'),
('What does SQL stand for?', 'Structured Query Language', 'Simple Question Language', 'Sequential Query Logic', 'Standard Query Language', 'A'),
('Which port is typically used for HTTP?', '21', '22', '80', '443', 'C'),
('What is the output of 2 + "2" in JavaScript?', '4', '22', 'NaN', 'Error', 'B'),
('Which sorting algorithm has the best average time complexity?', 'Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort', 'B'),
('What does IoT stand for?', 'Internet of Things', 'Integration of Technology', 'Internal Operating Terminal', 'Intelligent Online Tools', 'A'),
('Which cloud service model provides infrastructure?', 'SaaS', 'PaaS', 'IaaS', 'FaaS', 'C');
