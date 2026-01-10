"use client";

import React from "react";
import { GoalDetail } from "@/components/GoalDetail";
import { useParams } from "next/navigation";

export default function GoalDetailPage() {
    // 在客户端组件中，使用useParams获取路由参数
    const routeParams = useParams();
    const id = routeParams.id as string;

    return (
        <div className="container mx-auto px-4 py-12">
            <GoalDetail id={id} />
        </div>
    );
}
