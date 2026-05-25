import { useEffect, useRef } from "react";
import { useApp } from "../../store/AppContext";

export default function GenericModal() {
  const { modal, closeModal, isDarkMode } = useApp();
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);

  if (!modal) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) closeModal(); }}
    >
      <div className={`w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
        <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
          <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>{modal.title}</h3>
          <button
            onClick={closeModal}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${isDarkMode ? "bg-slate-700 hover:bg-slate-600 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-500"}`}
          >
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{modal.body}</div>
      </div>
    </div>
  );
}
