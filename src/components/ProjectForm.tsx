import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Project, ProjectItem } from '../types/Payment';
import { useTheme } from '../hooks/useTheme';

interface ProjectFormProps {
  onAddProject: (project: Omit<Project, 'id' | 'createdAt' | 'totalAmount'>) => void;
  onClose: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onAddProject, onClose }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [items, setItems] = useState<Omit<ProjectItem, 'id' | 'isSelected' | 'isCompleted'>[]>([]);
  const [currentItem, setCurrentItem] = useState({
    name: '',
    amount: '',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || items.length === 0) {
      return;
    }

    const project: Omit<Project, 'id' | 'createdAt' | 'totalAmount'> = {
      name: formData.name,
      description: formData.description,
      items: items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        isSelected: false,
        isCompleted: false
      }))
    };

    onAddProject(project);
    onClose();
  };

  const addItem = () => {
    if (!currentItem.name || !currentItem.amount) return;

    const newItem = {
      name: currentItem.name,
      amount: parseFloat(currentItem.amount),
      note: currentItem.note
    };

    setItems([...items, newItem]);
    setCurrentItem({ name: '', amount: '', note: '' });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const inputStyle = {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderColor: theme.colors.border
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: theme.colors.surface }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-xl font-bold"
            style={{ color: theme.colors.text }}
          >
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
            style={{ 
              backgroundColor: theme.colors.error + '20',
              color: theme.colors.error 
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
                required
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.textSecondary }}
              >
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
              />
            </div>
          </div>

          {/* Add Item Section */}
          <div 
            className="p-4 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border 
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: theme.colors.text }}
            >
              Add Items
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                placeholder="Item name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
              />
              
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Amount (£)"
                value={currentItem.amount}
                onChange={(e) => setCurrentItem({ ...currentItem, amount: e.target.value })}
                className="px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
              />
              
              <input
                type="text"
                placeholder="Note (optional)"
                value={currentItem.note}
                onChange={(e) => setCurrentItem({ ...currentItem, note: e.target.value })}
                className="px-3 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                style={{
                  ...inputStyle,
                  focusRingColor: theme.colors.primary
                }}
              />
            </div>
            
            <button
              type="button"
              onClick={addItem}
              className="w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: theme.colors.secondary + '20',
                color: theme.colors.secondary
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div>
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: theme.colors.text }}
              >
                Project Items ({items.length})
              </h3>
              
              <div className="space-y-2 mb-4">
                {items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border 
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
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
                          className="text-sm mt-1"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {item.note}
                        </p>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 rounded-lg transition-all duration-200 hover:bg-opacity-20"
                      style={{
                        backgroundColor: theme.colors.error + '20',
                        color: theme.colors.error
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div 
                className="p-4 rounded-lg border text-center"
                style={{ 
                  backgroundColor: theme.colors.primary + '10',
                  borderColor: theme.colors.primary + '30'
                }}
              >
                <span 
                  className="text-lg font-bold"
                  style={{ color: theme.colors.primary }}
                >
                  Total: £{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!formData.name || items.length === 0}
            className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#FFFFFF'
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;