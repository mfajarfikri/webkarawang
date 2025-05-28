import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import id from "date-fns/locale/id";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
    id: id,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Custom styles for the calendar
const calendarStyles = {
    height: "calc(100vh - 200px)",
    minHeight: "600px",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1rem",
    boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
};

const eventStyles = {
    style: {
        backgroundColor: "#2563eb",
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        padding: "2px 5px",
        fontSize: "0.875rem",
        fontWeight: "500",
    },
};

// Custom toolbar component
const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
        toolbar.onNavigate("NEXT");
    };

    const goToCurrent = () => {
        toolbar.onNavigate("TODAY");
    };

    const viewNames = {
        month: "Bulan",
        week: "Minggu",
        day: "Hari",
        agenda: "Agenda",
    };

    return (
        <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
            <div className="flex gap-2">
                <button
                    onClick={goToBack}
                    className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                    Sebelumnya
                </button>
                <button
                    onClick={goToNext}
                    className="px-3 py-1 bg-white border border-gray-200 rounded hover:bg-gray-50"
                >
                    Selanjutnya
                </button>
                <button
                    onClick={goToCurrent}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Hari Ini
                </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
                {toolbar.label}
            </h2>
            <div className="flex gap-2">
                {toolbar.views.map((view) => (
                    <button
                        key={view}
                        onClick={() => toolbar.onView(view)}
                        className={`px-3 py-1 rounded ${
                            toolbar.view === view
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {viewNames[view]}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function Anomali() {
    const [events, setEvents] = useState([
        {
            title: "Rapat Tim",
            start: new Date(2025, 5, 28, 10, 0),
            end: new Date(2025, 5, 28, 11, 30),
            backgroundColor: "#2563eb",
            category: "Meeting",
        },
        {
            title: "Presentasi Proyek",
            start: new Date(2025, 5, 29, 14, 0),
            end: new Date(2025, 5, 29, 15, 30),
            backgroundColor: "#059669",
            category: "Presentasi",
        },
        {
            title: "Meeting dengan Klien",
            start: new Date(2025, 5, 30, 9, 0),
            end: new Date(2025, 5, 30, 10, 0),
            backgroundColor: "#7c3aed",
            category: "Klien",
        },
    ]);

    const handleSelect = ({ start, end }) => {
        const title = window.prompt("Masukkan judul event:");
        if (title) {
            setEvents([
                ...events,
                {
                    title,
                    start,
                    end,
                    backgroundColor: "#2563eb",
                    category: "Umum",
                },
            ]);
        }
    };

    return (
        <HomeLayout>
            <Head title="Jadwal Anomali" />
            <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
                <div className="w-full mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                                Jadwal Anomali & Har
                            </h1>
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={calendarStyles}
                                selectable
                                onSelectSlot={handleSelect}
                                views={["month", "week", "day", "agenda"]}
                                defaultView="month"
                                min={new Date(2024, 0, 1, 8, 0)}
                                max={new Date(2024, 0, 1, 18, 0)}
                                messages={{
                                    next: "Selanjutnya",
                                    previous: "Sebelumnya",
                                    today: "Hari Ini",
                                    month: "Bulan",
                                    week: "Minggu",
                                    day: "Hari",
                                    agenda: "Agenda",
                                    date: "Tanggal",
                                    time: "Waktu",
                                    event: "Event",
                                    noEventsInRange:
                                        "Tidak ada jadwal untuk periode ini",
                                    showMore: (total) => `+${total} lagi`,
                                }}
                                eventPropGetter={(event) => ({
                                    style: {
                                        ...eventStyles.style,
                                        backgroundColor:
                                            event.backgroundColor || "#2563eb",
                                    },
                                })}
                                components={{
                                    toolbar: CustomToolbar,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
