import { toast } from "@/components/ui/use-toast";

export const defaultErrorToast = () => {
    toast({ title: "Error!", description: "something went wrong" });
}