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
import { apiService } from "@/constants";
import { Label } from "@radix-ui/react-label";
import { FormEvent, useState } from "react";

export function Share({ listId }: { listId: string }) {
  const [shareWith, setShareWith] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleShare = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = localStorage.getItem("userid");
    if (shareWith.trim() === "") return;
    if (!userId) throw new Error("no userId");

    try {
      const response = await fetch(`${apiService}/lists/${listId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify({ username: shareWith }),
      });

      if (response.ok) {
        setDialogOpen(false);
      } else {
        // TODO: Handle error
      }
    } catch (error) {
      // TODO: Handle error
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
