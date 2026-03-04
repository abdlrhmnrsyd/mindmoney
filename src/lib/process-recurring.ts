import { SupabaseClient } from '@supabase/supabase-js';

export async function processRecurringTransactions(supabase: SupabaseClient) {
    try {
        // 1. Get all due recurring transactions
        const { data: recurring, error: fetchError } = await supabase
            .from('recurring_transactions')
            .select('*')
            .eq('is_active', true)
            .lte('next_date', new Date().toISOString());

        if (fetchError) {
            console.error("Error fetching recurring:", fetchError);
            return { success: false, error: fetchError };
        }

        if (!recurring || recurring.length === 0) {
            return { success: true, processed: 0 };
        }

        let processedCount = 0;

        // 2. Process each one
        for (const trx of recurring) {
            // Insert into transactions
            const { error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: trx.user_id,
                    amount: trx.amount,
                    category: trx.category,
                    type: trx.type,
                    mood: trx.mood
                });

            if (insertError) {
                console.error('Failed to create transaction from recurring:', insertError);
                continue;
            }

            // Calculate next date
            const nextDate = new Date(trx.next_date);

            // To prevent creating millions of transactions if the script hasn't run in a while,
            // we calculate the next valid future date based on frequency.
            // For simplicity here, we'll just bump it once. If it's still in the past,
            // the next run will catch it.
            switch (trx.frequency) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + 1);
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case 'yearly':
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
            }

            // Update recurring record
            const { error: updateError } = await supabase
                .from('recurring_transactions')
                .update({ next_date: nextDate.toISOString() })
                .eq('id', trx.id);

            if (updateError) {
                console.error('Failed to update recurring next_date:', updateError);
            } else {
                processedCount++;
            }
        }

        return { success: true, processed: processedCount };
    } catch (e) {
        console.error("processRecurringTransactions exception:", e);
        return { success: false, error: e };
    }
}
