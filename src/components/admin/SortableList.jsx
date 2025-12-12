import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

export default function SortableList({ 
  items, 
  onReorder, 
  renderItem, 
  keyField = 'id',
  direction = 'vertical',
  className
}) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, reorderedItem);

    onReorder(newItems);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sortable-list" direction={direction}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={cn("w-full", className)}
          >
            {items.map((item, index) => (
              <Draggable 
                key={String(item[keyField])} 
                draggableId={String(item[keyField])} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "mb-2 transition-all", 
                      snapshot.isDragging && "opacity-80 scale-[1.02] z-50 shadow-xl"
                    )}
                    style={{
                        ...provided.draggableProps.style,
                        left: 'auto !important',
                        top: 'auto !important'
                    }}
                  >
                    <div {...provided.dragHandleProps} className="h-full">
                      {renderItem(item, index, provided.dragHandleProps)}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}