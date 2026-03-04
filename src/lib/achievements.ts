import { supabase } from "@/lib/supabase/client";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export type AchievementAction = "add_transaction" | "add_wishlist" | "update_wishlist" | "login";

export const checkAchievements = async (action: AchievementAction) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        // Fetch user's currently unlocked achievements
        const { data: userUnlocked } = await supabase
            .from("user_achievements")
            .select("achievement_id")
            .eq("user_id", userId);

        const unlockedIds = userUnlocked?.map(u => u.achievement_id) || [];

        const unlock = async (achievementId: string) => {
            if (unlockedIds.includes(achievementId)) return; // Already unlocked

            // Try to insert it
            const { error } = await supabase
                .from("user_achievements")
                .insert({ user_id: userId, achievement_id: achievementId });

            if (!error) {
                // Fetch achievement details for the toast
                const { data: achievementDetails } = await supabase
                    .from("achievements")
                    .select("*")
                    .eq("id", achievementId)
                    .single();

                if (achievementDetails) {
                    // Trigger Celebration!
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b']
                    });

                    toast.success("🏆 Achievement Unlocked!", {
                        description: `${achievementDetails.title} - ${achievementDetails.description}`,
                        duration: 5000,
                    });
                }
            }
        };

        // --- Achievement Logic ---

        if (action === "add_transaction") {
            const { count } = await supabase.from("transactions").select("*", { count: "exact", head: true }).eq("user_id", userId);

            if (count && count >= 1) await unlock("first_transaction");
            if (count && count >= 10) await unlock("ten_transactions");
            if (count && count >= 50) await unlock("fifty_transactions");
        }

        if (action === "add_wishlist") {
            const { count } = await supabase.from("wishlists").select("*", { count: "exact", head: true }).eq("user_id", userId);

            if (count && count >= 1) await unlock("first_goal");
        }

        if (action === "update_wishlist") {
            // Check if they have achieved any goal
            const { count } = await supabase.from("wishlists").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "achieved");

            if (count && count >= 1) await unlock("goal_achieved");
        }

    } catch (e) {
        console.error("Failed to process achievements", e);
    }
};
