import { createClient } from '@/utils/supabase/server';

export async function checkUsageLimit(userId: string, type: 'questions' | 'articles') {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get current usage
    const { data: usage, error: fetchError } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

    // Get user tier
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('user_id', userId)
        .single();

    if (userError || !user) return { allowed: false, error: 'User tier not found' };

    const tier = user.subscription_tier;

    // Define limits (matching our implementation plan)
    const limits = {
        free: { questions: 20, articles: 1 },
        basic: { questions: 100, articles: 5 },
        pro: { questions: Infinity, articles: Infinity },
    };

    const currentLimit = limits[tier as keyof typeof limits];
    const currentUsage = usage ? (type === 'questions' ? usage.questions_asked : usage.articles_written) : 0;

    if (currentUsage >= currentLimit[type]) {
        return { allowed: false, limit: currentLimit[type] };
    }

    return { allowed: true, usageRecord: usage };
}

export async function incrementUsage(userId: string, type: 'questions' | 'articles') {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const column = type === 'questions' ? 'questions_asked' : 'articles_written';

    // Upsert usage log
    const { error } = await supabase.rpc('increment_usage', {
        target_user_id: userId,
        target_date: today,
        usage_type: column
    });

    // Note: We'll need to create this RPC in Supabase SQL editor.
    if (error) {
        // Fallback to manual update if RPC fails (first time setup)
        const { data: usage } = await supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (usage) {
            await supabase
                .from('usage_logs')
                .update({ [column]: (usage[column] || 0) + 1 })
                .eq('log_id', usage.log_id);
        } else {
            await supabase
                .from('usage_logs')
                .insert({
                    user_id: userId,
                    date: today,
                    [column]: 1
                });
        }
    }
}
