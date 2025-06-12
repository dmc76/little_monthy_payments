import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PaymentGroup as PaymentGroupType, Payment } from '../types/Payment';
import { useTheme } from '../hooks/useTheme';
import PaymentTile from './PaymentTile';

interface PaymentGroupProps {
  group: PaymentGroupType;
  onToggleExpansion: (groupName: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  onReorder: (groupName: string, startIndex: number, endIndex: number) => void;
  groupingEnabled: boolean;
}

const PaymentGroup: React.FC<PaymentGroupProps> = ({
  group,
  onToggleExpansion,
  onToggleComplete,
  onEdit,
  onDelete,
  onReorder,
  groupingEnabled
}) => {
  const { theme } = useTheme();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex !== endIndex) {
      onReorder(group.name, startIndex, endIndex);
    }
  };

  // If grouping is disabled, don't show the header
  if (!groupingEnabled) {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={group.name}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-opacity-50' : ''
              }`}
              style={{
                backgroundColor: snapshot.isDraggingOver ? theme.colors.primary + '10' : 'transparent'
              }}
            >
              {group.payments.map((payment, index) => (
                <Draggable key={payment.id} draggableId={payment.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-transform duration-200 ${
                        snapshot.isDragging ? 'rotate-2 scale-105' : ''
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.8 : 1
                      }}
                    >
                      <PaymentTile
                        payment={payment}
                        onToggleComplete={onToggleComplete}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
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

  return (
    <div 
      className="rounded-lg border overflow-hidden"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border
      }}
    >
      {/* Group Header */}
      <button
        onClick={() => onToggleExpansion(group.name)}
        className="w-full p-4 flex items-center justify-between hover:opacity-90 transition-all duration-200"
        style={{
          backgroundColor: theme.colors.primary,
          color: '#ffffff'
        }}
      >
        <div className="flex items-center gap-3">
          {group.isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          <div className="text-left">
            <h3 className="font-bold text-lg">
              {group.name}
            </h3>
            <p className="text-sm opacity-90">
              {group.payments.length} payment{group.payments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold">
            £{group.total.toFixed(2)}
          </div>
          <div className="text-xs opacity-90">
            Total
          </div>
        </div>
      </button>

      {/* Group Content */}
      {group.isExpanded && (
        <div className="p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={group.name}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 transition-colors duration-200 rounded-lg p-2 ${
                    snapshot.isDraggingOver ? 'bg-opacity-50' : ''
                  }`}
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? theme.colors.primary + '10' : 'transparent'
                  }}
                >
                  {group.payments.map((payment, index) => (
                    <Draggable key={payment.id} draggableId={payment.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-transform duration-200 ${
                            snapshot.isDragging ? 'rotate-2 scale-105' : ''
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1
                          }}
                        >
                          <PaymentTile
                            payment={payment}
                            onToggleComplete={onToggleComplete}
                            onEdit={onEdit}
                            onDelete={onDelete}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
};

export default PaymentGroup;