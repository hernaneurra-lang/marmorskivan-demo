import React, { useEffect } from "react";
import BookingCalendar from "./BookingCalendar";
import "./BookingCalendar.css";

const App: React.FC = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://marmorskivan.se/";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      <h1>Boka tid</h1>

      <p style={{ maxWidth: 600, margin: "0 auto 1.5rem", textAlign: "center" }}>
        Du skickas tillbaka till{" "}
        <strong>marmorskivan.se</strong> där du kan läsa mer om alla våra material
        i väntan på din beställning.
      </p>

      <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280" }}>
        Omdirigering sker automatiskt inom 5 sekunder…
      </p>

      <BookingCalendar />
    </div>
  );
};

export default App;
