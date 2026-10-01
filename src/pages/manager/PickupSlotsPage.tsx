import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Users } from 'lucide-react';
import { slotsDB } from '../../lib/db';
import Modal from '../../components/ui/Modal';
import type { PickupSlot, SlotStatus } from '../../types';
import { nanoid } from '../../utils/nanoid';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface SlotForm {
  start_time: string;
  end_time: string;
  maximum_orders: number;
  is_active: boolean;
}

const EMPTY_FORM: SlotForm = { start_time: '12:00', end_time: '12:15', maximum_orders: 20, is_active: true };

export default function PickupSlotsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PickupSlot | null>(null);
  const [form, setForm] = useState<SlotForm>(EMPTY_FORM);
  const [_version, setVersion] = useState(0);

  const slots = slotsDB.getAll();

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (slot: PickupSlot) => {
    setEditing(slot);
    setForm({ start_time: slot.start_time, end_time: slot.end_time, maximum_orders: slot.maximum_orders, is_active: slot.is_active });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.start_time || !form.end_time) return toast.error('Times are required');
    if (editing) {
      slotsDB.update(editing.id, { ...form });
      toast.success('Slot updated');
    } else {
      slotsDB.create({
        id: `slot-${nanoid(8)}`,
        ...form,
        current_orders: 0,
        status: 'available',
      });
      toast.success('Slot created');
    }
    setShowModal(false);
    setVersion((v) => v + 1);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this slot?')) return;
    slotsDB.delete(id);
    setVersion((v) => v + 1);
    toast.success('Slot deleted');
  };

  const statusColor = (status: SlotStatus) => {
    switch (status) {
      case 'available':  return 'bg-seagreen-100 text-seagreen-600';
      case 'filling_up': return 'bg-amber-100 text-amber-700';
      case 'full':       return 'bg-red-100 text-red-600';
      case 'closed':     return 'bg-charcoal-100 text-charcoal-500';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="section-title">Pickup Slots</h1>
          <p className="section-subtitle">Manage daily pickup windows and capacity</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Slot
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot) => {
          const fill = Math.round((slot.current_orders / slot.maximum_orders) * 100);
          return (
            <div key={slot.id} className={clsx('card', !slot.is_active && 'opacity-60')}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-charcoal text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    {slot.start_time} – {slot.end_time}
                  </div>
                  <span className={`badge mt-1 ${statusColor(slot.status)}`}>
                    {slot.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(slot)} className="btn-ghost p-1.5">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(slot.id)} className="btn-ghost p-1.5">
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-charcoal-500 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Capacity
                </span>
                <span className="font-semibold text-charcoal">
                  {slot.current_orders} / {slot.maximum_orders}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all', fill >= 100 ? 'bg-red-500' : fill >= 80 ? 'bg-amber-500' : 'bg-seagreen')}
                  style={{ width: `${Math.min(fill, 100)}%` }}
                />
              </div>
              <div className="text-xs text-charcoal-400 mt-1">{fill}% full</div>

              <div className="mt-2 text-xs text-charcoal-400">
                Status: {slot.is_active ? '✓ Active' : '✗ Inactive'}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Pickup Slot' : 'Add Pickup Slot'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time</label>
              <input type="time" className="input" value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" className="input" value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Maximum Orders</label>
            <input type="number" min={1} max={100} className="input" value={form.maximum_orders}
              onChange={(e) => setForm((f) => ({ ...f, maximum_orders: +e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="slot-active" checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="accent-primary h-4 w-4" />
            <label htmlFor="slot-active" className="text-sm font-medium text-charcoal">Active slot</label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1">
              {editing ? 'Save Changes' : 'Create Slot'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
