-- Create increment_usage function for usage tracking
CREATE OR REPLACE FUNCTION increment_usage(
    target_user_id UUID,
    target_date DATE,
    usage_type TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usage_logs (user_id, date, questions_asked, articles_written)
    VALUES (
        target_user_id, 
        target_date,
        CASE WHEN usage_type = 'questions_asked' THEN 1 ELSE 0 END,
        CASE WHEN usage_type = 'articles_written' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, date) 
    DO UPDATE SET
        questions_asked = usage_logs.questions_asked + 
            CASE WHEN usage_type = 'questions_asked' THEN 1 ELSE 0 END,
        articles_written = usage_logs.articles_written + 
            CASE WHEN usage_type = 'articles_written' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;