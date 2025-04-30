import HomeLayout from "@/Layouts/HomeLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import Calendar from "tui-calendar";
import "tui-calendar/dist/tui-calendar.min.css";
import "tui-date-picker/dist/tui-date-picker.min.css";
import "tui-time-picker/dist/tui-time-picker.min.css";

export default function RuangRapat() {
    const calendarRef = useRef(null);

    useEffect(() => {
        const calendar = new Calendar(calendarRef.current, {
            defaultView: "month",
            taskView: false,
            scheduleView: ["time"],
            useCreationPopup: true,
            useDetailPopup: true,
            isReadOnly: false, // 🔥 ini penting untuk memungkinkan resize/drag
            template: {
                time: (schedule) =>
                    `<span style="color: black; font-weight: 600">${schedule.title}</span>`,
            },
            theme: {
                "common.backgroundColor": "#f9fafb",
                "common.border": "#e5e7eb",
                "week.dayname.height": "40px",
                "week.today.color": "#2563eb",
                "week.schedule.borderRadius": "10px",
                "week.currentTime.color": "#dc2626",
                "week.timegridCurrentTime.line.color": "#dc2626",
            },
        });

        calendar.createSchedules([
            {
                id: "1",
                calendarId: "work",
                title: "Meeting Proyek Alpha",
                category: "time",
                location: "Ruang Rapat A",
                start: "2025-04-30T09:00:00+07:00",
                end: "2025-04-30T10:30:00+07:00",
                isAllDay: false,
                bgColor: "#3b82f6",
                dragBgColor: "#3b82f6",
                borderColor: "#2563eb",
                color: "#ffffff",
            },
            {
                id: "2",
                calendarId: "personal",
                title: "Checkup Tahunan",
                category: "time",
                location: "RS Sehat Sentosa",
                start: "2025-05-02T08:00:00+07:00",
                end: "2025-05-02T09:00:00+07:00",
                isAllDay: false,
                bgColor: "#10b981",
                dragBgColor: "#10b981",
                borderColor: "#059669",
                color: "#ffffff",
            },
        ]);

        // 🎯 Event saat jadwal di-resize atau digeser
        calendar.on("beforeUpdateSchedule", function (event) {
            const { schedule, changes } = event;

            calendar.updateSchedule(schedule.id, schedule.calendarId, {
                ...schedule,
                ...changes,
            });

            // 🔧 Optional: kirim ke backend pakai axios/fetch kalau ingin disimpan
            console.log("Updated schedule:", {
                id: schedule.id,
                ...changes,
            });
        });
    }, []);

    return (
        <>
            <Head title="Rapat" />
            <HomeLayout>
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 pt-4">
                    <div className="col-span-1">
                        <div className="max-w-4xl h-[70vh]">
                            <div className="mx-4 border rounded-lg shadow-md border-gray-500">
                                <div
                                    className="p-2 h-full max-w-4xl"
                                    ref={calendarRef}
                                ></div>
                            </div>
                            <div className=""></div>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="mx-4 mb-10">
                            Lorem ipsum, dolor sit amet consectetur adipisicing
                            elit. Dolore corporis corrupti, iusto atque alias
                            animi. Nihil obcaecati dolores sequi facere ad
                            mollitia ullam alias deserunt eos quas iure corporis
                            nam temporibus similique natus hic incidunt
                            explicabo, velit tempore nemo vero libero.
                            Consectetur cum eos officia dolorum, laborum
                            necessitatibus repellat ullam laudantium repudiandae
                            nulla dignissimos ipsa, porro eveniet ipsum facere
                            iste expedita similique id! Ullam, maiores dolore?
                            Dolorum impedit labore ipsa harum quae possimus
                            velit similique a voluptates, perspiciatis dolore,
                            iure dolor nesciunt laborum distinctio! Ducimus quae
                            corporis eligendi officia vel quis! Dolores tenetur
                            error eum a modi aperiam nulla distinctio ipsa
                            laudantium? Debitis placeat enim perspiciatis
                            voluptate cumque doloribus non nemo ducimus ex
                            temporibus. Nesciunt error voluptas numquam
                            laudantium, porro ut asperiores ipsam mollitia
                            necessitatibus reprehenderit earum, rem tenetur
                            ratione maxime facilis autem ad unde. Reprehenderit,
                            perferendis deserunt. Odit accusamus quod doloribus
                            vel ipsum sit vitae, iste molestiae tempora,
                            mollitia qui a! Voluptate cum id modi illum iure
                            facere deserunt magni unde adipisci dolorum. Dolores
                            illum beatae aperiam quos accusantium veniam ducimus
                            laboriosam officiis, doloremque sunt corrupti
                            magnam. Placeat, nobis. Deserunt sequi eaque
                            adipisci provident sit explicabo voluptas vero unde!
                            Laboriosam explicabo facere atque ipsa eligendi quo
                            quasi perspiciatis doloremque, labore fuga vel aut
                            sunt ex quod consequatur? Veritatis culpa
                            exercitationem commodi saepe necessitatibus quaerat
                            aliquid fugiat recusandae ullam vero eligendi iste
                            perspiciatis quibusdam, aliquam distinctio
                            consequuntur? At labore inventore, minima, similique
                            nemo nostrum ab enim omnis voluptates dolorem
                            provident vitae eius necessitatibus accusamus,
                            aspernatur dolore possimus magni temporibus! Eius,
                            nisi vitae debitis quas quae illo, neque suscipit
                            voluptatibus voluptate, deserunt dicta quis impedit
                            veritatis ullam ab aut architecto doloribus sit
                            labore ipsa natus quod voluptatem? Quaerat
                            voluptates adipisci esse, aut, officia aperiam ut
                            commodi cupiditate voluptatum exercitationem
                            aspernatur possimus est tempora qui, vel delectus.
                            Magnam molestiae debitis excepturi sequi, tenetur
                            asperiores, eius inventore numquam rerum, possimus
                            pariatur adipisci eaque voluptatem vel quae. Ut,
                            velit fugit fuga itaque reprehenderit non sed sit
                            provident et harum eos consequatur voluptatibus
                            tenetur ex commodi reiciendis impedit incidunt,
                            cumque a autem nulla corrupti. Dignissimos placeat
                            dolore iure similique eligendi quasi itaque error
                            nostrum nesciunt harum quaerat eos, nobis reiciendis
                            explicabo enim praesentium cum facere qui blanditiis
                            libero quo numquam labore. Est ipsam
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </>
    );
}
