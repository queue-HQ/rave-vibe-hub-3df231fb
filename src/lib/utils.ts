import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function checkEventStatus(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "unknown";
    // Current Pakistan time
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }));

    // Convert dateStr to Pakistan date (without time)
    const eventDate = new Date(dateStr);
    const eventYear = eventDate.getFullYear();
    const eventMonth = eventDate.getMonth();
    const eventDay = eventDate.getDate();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  console.log(today)

    if (today < new Date(eventYear, eventMonth, eventDay)) return "upcoming";
    if (today > new Date(eventYear, eventMonth, eventDay)) return "past";

    // If date is today, check time
    const [startTimeStr, endTimeStr] = timeStr.split(" - ");

    function getDateTime(dateObj, timeStr) {
        const [timePart, meridian] = timeStr.trim().split(" ");
        let [hours, minutes] = timePart.split(":").map(Number);
        if (meridian === "PM" && hours !== 12) hours += 12;
        if (meridian === "AM" && hours === 12) hours = 0;

        const dt = new Date(dateObj);
        dt.setHours(hours, minutes, 0, 0);
        return dt;
    }

    let startDateTime = getDateTime(eventDate, startTimeStr);
    let endDateTime = getDateTime(eventDate, endTimeStr);

    // Handle overnight event
    if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
    }

    if (now < startDateTime) return "upcoming";
    if (now > endDateTime) return "past";
    return "ongoing";
}


export function getInitials(fullName) {
    if (!fullName) return "";

    // Remove extra spaces
    const parts = fullName
        .trim()
        .split(" ")
        .filter(p => p.length > 0);

    const first = parts[0]?.charAt(0).toUpperCase() || "";
    const last = parts[parts.length - 1]?.charAt(0).toUpperCase() || "";

    return first + last;
}