import React from "react";

export default function SortableList({ items = [], renderItem }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id ?? item.key ?? JSON.stringify(item)}>
          {renderItem ? renderItem(item) : null}
        </div>
      ))}
    </div>
  );
}
