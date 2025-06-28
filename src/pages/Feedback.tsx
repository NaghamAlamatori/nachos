import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Dummy data
type Feedback = {
  id: number;
  user: string;
  message: string;
  date: string;
};

const generateDummyFeedback = (): Feedback[] =>
  Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    user: `user${i + 1}`,
    message: `This is feedback message number ${i + 1}. I love nachos 🍿`,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
  }));

const dummyFeedback = generateDummyFeedback();

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>(dummyFeedback);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyTarget, setReplyTarget] = useState<Feedback | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);
  const [replyText, setReplyText] = useState("");

  const feedbackPerPage = 10;
  const indexOfLast = currentPage * feedbackPerPage;
  const indexOfFirst = indexOfLast - feedbackPerPage;
  const currentFeedback = feedback.slice(indexOfFirst, indexOfLast);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setFeedback(prev => prev.filter(fb => fb.id !== deleteTarget.id));
    toast.success("Feedback deleted", {
      style: {
        backgroundColor: "#f6d33d",
        color: "#000",
      },
    });
    setDeleteTarget(null);
  };

  const handleReply = () => {
    if (!replyTarget || !replyText.trim()) return;
    toast.success(`Reply sent to ${replyTarget.user}: "${replyText}"`, {
      style: {
        backgroundColor: "#f6d33d",
        color: "#000",
      },
    });
    setReplyText("");
    setReplyTarget(null);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#f6d33d] mb-6">Feedback</h1>
      <div className="space-y-4">
        {currentFeedback.map((fb) => (
          <div
            key={fb.id}
            className="bg-white shadow p-4 rounded-md flex justify-between items-center border border-yellow-100"
          >
            <div>
              <p className="font-semibold">{fb.user}</p>
              <p className="text-sm text-gray-600">{fb.message}</p>
              <p className="text-sm">📅 {fb.date}</p>
            </div>
            <div className="space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setReplyTarget(fb)}
                  >
                    Reply
                  </Button>
                </DialogTrigger>
                {replyTarget?.id === fb.id && (
                  <DialogContent className="bg-[#fdf6d4] border border-[#f6d33d]">
                    <h2 className="text-lg font-semibold text-[#f6d33d]">
                      Reply to {fb.user}
                    </h2>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full border border-yellow-300 rounded-md p-2 mt-2"
                      rows={4}
                      placeholder="Write your reply..."
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setReplyTarget(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-[#f6d33d] text-black hover:bg-yellow-400"
                        onClick={handleReply}
                      >
                        Send
                      </Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setDeleteTarget(fb)}
                  >
                    Delete
                  </Button>
                </DialogTrigger>
                {deleteTarget?.id === fb.id && (
                  <DialogContent className="bg-[#fdf6d4] border border-[#f6d33d]">
                    <h2 className="text-lg font-semibold text-red-600">
                      Confirm Delete
                    </h2>
                    <p>
                      Are you sure you want to delete feedback from{" "}
                      <b>{fb.user}</b>?
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDeleteTarget(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDelete}
                      >
                        Yes, Delete
                      </Button>
                    </div>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({
          length: Math.ceil(feedback.length / feedbackPerPage),
        }).map((_, idx) => (
          <Button
            key={idx}
            variant={currentPage === idx + 1 ? "default" : "outline"}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
