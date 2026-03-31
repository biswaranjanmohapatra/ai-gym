import Navbar from "@/components/Navbar";
import BookingHistory from "@/components/dashboard/BookingHistory";

export default function BookingHistoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-6">
          Booking History
        </h1>
        <BookingHistory />
      </div>
    </div>
  );
}

