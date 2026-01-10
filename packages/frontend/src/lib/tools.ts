// 添加辅助函数处理 bigint 序列化
export const customStringify = (obj: unknown): string => {
    return JSON.stringify(
        obj,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),
        2,
    );
};
