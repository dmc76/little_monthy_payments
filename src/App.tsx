import React, { useState, useEffect } from 'react';
import { Plus, Settings, RefreshCw, CreditCard, Package, Grid3X3, List, ArrowLeft, Download } from 'lucide-react';
import { usePayments } from './hooks/usePayments';
import { useProjects } from './hooks/useProjects';
import { useTheme } from './hooks/useTheme';
import { Payment, PaymentFilter, AppPage, Project } from './types/Payment';
import PaymentForm from './components/PaymentForm';
import EditPaymentForm from './components/EditPaymentForm';
import PaymentGroup from './components/PaymentGroup';
import TotalTile from './components/TotalTile';
import TabFilter from './components/TabFilter';
import ThemeSelector from './components/ThemeSelector';
import InstallPrompt from './components/InstallPrompt';
import ProjectForm from './components/ProjectForm';
import ProjectTile from './components/ProjectTile';
import ProjectEditor from './components/ProjectEditor';

function App() {
  const { theme, forceUpdate } = useTheme();
  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    togglePaymentComplete,
    resetForNextMonth,
    getTotalRemaining,
    getPaymentGroups,
    toggleGroupExpansion,
    groupingEnabled,
    toggleGrouping,
    reorderPayments
  } = usePayments();

  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    toggleItemSelection,
    toggleItemCompletion,
    addItemToProject,
    updateProjectItem,
    deleteProjectItem
  } = useProjects();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppPage>('payments');
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Check if app can be installed
  useEffect(() => {
    const checkInstallable = () => {
      // Show install button if not already installed and not showing automatic prompt
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
      
      if (!isInstalled) {
        // Show install button after a delay if no automatic prompt appears
        const timer = setTimeout(() => {
          setShowInstallButton(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    };

    checkInstallable();
  }, []);

  // Filter out completed payments
  const activePayments = payments.filter(payment => !payment.isCompleted);

  const filteredPayments = activePayments.filter(payment => {
    if (activeFilter === 'all') return true;
    return payment.type === activeFilter;
  });

  const getCounts = () => ({
    all: activePayments.length,
    recurring: activePayments.filter(p => p.type === 'recurring').length,
    oneOff: activePayments.filter(p => p.type === 'one-off').length
  });

  const handleAddProjectItemsToPayments = async (items: { name: string; amount: number; note: string; dueDate: string }[]) => {
    // Add all items synchronously to ensure they're all processed
    const addPromises = items.map(item => {
      return new Promise<void>((resolve) => {
        addPayment({
          name: item.name,
          amount: item.amount,
          dueDate: item.dueDate,
          type: 'one-off',
          note: item.note,
          group: 'Projects'
        });
        resolve();
      });
    });

    // Wait for all payments to be added
    await Promise.all(addPromises);
    
    console.log(`Successfully added ${items.length} payments to the system`);
  };

  const handleCreateProject = (project: Omit<Project, 'id' | 'createdAt' | 'totalAmount'>) => {
    const newProject = addProject(project);
    setShowProjectForm(false);
    // Automatically open the new project for editing
    const createdProject = projects.find(p => p.name === project.name) || 
      { ...project, id: crypto.randomUUID(), createdAt: new Date().toISOString(), totalAmount: 0 };
    setEditingProject(createdProject);
  };

  const handleUpdatePayment = (id: string, updates: Partial<Payment>) => {
    updatePayment(id, updates);
    // Close the edit form immediately after updating
    setEditingPayment(null);
  };

  // Handle adding payment and closing modal
  const handleAddPayment = (payment: Omit<Payment, 'id' | 'createdAt' | 'isCompleted'>) => {
    addPayment(payment);
    // Force close the modal immediately
    setShowPaymentForm(false);
  };

  // Get payment groups based on current filter
  const paymentGroups = getPaymentGroups().map(group => ({
    ...group,
    payments: group.payments.filter(payment => {
      if (activeFilter === 'all') return true;
      return payment.type === activeFilter;
    })
  })).filter(group => group.payments.length > 0);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // If editing a project, show the project editor
  if (editingProject) {
    return (
      <div 
        key={forceUpdate}
        className="min-h-screen"
        style={{ 
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          minHeight: '100vh'
        }}
      >
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => setEditingProject(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:opacity-90"
              style={{
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                border: `2px solid ${theme.colors.border}`
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Projects
            </button>
          </div>

          <ProjectEditor
            project={editingProject}
            onUpdateProject={updateProject}
            onAddItem={addItemToProject}
            onUpdateItem={updateProjectItem}
            onDeleteItem={deleteProjectItem}
            onToggleItemSelection={toggleItemSelection}
            onToggleItemCompletion={toggleItemCompletion}
            onAddToPayments={handleAddProjectItemsToPayments}
            onClose={() => setEditingProject(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      key={forceUpdate} // Force re-render when theme changes
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh'
      }}
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div 
          className="mb-8 p-6 rounded-2xl border"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-3xl font-bold mb-1"
                style={{ color: theme.colors.text }}
              >
                Little Monthly Payments
              </h1>
              <p 
                className="text-sm mb-3"
                style={{ color: theme.colors.textSecondary }}
              >
                by Little App Studio
              </p>
              <p 
                className="text-lg"
                style={{ color: theme.colors.textSecondary }}
              >
                {currentPage === 'payments' ? 'Track your payments and due dates' : 'Manage your projects'}
              </p>
            </div>
            
            <div className="flex gap-2">
              {showInstallButton && (
                <button
                  onClick={() => {
                    // Trigger manual install instructions
                    const event = new CustomEvent('show-install-prompt');
                    window.dispatchEvent(event);
                  }}
                  className="p-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105"
                  style={{
                    backgroundColor: theme.colors.success,
                    color: '#ffffff'
                  }}
                  title="Install App"
                >
                  <Download className="w-6 h-6" />
                </button>
              )}
              
              {currentPage === 'payments' && (
                <>
                  <button
                    onClick={toggleGrouping}
                    className="p-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: '#ffffff'
                    }}
                    title={groupingEnabled ? "Show all payments together" : "Group payments by category"}
                  >
                    {groupingEnabled ? <List className="w-6 h-6" /> : <Grid3X3 className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={resetForNextMonth}
                    className="p-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: theme.colors.secondary,
                      color: '#ffffff'
                    }}
                    title="Reset Recurring Payments for Next Month"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </>
              )}
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-3 rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#ffffff'
                }}
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentPage('payments')}
            className="flex items-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: currentPage === 'payments' 
                ? theme.colors.primary 
                : theme.colors.surface,
              color: currentPage === 'payments' 
                ? '#ffffff' 
                : theme.colors.text,
              border: `2px solid ${theme.colors.border}`
            }}
          >
            <CreditCard className="w-5 h-5" />
            Payments
          </button>
          
          <button
            onClick={() => setCurrentPage('projects')}
            className="flex items-center gap-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: currentPage === 'projects' 
                ? theme.colors.primary 
                : theme.colors.surface,
              color: currentPage === 'projects' 
                ? '#ffffff' 
                : theme.colors.text,
              border: `2px solid ${theme.colors.border}`
            }}
          >
            <Package className="w-5 h-5" />
            Projects
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div 
            className="mb-6 p-4 rounded-2xl border animate-fadeIn"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }}
          >
            <div className="flex items-center justify-between">
              <h3 
                className="font-bold"
                style={{ color: theme.colors.text }}
              >
                Theme
              </h3>
              <ThemeSelector />
            </div>
          </div>
        )}

        {/* Payments Page */}
        {currentPage === 'payments' && (
          <div>
            {/* Total Tile */}
            <div className="mb-6">
              <TotalTile total={getTotalRemaining()} />
            </div>

            {/* Tab Filter */}
            <div className="mb-6">
              <TabFilter
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                counts={getCounts()}
              />
            </div>

            {/* Add Payment Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowPaymentForm(true)}
                className="w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center hover:opacity-90 transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#ffffff'
                }}
              >
                <Plus className="w-6 h-6 mr-3" />
                Add New Payment
              </button>
            </div>

            {/* Payment Groups */}
            <div className="space-y-4">
              {paymentGroups.length === 0 ? (
                <div 
                  className="text-center py-12 rounded-2xl border"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }}
                >
                  <p 
                    className="text-lg font-medium mb-2"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    No payments found
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {activeFilter === 'all' 
                      ? 'Add your first payment to get started'
                      : `No ${activeFilter} payments yet`
                    }
                  </p>
                </div>
              ) : (
                paymentGroups.map(group => (
                  <PaymentGroup
                    key={`${group.name}-${forceUpdate}`} // Force re-render with theme
                    group={group}
                    onToggleExpansion={toggleGroupExpansion}
                    onToggleComplete={togglePaymentComplete}
                    onEdit={setEditingPayment}
                    onDelete={deletePayment}
                    onReorder={reorderPayments}
                    groupingEnabled={groupingEnabled}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Projects Page */}
        {currentPage === 'projects' && (
          <div>
            {/* Add Project Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowProjectForm(true)}
                className="w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center hover:opacity-90 transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: theme.colors.secondary,
                  color: '#ffffff'
                }}
              >
                <Plus className="w-6 h-6 mr-3" />
                Create New Project
              </button>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div 
                  className="text-center py-12 rounded-2xl border"
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border
                  }}
                >
                  <p 
                    className="text-lg font-medium mb-2"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    No projects found
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    Create your first project to get started
                  </p>
                </div>
              ) : (
                projects.map(project => (
                  <ProjectTile
                    key={`${project.id}-${forceUpdate}`} // Force re-render with theme
                    project={project}
                    onEdit={setEditingProject}
                    onDelete={deleteProject}
                    onAddToPayments={handleAddProjectItemsToPayments}
                    onToggleItemSelection={toggleItemSelection}
                    onToggleItemCompletion={toggleItemCompletion}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <PaymentForm
            key={`payment-form-${forceUpdate}`} // Force re-render with theme
            onAddPayment={handleAddPayment}
            onClose={() => setShowPaymentForm(false)}
          />
        )}

        {/* Project Form Modal */}
        {showProjectForm && (
          <ProjectForm
            key={forceUpdate} // Force re-render with theme
            onAddProject={handleCreateProject}
            onClose={() => setShowProjectForm(false)}
          />
        )}

        {/* Edit Payment Form Modal */}
        {editingPayment && (
          <EditPaymentForm
            key={`${editingPayment.id}-${forceUpdate}`} // Force re-render with theme and payment ID
            payment={editingPayment}
            onUpdatePayment={handleUpdatePayment}
            onClose={() => setEditingPayment(null)}
          />
        )}

        {/* Install Prompt */}
        <InstallPrompt key={forceUpdate} />
      </div>
    </div>
  );
}

export default App;