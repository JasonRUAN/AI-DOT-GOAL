"use client";

import { CreateGoalForm } from "@/components/CreateGoalForm";
import { useLanguage } from "@/providers/LanguageProvider";

export default function CreateGoalPage() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-8">
                {t("createNewGoal")}
            </h1>
            <CreateGoalForm />
        </div>
    );
}
