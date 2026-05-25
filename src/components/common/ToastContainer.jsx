import { useApp } from "../../store/AppContext";

const COLORS = {
  success: "bg-green-600",
  error:   "bg-red-500",
  info:    "bg-amber-600",
  warning: "bg-amber-500",
};
const ICONS = {
  success: "fa-check-circle",
  error:   "fa-exclamation-circle",
  info:    "fa-info-circle",
  warning: "fa-exclamation-triangle",
};

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed top-6 right-6 z-[400] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${COLORS[t.type] || "bg-slate-800"} text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[260px] max-w-sm pointer-events-auto animate-slide-in`}
        >
          <i className={`fas ${ICONS[t.type] || "fa-info-circle"} text-lg flex-shrink-0`} />
          <span className="font-medium text-sm flex-1">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
