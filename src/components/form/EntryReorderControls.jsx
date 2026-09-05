export default function EntryReorderControls({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragEnd,
}) {
  return (
    <div className="entry-reorder-controls">
      <button
        type="button"
        className="btn-move"
        onClick={() => onMoveUp(index)}
        disabled={index === 0}
        aria-label="Move up"
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        className="btn-move"
        onClick={() => onMoveDown(index)}
        disabled={index >= total - 1}
        aria-label="Move down"
        title="Move down"
      >
        ↓
      </button>
      <span
        className="entry-drag-handle"
        draggable
        onDragStart={(event) => onDragStart(event, index)}
        onDragEnd={onDragEnd}
        role="img"
        aria-label="Drag handle"
        title="Drag to reorder"
      >
        ⠿
      </span>
    </div>
  );
}
