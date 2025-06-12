import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Save, Package, ShoppingCart, CheckCircle } from 'lucide-react';
import { Project, ProjectItem } from '../types/Payment';
import { useTheme } from '../hooks/useTheme';
import DueDateSelector from './DueDateSelector';

interface ProjectEditorProps {
  project: Project;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onAddItem: (projectId: string, item: Omit<ProjectItem, 'id' | 'isSelected' | 'isCompleted'>) => void;
  onUpdateItem: (projectId: string, itemId: string, updates: Partial<ProjectItem>) => void;
  onDeleteItem: (projectId: string, itemId: string) => void;
  onToggleItemSelection: (projectId: string, itemId: string) => void;
  onToggleItemCompletion: (projectId: string, itemId: string) => void;
  onAddToPayments: (items: { name: string; amount: number; note: string; dueDate: string }[]) => void;
  onClose: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  onUpdateProject,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleItemSelection,
  onToggleItemCompletion,
  onAddToPayments,
  onClose
}) => {
  const { theme } = useTheme();
  const [editingProjectInfo, setEditingProjectInfo] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSelectiveAdd, setShowSelectiveAdd] = useState(false);
  const [tempSelectedItems, setTempSelectedItems] = useState<Set<string>>(new Set());
  const [showDueDateSelector, setShowDueDateSelector] = useState(false);
  const [pendingItems, setPendingItems] = useState<{ name: string; amount: number; note: string }[]>([]);
  
  const [projectForm, setProjectForm] = useState({
    name: project.name,
    description: project.description
  });

  const [newItem, setNewItem] = useState({
    name: '',
    amount: '',
    note: ''
  });

  const [editItemForm, setEditItemForm] = useState({
    name: '',
    amount: '',
    note: ''
  });

  const selectedItems = project.items.filter(item => item.isSelected && !item.isCompleted);
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.amount, 0);
  const completedItems = project.items.filter(item => item.isCompleted);
  const remainingItems = project.items.filter(item => !item.isCompleted);
  const remainingTotal = remainingItems.reduce((sum, item) => sum + item.amount, 0);
  const completedTotal = completedItems.reduce((sum, item) => sum + item.amount, 0);

  const showSuccessAndReturn = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessAnimation(true);
    
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }, 2000);
  };

  const handleSaveProjectInfo = () => {
    onUpdateProject(project.id, {
      name: projectForm.name,
      description: projectForm.description
    });
    setEditingProjectInfo(false);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.amount) return;

    onAddItem(project.id, {
      name: newItem.name,
      amount: parseFloat(newItem.amount),
      note: newItem.note
    });

    setNewItem({ name: '', amount: '', note: '' });
    setShowAddItem(false);
  };

  const handleEditItem = (item: ProjectItem) => {
    setEditingItem(item.id);
    setEditItemForm({
      name: item.name,
      amount: item.amount.toString(),
      note: item.note
    });
  };

  const handleSaveItem = () => {
    if (!editingItem || !editItemForm.name || !editItemForm.amount) return;

    onUpdateItem(project.id, editingItem, {
      name: editItemForm.name,
      amount: parseFloat(editItemForm.amount),
      note: editItemForm.note
    });

    setEditingItem(null);
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
        showSuccessAndReturn(`Added "${project.name}" as a single payment of £${remainingTotal.toFixed(2)}!`);
      } else if (selectedItems.length > 0 && pendingItems.length === selectedItems.length) {
        // Selected items were added
        selectedItems.forEach(item => {
          onToggleItemCompletion(project.id, item.id);
        });
        showSuccessAndReturn(`Added ${selectedItems.length} selected item${selectedItems.length !== 1 ? 's' : ''} to payments!`);
      } else {
        // Selective items were added
        const itemNames = pendingItems.map(item => item.name.replace(`${project.name} - `, ''));
        remainingItems
          .filter(item => itemNames.includes(item.name))
          .forEach(item => {
            onToggleItemCompletion(project.id, item.id);
          });
        showSuccessAndReturn(`Added ${pendingItems.length} selected item${pendingItems.length !== 1 ? 's' : ''} to payments!`);
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

  const inputStyle = {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderColor: theme.colors.border
  };

  // Success Animation Overlay
  if (showSuccessAnimation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div 
          className="text-center p-8 rounded-2xl border animate-pulse"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.success
          }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
            style={{ backgroundColor: theme.colors.success }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: theme.colors.success }}
          >
            Success!
          </h2>
          <p 
            className="text-lg"
            style={{ color: theme.colors.text }}
          >
            {successMessage}
          </p>
          <div 
            className="mt-4 text-sm"
            style={{ color: theme.colors.textSecondary }}
          >
            Returning to projects...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

      {/* Project Header */}
      <div 
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border
        }}
      >
        {editingProjectInfo ? (
          <div className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                Project Name
              </label>
              <input
                type="text"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none"
                style={inputStyle}
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                Description
              </label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none resize-none"
                style={inputStyle}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveProjectInfo}
                className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
                style={{
                  backgroundColor: theme.colors.success,
                  color: '#ffffff'
                }}
              >
                <Save className="w-4 h-4 mr-2 inline" />
                Save
              </button>
              <button
                onClick={() => setEditingProjectInfo(false)}
                className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
                style={{
                  backgroundColor: theme.colors.error,
                  color: '#ffffff'
                }}
              >
                <X className="w-4 h-4 mr-2 inline" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6" style={{ color: theme.colors.primary }} />
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: theme.colors.text }}
                >
                  {project.name}
                </h1>
                <button
                  onClick={() => setEditingProjectInfo(true)}
                  className="p-2 rounded-lg hover:opacity-90"
                  style={{
                    backgroundColor: theme.colors.primary + '20',
                    color: theme.colors.primary
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {completedItems.length === project.items.length && project.items.length > 0 && (
                  <div 
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: theme.colors.success + '20',
                      color: theme.colors.success
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Project Complete
                  </div>
                )}
              </div>
            </div>
            
            {project.description && (
              <p 
                className="text-lg mb-4"
                style={{ color: theme.colors.textSecondary }}
              >
                {project.description}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: theme.colors.primary + '10',
                  borderColor: theme.colors.primary + '30'
                }}
              >
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    £{remainingTotal.toFixed(2)}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Remaining ({remainingItems.length} items)
                  </div>
                </div>
              </div>
              
              {completedItems.length > 0 && (
                <div 
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: theme.colors.success + '10',
                    borderColor: theme.colors.success + '30'
                  }}
                >
                  <div className="text-center">
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.success }}
                    >
                      £{completedTotal.toFixed(2)}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      Completed ({completedItems.length} items)
                    </div>
                  </div>
                </div>
              )}
              
              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: theme.colors.secondary + '10',
                  borderColor: theme.colors.secondary + '30'
                }}
              >
                <div className="text-center">
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.secondary }}
                  >
                    £{project.totalAmount.toFixed(2)}
                  </div>
                  <div 
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Total ({project.items.length} items)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddItem(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: theme.colors.primary,
            color: '#ffffff'
          }}
        >
          <Plus className="w-5 h-5" />
          Add New Item
        </button>

        {remainingItems.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.colors.secondary + '20',
              color: theme.colors.secondary
            }}
          >
            <Check className="w-5 h-5" />
            {remainingItems.every(item => item.isSelected) ? 'Unselect All' : 'Select All'}
          </button>
        )}

        {remainingTotal > 0 && (
          <button
            onClick={handleAddWholeProject}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.colors.success,
              color: '#ffffff'
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            Add as Single Payment (£{remainingTotal.toFixed(2)})
          </button>
        )}

        {remainingItems.length > 1 && (
          <button
            onClick={handleShowSelectiveAdd}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: theme.colors.warning,
              color: '#ffffff'
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            Add Items Separately
          </button>
        )}

        {selectedItems.length > 0 && (
          <button
            onClick={handleAddSelectedToPayments}
            className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 hover:scale-105 animate-pulse"
            style={{
              backgroundColor: theme.colors.secondary,
              color: '#ffffff'
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            Add Selected (£{selectedTotal.toFixed(2)})
          </button>
        )}
      </div>

      {/* Add Item Form */}
      {showAddItem && (
        <div 
          className="p-6 rounded-lg border animate-fadeIn"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          <h3 
            className="text-lg font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            Add New Item
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none"
              style={inputStyle}
            />
            
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount (£)"
              value={newItem.amount}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none"
              style={inputStyle}
            />
            
            <input
              type="text"
              placeholder="Note (optional)"
              value={newItem.note}
              onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
              className="px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none"
              style={inputStyle}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.colors.success,
                color: '#ffffff'
              }}
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Item
            </button>
            <button
              onClick={() => setShowAddItem(false)}
              className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
              style={{
                backgroundColor: theme.colors.error,
                color: '#ffffff'
              }}
            >
              <X className="w-4 h-4 mr-2 inline" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div 
        className="rounded-lg border"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border
        }}
      >
        <div 
          className="p-4 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <h3 
            className="text-lg font-bold"
            style={{ color: theme.colors.text }}
          >
            Project Items ({project.items.length})
          </h3>
        </div>
        
        <div className="p-4 space-y-3">
          {project.items.length === 0 ? (
            <div className="text-center py-8">
              <p 
                className="text-lg font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                No items yet
              </p>
              <p 
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                Add your first item to get started
              </p>
            </div>
          ) : (
            project.items.map(item => (
              <div 
                key={item.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  item.isCompleted ? 'opacity-60' : ''
                } ${item.isSelected ? 'ring-2' : ''}`}
                style={{ 
                  borderColor: item.isCompleted ? theme.colors.success : theme.colors.border,
                  backgroundColor: item.isCompleted ? theme.colors.success + '10' : 'transparent',
                  ringColor: item.isSelected ? theme.colors.primary : 'transparent'
                }}
              >
                {editingItem === item.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={editItemForm.name}
                        onChange={(e) => setEditItemForm({ ...editItemForm, name: e.target.value })}
                        className="px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none"
                        style={inputStyle}
                      />
                      
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editItemForm.amount}
                        onChange={(e) => setEditItemForm({ ...editItemForm, amount: e.target.value })}
                        className="px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none"
                        style={inputStyle}
                      />
                      
                      <input
                        type="text"
                        value={editItemForm.note}
                        onChange={(e) => setEditItemForm({ ...editItemForm, note: e.target.value })}
                        className="px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none"
                        style={inputStyle}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveItem}
                        className="px-3 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
                        style={{
                          backgroundColor: theme.colors.success,
                          color: '#ffffff'
                        }}
                      >
                        <Save className="w-4 h-4 mr-1 inline" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-3 py-2 rounded-lg font-medium hover:opacity-90 transition-all duration-200"
                        style={{
                          backgroundColor: theme.colors.error,
                          color: '#ffffff'
                        }}
                      >
                        <X className="w-4 h-4 mr-1 inline" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
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
                        <div className="flex items-center gap-3 mb-1">
                          <span 
                            className={`font-semibold ${item.isCompleted ? 'line-through' : ''}`}
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
                            className={`text-sm ${item.isCompleted ? 'line-through' : ''}`}
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleItemCompletion(project.id, item.id)}
                        className="p-2 rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-110"
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
                      
                      {!item.isCompleted && (
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-110"
                          style={{
                            backgroundColor: theme.colors.primary + '20',
                            color: theme.colors.primary
                          }}
                          title="Edit item"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDeleteItem(project.id, item.id)}
                        className="p-2 rounded-lg hover:opacity-90 transition-all duration-200 hover:scale-110"
                        style={{
                          backgroundColor: theme.colors.error + '20',
                          color: theme.colors.error
                        }}
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;