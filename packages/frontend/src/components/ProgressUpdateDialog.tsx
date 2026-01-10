"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProgress } from "@/mutations/update_progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/providers/LanguageProvider";
import { CONSTANTS } from "@/constants";

interface ProgressUpdateDialogProps {
    goalId: number;
    currentProgress: number;
    onProgressUpdated?: () => void;
    isCreator?: boolean;
}

export function ProgressUpdateDialog({
    goalId,
    currentProgress,
    onProgressUpdated,
    isCreator = false,
}: ProgressUpdateDialogProps) {
    const { language } = useLanguage();
    const [progressDialogOpen, setProgressDialogOpen] = useState(false);
    const [progressContent, setProgressContent] = useState("");
    const [progressPercentage, setProgressPercentage] =
        useState<number>(currentProgress);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofBlobId, setProofBlobId] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    const updateProgressMutation = useUpdateProgress();
    const { mutate: updateProgress, isPending: isUpdatingProgress, isConfirming } = updateProgressMutation;

    // 当打开进度对话框时，初始化进度值为当前进度
    const handleDialogOpenChange = (open: boolean) => {
        setProgressDialogOpen(open);
        if (open) {
            setProgressPercentage(currentProgress);
            setIsFileUploaded(false);
        }
    };

    // 当交易确认成功后执行回调
    useEffect(() => {
        if (updateProgressMutation.isSuccess && !updateProgressMutation.isPending && !isConfirming) {
            toast.success(
                language === "zh"
                    ? "进度更新成功"
                    : "Progress updated successfully",
            );
            setProgressDialogOpen(false);
            setProgressContent("");
            setProofFile(null);
            setProofBlobId("");

            // 通知父组件进度已更新
            if (onProgressUpdated) {
                onProgressUpdated();
            }
        }
    }, [updateProgressMutation.isSuccess, updateProgressMutation.isPending, isConfirming, language, onProgressUpdated]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProofFile(file);
        setIsUploading(true);

        try {
            // 使用 FormData 上传文件到后端 Pinata 服务
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(`${CONSTANTS.BACKEND_URL}/pinata/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const result = await response.json();
            const ipfsHash = result.ipfsHash;

            console.log(`Pinata upload file: ${file.name} ipfsHash: ${ipfsHash}`);

            setProofBlobId(ipfsHash);
            setIsFileUploaded(true);
            toast.success(
                language === "zh"
                    ? "文件上传成功"
                    : "File uploaded successfully",
            );
        } catch (error) {
            toast.error(
                language === "zh" ? "文件上传失败" : "File upload failed",
            );
            console.error("File upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleProgressSubmit = () => {
        if (!progressContent.trim()) {
            toast.error(
                language === "zh"
                    ? "请输入进度描述"
                    : "Please enter a progress description",
            );
            return;
        }

        updateProgress(
            {
                goalId: goalId,
                content: progressContent.trim(),
                percentage: progressPercentage,
                proofFileBlobId: proofBlobId,
            },
            {
                onError: (error) => {
                    toast.error(
                        language === "zh"
                            ? `进度更新失败: ${error.message}`
                            : `Failed to update progress: ${error.message}`,
                    );
                },
            },
        );
    };

    return (
        <>
            {isCreator ? (
                <Dialog
                    open={progressDialogOpen}
                    onOpenChange={handleDialogOpenChange}
                >
                    <DialogTrigger asChild>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                            <Upload className="h-4 w-4 mr-2" />
                            {language === "zh" ? "更新进度" : "Update Progress"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {language === "zh"
                                    ? "更新目标进度"
                                    : "Update Goal Progress"}
                            </DialogTitle>
                            <DialogDescription>
                                {language === "zh"
                                    ? "请描述您的进度情况并上传相关证明"
                                    : "Please describe your progress and upload relevant proof"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="progress">
                                    {language === "zh"
                                        ? `进度百分比：${progressPercentage}%`
                                        : `Progress percentage: ${progressPercentage}%`}
                                </Label>
                                <Slider
                                    id="progress"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[progressPercentage]}
                                    onValueChange={(value) =>
                                        setProgressPercentage(value[0])
                                    }
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    {language === "zh"
                                        ? "进度描述"
                                        : "Progress Description"}
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder={
                                        language === "zh"
                                            ? "描述您的进度情况..."
                                            : "Describe your progress..."
                                    }
                                    value={progressContent}
                                    onChange={(e) =>
                                        setProgressContent(e.target.value)
                                    }
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="proof">
                                    {language === "zh"
                                        ? "上传证明"
                                        : "Upload Proof"}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="proof"
                                        type="file"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        className="flex-1"
                                    />
                                    {proofFile && (
                                        <span className="text-sm text-green-500">
                                            {proofFile.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                onClick={handleProgressSubmit}
                                disabled={
                                    isUpdatingProgress ||
                                    !progressContent.trim() ||
                                    !isFileUploaded
                                }
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                            >
                                {isUpdatingProgress ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        {language === "zh" ? "确认中..." : "Confirming..."}
                                    </>
                                ) : (
                                    language === "zh"
                                        ? "提交更新"
                                        : "Submit Update"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </>
    );
}
