// import { RecordEvent } from "@/types";

// export function RecordEventTimeline({ events }: { events: RecordEvent[] }) {
//   return (
//     <ol className="space-y-4">
//       {events.map((event) => (
//         <li key={event.id} className="border-l border-hairline pl-4 relative">
//           <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber" />
//           <div className="text-xs font-mono text-muted mb-1">
//             {new Date(event.created_at).toLocaleString()} · {event.type}
//           </div>
//           <EventBody event={event} />
//         </li>
//       ))}
//     </ol>
//   );
// }

// function EventBody({ event }: { event: RecordEvent }) {
//   const payloadObject =
//     typeof event.payload === "object" && event.payload !== null && !Array.isArray(event.payload)
//       ? event.payload
//       : {};

//   switch (event.type) {
//     case "screenshot":
//       return (
//         // eslint-disable-next-line @next/next/no-img-element
//         <img
//           src={(payloadObject as Record<string, unknown>).url as string}
//           alt="Bug screenshot"
//           className="rounded-lg border border-hairline max-w-md max-h-24"
//         />
//       );
//     case "video":
//       return (
//         <video
//           src={(payloadObject as Record<string, unknown>).url as string}
//           controls
//           className="rounded-lg border border-hairline max-w-md max-h-34"
//         />
//       );
//     case "note":
//     case "comment":
//       return <p className="text-text">{(payloadObject as Record<string, unknown>).text as string}</p>;
//     case "status_change":
//       return (
//         <p className="text-muted font-mono text-sm">
//           status → {(payloadObject as Record<string, unknown>).to as string}
//         </p>
//       );
//     default:
//       return null;
//   }
// }







import { RecordEvent } from "@/types";
import { useState } from "react";

export function RecordEventTimeline({ events }: { events: RecordEvent[] }) {
  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="border-l border-hairline pl-4 relative">
          <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber" />
          <div className="text-xs font-mono text-muted mb-1">
            {new Date(event.created_at).toLocaleString()} · {event.type}
          </div>
          <EventBody event={event} />
        </li>
      ))}
    </ol>
  );
}

function EventBody({ event }: { event: RecordEvent }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const payloadObject =
    typeof event.payload === "object" && event.payload !== null && !Array.isArray(event.payload)
      ? event.payload
      : {};

  const toggleExpand = () => setIsExpanded(!isExpanded);

  switch (event.type) {
    case "screenshot":
      const imgUrl = (payloadObject as Record<string, unknown>).url as string;
      return (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt="Bug screenshot"
            className={`rounded-lg border border-hairline cursor-pointer transition-all duration-200 hover:opacity-90 ${
              isExpanded ? "max-w-md max-h-24" : "max-w-md max-h-24"
            }`}
            onClick={toggleExpand}
          />
       
          {isExpanded && (
            <div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
              onClick={toggleExpand}
            >
              <img
                src={imgUrl}
                alt="Bug screenshot expanded"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                onClick={toggleExpand}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      );
    case "video":
      const videoUrl = (payloadObject as Record<string, unknown>).url as string;
      return (
        <div className="relative">
          <video
            src={videoUrl}
            controls
            className={`rounded-lg border border-hairline cursor-pointer transition-all duration-200 ${
              isExpanded ? "max-w-md max-h-24" : "max-w-md max-h-24"
            }`}
            onClick={toggleExpand}
          />
         
          {isExpanded && (
            <div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer"
              onClick={toggleExpand}
            >
              <video
                src={videoUrl}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2"
                onClick={toggleExpand}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      );
    case "note":
    case "comment":
      return <p className="text-text">{(payloadObject as Record<string, unknown>).text as string}</p>;
    case "status_change":
      return (
        <p className="text-muted font-mono text-sm">
          status → {(payloadObject as Record<string, unknown>).to as string}
        </p>
      );
    default:
      return null;
  }
}