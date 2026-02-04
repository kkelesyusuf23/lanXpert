import { geminiModel } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { questionId } = await req.json();

    const { data: question, error: fetchError } = await supabase
        .from('questions')
        .select('*')
        .eq('question_id', questionId)
        .single();

    if (fetchError || !question) {
        return NextResponse.json({ error: "Soru bulunamadı." }, { status: 404 });
    }

    const prompt = `
    Aşağıdaki cümleyi ${question.source_language} dilinden ${question.target_language} diline çevir.
    Kullanım türü: ${question.usage_type}
    Zorluk seviyesi: ${question.difficulty_level}
    
    Cümle: "${question.source_text}"
    
    Sadece çeviriyi ve varsa kısa bir dilbilgisi notunu şu formatta ver:
    Çeviri: [Çeviri Buraya]
    Not: [Varsa kısa not]
  `;

    if (!geminiModel) {
        return NextResponse.json({
            error: "AI özelliği yapılandırılmamış. Lütfen GEMINI_API_KEY ekleyin."
        }, { status: 503 });
    }

    try {
        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text();

        const { data: answer, error: insertError } = await supabase
            .from('answers')
            .insert({
                question_id: questionId,
                translated_text: responseText,
                confidence_score: 0.95, // AI confidence
                is_accepted: false
            })
            .select()
            .single();

        if (insertError) throw insertError;

        await supabase
            .from('questions')
            .update({ status: 'ai_answered', ai_fallback_used: true })
            .eq('question_id', questionId);

        return NextResponse.json({ success: true, answer });
    } catch (err: any) {
        console.error("AI Error:", err);
        return NextResponse.json({ error: "AI yanıtı oluşturulurken bir hata oluştu." }, { status: 500 });
    }
}
