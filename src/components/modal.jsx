export default function Modal({ title, onClose, children, maxWidth = "max-w-4xl" }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl overflow-hidden w-full ${maxWidth} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold truncate pr-3">{title}</h3>
          <button
            className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600"
            onClick={onClose}
            title="Stäng"
          >
            Stäng ✕
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto">{children}</div>
      </div>
    </div>
  );
}
