import React, { useState } from 'react';
import { Edit, Trash2, Package, Plus, Check, CheckCircle, X } from 'lucide-react';
import { Project } from '../types/Payment';
import { useTheme } from '../hooks/useTheme';
import DueDateSelector from './DueDateSelector';

interface ProjectTileProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onAddToPayments: (selectedItems: { name: string; amount: number; note: string; dueDate: string }[]) => void;
  onToggleItemSelection: (projectId: string, itemId: string) => void;
  onToggleItemCompletion: (projectId: string, itemId: string) => void;
}

const ProjectTile: React.FC<ProjectTileProps> = ({ 
  project, 
  onEdit, 
  onDelete, 
  onAddToPayments,
  onToggleItemSelection,
  onToggleItemCompletion
}) => {
  const { theme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSelectiveAdd, setShowSelectiveAdd] = useState(false);
  const [tempSelectedItems, setTempSelectedItems] = useState<Set<string>>(new Set());
  const [showDueDateSelector, setShowDueDateSelector] = useState(false);
  const [pendingItems, setPendingItems] = useState<{ name: string; amount: number; note: string }[]>([]);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(project.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const selectedItems = project.items.filter(item => item.isSelected && !item.isCompleted);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const completedItems = project.items.filter(item => item.isCompleted);
  const remainingItems = project.items.filter(item => !item.isCompleted);
  const remainingTotal = remainingItems.reduce((sum, item) => sum + item.amount, 0);
  const completedTotal = completedItems.reduce((sum, item) => sum + item.amount, 0);

  const triggerSuccessAnimation = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);
  };

  const handleSelectAll = () => {
    const allSelected = remainingItems.every(item => item.isSelected);
    remainingItems.forEach(item => {
      if (item.isSelected !== !allSelected) {
        onToggleItemSelection(project.id, item.id);
      }
    });
  };

  const handleAddSelectedToPayments = () => {
    if (selectedItems.length === 0) return;
    
    const itemsToAdd = selectedItems.map(item => ({
      name: `${project.name} - ${item.name}`,
      amount: item.amount,
      note: item.note
    }));
    
    setPendingItems(itemsToAdd);
    setShowDueDateSelector(true);
  };

  const handleAddWholeProject = () => {
    const itemsToAdd = [{
      name: project.name,
      amount: remainingTotal,
      note: project.description
    }];
    
    setPendingItems(itemsToAdd);
    setShowDueDateSelector(true);
  };

  const handleShowSelectiveAdd = () => {
    setTempSelectedItems(new Set());
    setShowSelectiveAdd(true);
  };

  const handleTempToggleSelection = (itemId: string) => {
    const newSelected = new Set(tempSelectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setTempSelectedItems(newSelected);
  };

  const handleConfirmSelectiveAdd = () => {
    if (tempSelectedItems.size === 0) return;

    const itemsToAdd = remainingItems
      .filter(item => tempSelectedItems.has(item.id))
      .map(item => ({
        name: `${project.name} - ${item.name}`,
        amount: item.amount,
        note: item.note
      }));

    setPendingItems(itemsToAdd);
    setShowSelectiveAdd(false);
    setTempSelectedItems(new Set());
    setShowDueDateSelector(true);
  };

  const handleConfirmDueDate = (itemsWithDueDate: { name: string; amount: number; note: string; dueDate: string }[]) => {
    // Add to payments first
    onAddToPayments(itemsWithDueDate);
    
    // Close the due date selector immediately
    setShowDueDateSelector(false);
    setPendingItems([]);
    
    // Mark items as completed based on the type of addition
    setTimeout(() => {
      if (pendingItems.length === 1 && pendingItems[0].name === project.name) {
        // Whole project was added
        remainingItems.forEach(item => {
          onToggleItemCompletion(project.id, item.id);
        });
        triggerSuccessAnimation(`Added "${project.name}" as a single payment of £${remainingTotal.toFixed(2)}!`);
      } else if (selectedItems.length > 0 && pendingItems.length === selectedItems.length) {
        // Selected items were added
        selectedItems.forEach(item => {
          onToggleItemCompletion(project.id, item.id);
        });
        triggerSuccessAnimation(`Added ${selectedItems.length} selected item${selectedItems.length !== 1 ? 's' : ''} to payments!`);
      } else {
        // Selective items were added
        const itemNames = pendingItems.map(item => item.name.replace(`${project.name} - `, ''));
        remainingItems
          .filter(item => itemNames.includes(item.name))
          .forEach(item => {
            onToggleItemCompletion(project.id, item.id);
          });
        triggerSuccessAnimation(`Added ${pendingItems.length} selected item${pendingItems.length !== 1 ? 's' : ''} to payments!`);
      }
    }, 50);
  };

  const handleCancelDueDate = () => {
    setShowDueDateSelector(false);
    setPendingItems([]);
  };

  const tempSelectedTotal = remainingItems
    .filter(item => tempSelectedItems.has(item.id))
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div 
      className="p-6 rounded-2xl shadow-lg border backdrop-blur-sm transition-all duration-300 hover:shadow-xl relative"
      style={{
        backgroundColor: theme.colors.surface + '95',
        borderColor: theme.colors.border
      }}
    >
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-opacity-95 rounded-2xl z-10"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
              style={{ backgroundColor: theme.colors.success }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 
              className="text-lg font-bold mb-2"
              style={{ color: theme.colors.success }}
            >
              Success!
            </h3>
            <p 
              className="text-sm"
              style={{ color: theme.colors.text }}
            >
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Due Date Selector Modal */}
      {showDueDateSelector && (
        <DueDateSelector
          items={pendingItems}
          onConfirm={handleConfirmDueDate}
          onCancel={handleCancelDueDate}
        />
      )}

      {/* Selective Add Modal */}
      {showSelectiveAdd && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl z-20">
          <div 
            className="w-full max-w-md p-6 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-lg font-bold"
                style={{ color: theme.colors.text }}
              >
                Select Items to Add
              </h3>
              <button
                onClick={() => setShowSelectiveAdd(false)}
                className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
                style={{ 
                  backgroundColor: theme.colors.error + '20',
                  color: theme.colors.error 
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {remainingItems.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    tempSelectedItems.has(item.id) ? 'ring-2' : ''
                  }`}
                  style={{ 
                    borderColor: theme.colors.border,
                    backgroundColor: tempSelectedItems.has(item.id) ? theme.colors.primary + '10' : 'transparent',
                    ringColor: tempSelectedItems.has(item.id) ? theme.colors.primary : 'transparent'
                  }}
                  onClick={() => handleTempToggleSelection(item.id)}
                >
                  <div 
                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: tempSelectedItems.has(item.id) ? theme.colors.primary : theme.colors.border,
                      backgroundColor: tempSelectedItems.has(item.id) ? theme.colors.primary : 'transparent'
                    }}
                  >
                    {tempSelectedItems.has(item.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span 
                        className="font-medium"
                        style={{ color: theme.colors.text }}
                      >
                        {item.name}
                      </span>
                      <span 
                        className="font-bold"
                        style={{ color: theme.colors.primary }}
                      >
                        £{item.amount.toFixed(2)}
                      </span>
                    </div>
                    {item.note && (
                      <p 
                        className="text-xs mt-1"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {tempSelectedItems.size > 0 && (
              <div 
                className="p-3 rounded-lg border mb-4"
                style={{ 
                  backgroundColor: theme.colors.primary + '10',
                  borderColor: theme.colors.primary + '30'
                }}
              >
                <div className="text-center">
                  <span 
                    className="font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    Selected: {tempSelectedItems.size} items - £{tempSelectedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowSelectiveAdd(false)}
                className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: theme.colors.textSecondary + '20',
                  color: theme.colors.textSecondary
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelectiveAdd}
                disabled={tempSelectedItems.size === 0}
                className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.colors.success,
                  color: '#ffffff'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5" style={{ color: theme.colors.primary }} />
            <h3 
              className="text-lg font-bold"
              style={{ color: theme.colors.text }}
            >
              {project.name}
            </h3>
            {completedItems.length === project.items.length && project.items.length > 0 && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: theme.colors.success + '20',
                  color: theme.colors.success
                }}
              >
                <CheckCircle className="w-3 h-3" />
                Complete
              </div>
            )}
          </div>
          
          {project.description && (
            <p 
              className="text-sm mb-3"
              style={{ color: theme.colors.textSecondary }}
            >
              {project.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mb-3">
            <div className="flex flex-col">
              <span 
                className="text-2xl font-bold"
                style={{ color: theme.colors.primary }}
              >
                £{remainingTotal.toFixed(2)}
              </span>
              <span 
                className="text-xs"
                style={{ color: theme.colors.textSecondary }}
              >
                Remaining
              </span>
            </div>
            
            {completedItems.length > 0 && (
              <div className="flex flex-col">
                <span 
                  className="text-lg font-medium"
                  style={{ color: theme.colors.success }}
                >
                  £{completedTotal.toFixed(2)}
                </span>
                <span 
                  className="text-xs"
                  style={{ color: theme.colors.success }}
                >
                  Completed
                </span>
              </div>
            )}
            
            <span 
              className="text-sm px-2 py-1 rounded-full"
              style={{
                backgroundColor: theme.colors.secondary + '20',
                color: theme.colors.secondary
              }}
            >
              {remainingItems.length}/{project.items.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setShowItems(!showItems)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
          style={{
            backgroundColor: theme.colors.primary + '20',
            color: theme.colors.primary
          }}
        >
          <Package className="w-4 h-4" />
          {showItems ? 'Hide Items' : 'Show Items'}
        </button>

        {remainingItems.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
            style={{
              backgroundColor: theme.colors.secondary + '20',
              color: theme.colors.secondary
            }}
          >
            <Check className="w-4 h-4" />
            {remainingItems.every(item => item.isSelected) ? 'Unselect All' : 'Select All'}
          </button>
        )}

        {remainingTotal > 0 && (
          <button
            onClick={handleAddWholeProject}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
            style={{
              backgroundColor: theme.colors.success + '20',
              color: theme.colors.success
            }}
          >
            <Plus className="w-4 h-4" />
            Add as Single Payment (£{remainingTotal.toFixed(2)})
          </button>
        )}

        {remainingItems.length > 1 && (
          <button
            onClick={handleShowSelectiveAdd}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
            style={{
              backgroundColor: theme.colors.warning + '20',
              color: theme.colors.warning
            }}
          >
            <Plus className="w-4 h-4" />
            Add Items Separately
          </button>
        )}

        {selectedItems.length > 0 && (
          <button
            onClick={handleAddSelectedToPayments}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:scale-105 animate-pulse"
            style={{
              backgroundColor: theme.colors.secondary + '20',
              color: theme.colors.secondary
            }}
          >
            <Plus className="w-4 h-4" />
            Add Selected (£{selectedTotal.toFixed(2)})
          </button>
        )}
      </div>

      {/* Items List */}
      {showItems && (
        <div 
          className="mb-4 p-4 rounded-lg border animate-fadeIn"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          <h4 
            className="font-semibold mb-3"
            style={{ color: theme.colors.text }}
          >
            Project Items
          </h4>
          
          <div className="space-y-2">
            {project.items.map(item => (
              <div 
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                  item.isCompleted ? 'opacity-60' : ''
                } ${item.isSelected ? 'ring-2' : ''}`}
                style={{ 
                  borderColor: item.isCompleted ? theme.colors.success : theme.colors.border,
                  backgroundColor: item.isCompleted ? theme.colors.success + '10' : 'transparent',
                  ringColor: item.isSelected ? theme.colors.primary : 'transparent'
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  {!item.isCompleted && (
                    <button
                      onClick={() => onToggleItemSelection(project.id, item.id)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        borderColor: item.isSelected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: item.isSelected ? theme.colors.primary : 'transparent'
                      }}
                    >
                      {item.isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span 
                        className={`font-medium ${item.isCompleted ? 'line-through' : ''}`}
                        style={{ color: theme.colors.text }}
                      >
                        {item.name}
                      </span>
                      <span 
                        className={`font-bold ${item.isCompleted ? 'line-through' : ''}`}
                        style={{ color: item.isCompleted ? theme.colors.success : theme.colors.primary }}
                      >
                        £{item.amount.toFixed(2)}
                      </span>
                      {item.isCompleted && (
                        <div 
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: theme.colors.success + '20',
                            color: theme.colors.success
                          }}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Added to Payments
                        </div>
                      )}
                    </div>
                    {item.note && (
                      <p 
                        className={`text-xs mt-1 ${item.isCompleted ? 'line-through' : ''}`}
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {item.note}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onToggleItemCompletion(project.id, item.id)}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-20 hover:scale-110"
                    style={{
                      backgroundColor: item.isCompleted 
                        ? theme.colors.textSecondary + '20'
                        : theme.colors.success + '20',
                      color: item.isCompleted 
                        ? theme.colors.textSecondary
                        : theme.colors.success
                    }}
                    title={item.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.colors.border }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(project)}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-20 hover:scale-110"
            style={{
              backgroundColor: theme.colors.primary + '20',
              color: theme.colors.primary
            }}
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-all duration-200 hover:bg-opacity-20 hover:scale-110 ${
              showDeleteConfirm ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: theme.colors.error + '20',
              color: theme.colors.error
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <span 
          className="text-xs"
          style={{ color: theme.colors.textSecondary }}
        >
          Created {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>

      {showDeleteConfirm && (
        <div 
          className="mt-3 p-3 rounded-lg text-sm text-center font-medium animate-pulse"
          style={{
            backgroundColor: theme.colors.error + '10',
            color: theme.colors.error
          }}
        >
          Click delete again to confirm removal
        </div>
      )}
    </div>
  );
};

export default ProjectTile;