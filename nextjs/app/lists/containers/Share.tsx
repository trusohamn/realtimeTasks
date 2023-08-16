import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { FormEvent, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchWithUserId } from "@/utils/api";

export function Share({
  listId,
  onSuccessShare,
}: {
  listId: string;
  onSuccessShare: () => Promise<void>;
}) {
  const [shareWith, setShareWith] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (shareWith.trim() === "") return;

    try {
      const response = await fetchWithUserId(`/lists/${listId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: shareWith }),
      });

      if (response.ok) {
        await onSuccessShare();
        setDialogOpen(false);
        toast({ title: "Success!", description: "shared with " + shareWith });
      } else {
        if (response.status === 404)
          toast({
            title: "Error!",
            description: "something went wrong, try different username",
          });
        toast({ title: "Error!", description: "something went wrong" });
      }
    } catch (error) {
      toast({ title: "Error!", description: "something went wrong" });
    }
  };

  return (
    <Dialog open={dialogOpen}>
      <Button variant="outline" onClick={() => setDialogOpen(true)}>
        Share list
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share the list</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleShare}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={shareWith}
              onChange={(e) => setShareWith(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div style={{ padding: 20 }} />
          <DialogClose onClose={() => setDialogOpen(false)} />
          <DialogFooter>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
