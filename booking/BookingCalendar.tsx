import React, { useState } from "react";
import "./BookingCalendar.css";

const weekdays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

const bookings: string[] = [
  "2025-09-22T09:00",
  "2025-09-23T13:00",
  "2025-09-24T15:00"
];

const BookingCalendar: React.FC = () => {
  const [currentMonday, setCurrentMonday] = useState<Date>(getMonday(new Date()));

  const getWeekDates = (): Date[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentMonday);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const nextWeek = () => {
    const newDate = new Date(currentMonday);
    newDate.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(newDate);
  };

  const prevWeek = () => {
    const newDate = new Date(currentMonday);
    newDate.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(newDate);
  };

  const renderTimeSlots = (date: Date) => {
    const startHour = 9;
    const endHour = 17;
    const slots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const time = new Date(date);
      time.setHours(hour, 0, 0, 0);
      const key = time.toISOString().slice(0, 16);

      const isBooked = bookings.includes(key);
      slots.push(
        <div
          key={key}
          className={`slot ${isBooked ? "booked" : "available"}`}
        >
          {time.getHours().toString().padStart(2, "0")}:00
        </div>
      );
    }

    return slots;
  };

  const weekDates = getWeekDates();
  const weekLabel = `${weekDates[0].toLocaleDateString("sv-SE")} – ${weekDates[6].toLocaleDateString("sv-SE")}`;

  return (
    <div className="calendar-container">
      <div className="header">
        <button onClick={prevWeek}>Föregående</button>
        <h2>{weekLabel}</h2>
        <button onClick={nextWeek}>Nästa</button>
      </div>

      <div className="week">
        {weekDates.map((date, index) => (
          <div key={index} className="day">
            {weekdays[index]}<br />{date.toLocaleDateString("sv-SE")}
          </div>
        ))}
      </div>

      <div className="slots">
        {weekDates.map((date, index) => (
          <React.Fragment key={index}>{renderTimeSlots(date)}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BookingCalendar;