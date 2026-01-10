import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface GoalCardProps {
    goal: {
        id: string;
        title: string;
        duration: string;
        stake: string;
        witnesses: number;
        status: string;
        progress: number;
    };
}

export function GoalCard({ goal }: GoalCardProps) {
    return (
        <Card className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <Badge
                        className={`text-white ${
                            goal.status === "已完成" || goal.status === "Completed"
                                ? "bg-blue-500"
                                : "bg-green-500"
                        }`}
                    >
                        {goal.status}
                    </Badge>
                </div>
                <CardDescription>
                    期限: {goal.duration} • 保证金: {goal.stake}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>完成进度</span>
                        <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {goal.witnesses} 位见证人
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
