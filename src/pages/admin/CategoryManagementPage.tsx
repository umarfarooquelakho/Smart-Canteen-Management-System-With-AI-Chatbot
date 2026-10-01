import { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { categoriesDB } from '../../lib/db';
import Modal from '../../components/ui/Modal';
import type { Category } from '../../types';
import { nanoid } from '../../utils/nanoid';
import toast from 'react-hot-toast';

export default function CategoryManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', icon: '🍽️' });
  const [version, setVersion] = useState(0);

  const categories = categoriesDB.getAllIncludingInactive();

  const openCreate = () => { setEditing(null); setForm({ name: '', icon: '🍽️' }); setShowModal(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, icon: c.icon ?? '🍽️' }); setShowModal(true); };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Name required');
    if (editing) {
      categoriesDB.update(editing.id, { name: form.name, icon: form.icon });
      toast.success('Category updated');
    } else {
      categoriesDB.create({
        id: `cat-${nanoid(8)}`,
        name: form.name,
        icon: form.icon,
        status: 'active',
        sort_order: categories.length + 1,
        created_at: new Date().toISOString(),
      });
      toast.success('Category created');
    }
    setShowModal(false);
    setVersion((v) => v + 1);
  };

  const toggle = (c: Category) => {
    categoriesDB.update(c.id, { status: c.status === 'active' ? 'inactive' : 'active' });
    setVersion((v) => v + 1);
    toast.success(`Category ${c.status === 'active' ? 'disabled' : 'enabled'}`);
  };

  const handleDelete = (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    categoriesDB.delete(c.id);
    setVersion((v) => v + 1);
    toast.success('Category deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="section-title">Categories</h1>
          <p className="section-subtitle">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <div className="font-semibold text-charcoal">{cat.name}</div>
                <span className={`badge text-xs ${cat.status === 'active' ? 'bg-seagreen-100 text-seagreen' : 'bg-charcoal-100 text-charcoal-400'}`}>
                  {cat.status}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => toggle(cat)} className="btn-ghost p-1.5">
                {cat.status === 'active' ? <ToggleRight className="h-4 w-4 text-seagreen" /> : <ToggleLeft className="h-4 w-4 text-charcoal-400" />}
              </button>
              <button onClick={() => openEdit(cat)} className="btn-ghost p-1.5">
                <Edit2 className="h-3.5 w-3.5 text-charcoal-500" />
              </button>
              <button onClick={() => handleDelete(cat)} className="btn-ghost p-1.5">
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input type="text" className="input" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Burgers" />
          </div>
          <div>
            <label className="label">Icon (emoji)</label>
            <input type="text" className="input" value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🍔" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">{editing ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
