'use server'

import { createClient } from "@/utils/supabase/server";
import { incrementUsage, checkUsageLimit } from "@/utils/usage-tracker";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuestion(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Check usage limit
    const { allowed, error: limitError } = await checkUsageLimit(user.id, 'questions');
    if (!allowed) {
        throw new Error(limitError || "Günlük soru sorma sınırınıza ulaştınız.");
    }

    const source_text = formData.get('source_text') as string;
    const source_language = formData.get('source_language') as string;
    const target_language = formData.get('target_language') as string;
    const usage_type = formData.get('usage_type') as any;
    const difficulty_level = formData.get('difficulty_level') as any;

    const { data, error } = await supabase
        .from('questions')
        .insert({
            asked_by: user.id,
            source_text,
            source_language,
            target_language,
            usage_type,
            difficulty_level
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating question:", error);
        throw new Error("Soru oluşturulurken bir hata oluştu.");
    }

    // Record usage
    await incrementUsage(user.id, 'questions');

    revalidatePath('/questions');
    redirect('/questions');
}
