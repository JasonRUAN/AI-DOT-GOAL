import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
                        variant={
                            goal.status === "已完成" ? "secondary" : "default"
                        }
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
            <CardFooter>
                {/* <Link href={`/goals/${goal.id}`} className="w-full"> */}
                <Button variant="ghost" className="w-full">
                    查看详情
                </Button>
                {/* </Link> */}
            </CardFooter>
        </Card>
    );
}
