import { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Package } from 'lucide-react';
import { menuDB, categoriesDB, availabilityHistoryDB } from '../../lib/db';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { formatPrice } from '../../utils/format';
import { ItemStatusBadge } from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import type { MenuItem, ItemStatus } from '../../types';
import { nanoid } from '../../utils/nanoid';
import toast from 'react-hot-toast';

interface ItemForm {
  name: string;
  category_id: string;
  description: string;
  price: number;
  image_url: string;
  available_quantity: number;
  preparation_time: number;
  status: ItemStatus;
  is_popular: boolean;
  is_featured: boolean;
}

const EMPTY_FORM: ItemForm = {
  name: '', category_id: 'cat-1', description: '', price: 0,
  image_url: '', available_quantity: 20, preparation_time: 8,
  status: 'available', is_popular: false, is_featured: false,
};

export default function MenuManagementPage() {
  const { user } = useAuthStore();
  const { refreshMenu } = useAppStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [, setVersion] = useState(0);

  const allItems = menuDB.getAll();
  const categories = categoriesDB.getAll();

  const filtered = allItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? 'cat-1' });
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      category_id: item.category_id,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      available_quantity: item.available_quantity,
      preparation_time: item.preparation_time,
      status: item.status,
      is_popular: item.is_popular,
      is_featured: item.is_featured,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (form.price <= 0) return toast.error('Price must be positive');

    if (editing) {
      const oldItem = menuDB.getById(editing.id);
      menuDB.update(editing.id, form);
      if (oldItem && (oldItem.status !== form.status || oldItem.available_quantity !== form.available_quantity)) {
        availabilityHistoryDB.create({
          id: `av-${nanoid(8)}`,
          item_id: editing.id,
          item_name: form.name,
          old_status: oldItem.status,
          new_status: form.status,
          old_quantity: oldItem.available_quantity,
          new_quantity: form.available_quantity,
          changed_by: user?.id ?? 'manager',
          changed_at: new Date().toISOString(),
        });
      }
      toast.success('Item updated');
    } else {
      const newItem: MenuItem = {
        id: `item-${nanoid(8)}`,
        ...form,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      menuDB.create(newItem);
      toast.success('Item created');
    }
    setShowModal(false);
    refreshMenu();
    setVersion((v) => v + 1);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    menuDB.delete(id);
    refreshMenu();
    setVersion((v) => v + 1);
    toast.success('Item deleted');
  };

  const toggleAvailability = (item: MenuItem) => {
    const newStatus: ItemStatus = item.status === 'temporarily_unavailable' ? 'available' : 'temporarily_unavailable';
    const oldItem = { ...item };
    menuDB.update(item.id, { status: newStatus });
    availabilityHistoryDB.create({
      id: `av-${nanoid(8)}`,
      item_id: item.id,
      item_name: item.name,
      old_status: oldItem.status,
      new_status: newStatus,
      old_quantity: oldItem.available_quantity,
      new_quantity: item.available_quantity,
      changed_by: user?.id ?? 'manager',
      changed_at: new Date().toISOString(),
    });
    refreshMenu();
    setVersion((v) => v + 1);
    toast.success(`${item.name} ${newStatus === 'available' ? 'enabled' : 'disabled'}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="section-title">Menu Management</h1>
          <p className="section-subtitle">{allItems.length} items total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
        <input
          type="search" placeholder="Search items..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-beige">
              <tr>
                {['Item', 'Category', 'Price', 'Qty', 'Prep', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t hover:bg-beige/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url} alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'; }}
                      />
                      <div>
                        <div className="font-medium text-charcoal">{item.name}</div>
                        {item.is_popular && <span className="text-xs text-primary">★ Popular</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-500">
                    {categories.find((c) => c.id === item.category_id)?.name ?? item.category_id}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3">
                    <span className={item.available_quantity <= 5 ? 'text-red-500 font-semibold' : ''}>
                      {item.available_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-500">{item.preparation_time}m</td>
                  <td className="px-4 py-3"><ItemStatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleAvailability(item)} className="btn-ghost p-1.5" title="Toggle availability">
                        {item.status === 'temporarily_unavailable'
                          ? <ToggleLeft className="h-4 w-4 text-charcoal-400" />
                          : <ToggleRight className="h-4 w-4 text-seagreen" />
                        }
                      </button>
                      <button onClick={() => openEdit(item)} className="btn-ghost p-1.5">
                        <Edit2 className="h-4 w-4 text-charcoal-500" />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.name)} className="btn-ghost p-1.5">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-charcoal-400">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No items found
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Menu Item' : 'Add Menu Item'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Item Name *</label>
              <input className="input" placeholder="e.g. Classic Chicken Burger"
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ItemStatus }))}>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="sold_out">Sold Out</option>
                <option value="temporarily_unavailable">Temporarily Unavailable</option>
              </select>
            </div>
            <div>
              <label className="label">Price (Rs.) *</label>
              <input type="number" min={0} className="input" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))} />
            </div>
            <div>
              <label className="label">Available Quantity</label>
              <input type="number" min={0} className="input" value={form.available_quantity}
                onChange={(e) => setForm((f) => ({ ...f, available_quantity: +e.target.value }))} />
            </div>
            <div>
              <label className="label">Preparation Time (min)</label>
              <input type="number" min={1} className="input" value={form.preparation_time}
                onChange={(e) => setForm((f) => ({ ...f, preparation_time: +e.target.value }))} />
            </div>
            <div>
              <label className="label">Image URL</label>
              <input type="url" className="input" placeholder="https://..." value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea rows={2} className="input resize-none" placeholder="Brief description..." value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="popular" checked={form.is_popular}
                onChange={(e) => setForm((f) => ({ ...f, is_popular: e.target.checked }))}
                className="rounded accent-primary h-4 w-4"
              />
              <label htmlFor="popular" className="text-sm font-medium text-charcoal">Popular Item</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.is_featured}
                onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                className="rounded accent-primary h-4 w-4"
              />
              <label htmlFor="featured" className="text-sm font-medium text-charcoal">Featured Item</label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">
              {editing ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


