import React, { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageMeta from "../components/common/PageMeta";

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    // Aaj ki date auto-select karne ke liye
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const today = new Date();
      calendarApi.select(today);
    }
  }, []);

  return (
    <>
      <PageMeta
        title="Calendar | tryBizly"
        description="Calendar page for tryBizly"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            selectable={true}
          />
        </div>
      </div>
    </>
  );
};

export default Calendar;