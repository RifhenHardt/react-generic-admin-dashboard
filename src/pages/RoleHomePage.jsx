import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../services/mockApi';
import StatusBadge from '../components/common/StatusBadge';

const categories = ['All categories', 'Food & Drinks', 'Clothing', 'Wearable Accessories', 'Souvenirs', 'Arts & Crafts', 'Project Products'];
const loadAll = (entityName) => mockApi.getAll(entityName, { page: 1, pageSize: 200 });
const money = (value) => `₱${Number(value || 0).toFixed(2)}`;

const OrderConversation = ({ order, draft, onDraftChange, onSubmit, isSending }) => {
  const messages = Array.isArray(order.messages) ? order.messages : [];
  return (
    <div className="mt-4 border-t border-gray-100 pt-3">
      <h4 className="text-sm font-semibold text-gray-800">Messages with buyer / seller</h4>
      <div className="mt-2 space-y-2">
        {messages.map((message) => <p key={message.id} className="rounded-lg bg-gray-50 p-2 text-sm text-gray-700"><span className="font-semibold">{message.senderName}:</span> {message.text}</p>)}
        {messages.length === 0 && <p className="text-xs text-gray-500">Use this thread to coordinate event pickup and product questions.</p>}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input value={draft} onChange={onDraftChange} maxLength={500} required aria-label="Message" placeholder="Write a message about this reservation" className="input-field flex-1" />
        <button type="submit" disabled={isSending} className="rounded-md bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 disabled:opacity-50">Send</button>
      </form>
    </div>
  );
};

const RoleHomePage = ({ user }) => {
  const isSeller = user.role === 'seller';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [quantities, setQuantities] = useState({});
  const [stockDrafts, setStockDrafts] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [productDraft, setProductDraft] = useState(null);
  const [messageDrafts, setMessageDrafts] = useState({});
  const [notice, setNotice] = useState('');
  const [listingForm, setListingForm] = useState({ title: '', category: categories[1], event: '', booth: '', price: '', stock: '', description: '' });
  const { data: listingsData, isLoading: listingsLoading } = useQuery({ queryKey: ['listings', 'account-home'], queryFn: () => loadAll('listings') });
  const { data: eventsData } = useQuery({ queryKey: ['events', 'account-home'], queryFn: () => loadAll('events') });
  const { data: ordersData } = useQuery({ queryKey: ['orders', 'account-home'], queryFn: () => loadAll('orders') });
  const products = useMemo(() => listingsData?.items || [], [listingsData]);
  const events = (eventsData?.items || []).filter((event) => event.status !== 'completed');
  const orders = ordersData?.items || [];
  const teamProducts = products.filter((product) => product.sellerTeam?.trim().toLowerCase() === user.teamName?.trim().toLowerCase());
  const buyerOrders = orders.filter((order) => order.customerEmail ? order.customerEmail.toLowerCase() === user.email.toLowerCase() : order.customer === user.name);
  const sellerOrders = orders.filter((order) => order.sellerTeam?.trim().toLowerCase() === user.teamName?.trim().toLowerCase());
  const lowStockCount = teamProducts.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 5).length;
  const completedOrderValue = sellerOrders.filter((order) => order.status === 'completed').reduce((total, order) => total + Number(order.price || 0), 0);
  const awaitingOrderCount = sellerOrders.filter((order) => order.status === 'requested').length;
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.title} ${product.description} ${product.category} ${product.event} ${product.sellerTeam}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All categories' || product.category === category;
    return product.status === 'active' && Number(product.stock) > 0 && matchesSearch && matchesCategory;
  }), [products, search, category]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };
  const reserveMutation = useMutation({
    mutationFn: async ({ product, quantity }) => {
      if (user.status !== 'active') throw new Error('Your student account must be active to reserve products.');
      if (quantity < 1 || quantity > Number(product.stock)) throw new Error('Choose a quantity that is currently in stock.');
      const updated = await mockApi.update('listings', product.id, { stock: Number(product.stock) - quantity, status: Number(product.stock) === quantity ? 'sold out' : product.status });
      try {
        return await mockApi.create('orders', {
          customer: user.name,
          customerEmail: user.email,
          product: product.title,
          listingId: product.id,
          sellerTeam: product.sellerTeam,
          event: product.event,
          quantity,
          price: Number(product.price) * quantity,
          status: 'requested',
        });
      } catch (error) {
        await mockApi.update('listings', product.id, { stock: Number(updated.stock) + quantity, status: product.status });
        throw error;
      }
    },
    onSuccess: () => { setNotice('Reservation sent to the seller. Check My reservations for updates.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const cancelMutation = useMutation({
    mutationFn: async (order) => {
      if (order.status !== 'requested') throw new Error('Only a requested reservation can be cancelled.');
      await mockApi.update('orders', order.id, { status: 'cancelled' });
      const product = products.find((item) => item.id === order.listingId);
      if (product) await mockApi.update('listings', product.id, { stock: Number(product.stock) + Number(order.quantity), status: 'active' });
    },
    onSuccess: () => { setNotice('Reservation cancelled.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const createListingMutation = useMutation({
    mutationFn: (form) => {
      if (user.status !== 'active') throw new Error('Your seller account needs admin verification before you can submit products.');
      if (!form.event) throw new Error('Choose the campus event where you plan to sell.');
      if (!form.title.trim() || !form.booth.trim() || !form.description.trim()) throw new Error('Complete all product details before submitting.');
      if (Number(form.price) <= 0 || Number(form.stock) < 1) throw new Error('Enter a price above ₱0 and a quantity of at least 1.');
      return mockApi.create('listings', {
        ...form,
        title: form.title.trim(),
        sellerTeam: user.teamName,
        price: Number(form.price),
        stock: Number(form.stock),
        sellerVerified: true,
        status: 'pending',
      });
    },
    onSuccess: () => {
      setNotice('Product submitted. It will appear in the marketplace after admin review.');
      setListingForm({ title: '', category: categories[1], event: '', booth: '', price: '', stock: '', description: '' });
      refreshData();
    },
    onError: (error) => setNotice(error.message),
  });
  const orderStatusMutation = useMutation({
    mutationFn: async ({ order, status }) => {
      const updatedOrder = await mockApi.update('orders', order.id, { status });
      if (status === 'cancelled') {
        const product = products.find((item) => item.id === order.listingId);
        if (product) await mockApi.update('listings', product.id, { stock: Number(product.stock) + Number(order.quantity), status: 'active' });
      }
      return updatedOrder;
    },
    onSuccess: () => { setNotice('Reservation status updated.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const stockMutation = useMutation({
    mutationFn: ({ product, stock }) => mockApi.update('listings', product.id, { stock, status: stock === 0 ? 'sold out' : product.status === 'sold out' ? 'pending' : product.status }),
    onSuccess: () => { setNotice('Product quantity updated.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const editProductMutation = useMutation({
    mutationFn: ({ product, updates }) => mockApi.update('listings', product.id, { ...updates, price: Number(updates.price), status: 'pending' }),
    onSuccess: () => { setNotice('Product details saved and sent to admin for review.'); setEditingProduct(null); setProductDraft(null); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const deleteProductMutation = useMutation({
    mutationFn: (product) => mockApi.delete('listings', product.id),
    onSuccess: () => { setNotice('Product removed from your listings.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const messageMutation = useMutation({
    mutationFn: ({ order, message }) => {
      if (!message.trim()) throw new Error('Write a message before sending.');
      const messages = Array.isArray(order.messages) ? order.messages : [];
      return mockApi.update('orders', order.id, {
        messages: [...messages, { id: `${Date.now()}-${user.id}`, senderRole: user.role, senderName: user.name, text: message.trim(), sentAt: new Date().toISOString() }],
      });
    },
    onSuccess: (_result, variables) => { setMessageDrafts((current) => ({ ...current, [variables.order.id]: '' })); refreshData(); },
    onError: (error) => setNotice(error.message),
  });

  const submitListing = (event) => {
    event.preventDefault();
    createListingMutation.mutate(listingForm);
  };
  const updateListingField = (event) => setListingForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const sendMessage = (event, order) => {
    event.preventDefault();
    messageMutation.mutate({ order, message: messageDrafts[order.id] || '' });
  };

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{isSeller ? 'Seller workspace' : 'Student marketplace'}</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{isSeller ? `Welcome, ${user.teamName || user.name}` : 'Find something for your next campus event'}</h1>
      <p className="mt-2 max-w-3xl text-sm text-gray-600">{isSeller
        ? 'Submit products for campus events, keep your stock current, and respond to student reservations.'
        : 'Discover student-made food, clothing, accessories, souvenirs, and project goods. Reserve products for campus pickup.'}</p>

      {notice && <div role="status" className="mt-5 flex items-start justify-between gap-4 rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-900"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="font-semibold" aria-label="Dismiss message">×</button></div>}

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="text-lg font-semibold text-gray-900">Your account</h2><p className="mt-1 text-sm text-gray-600">{user.name} · {user.email}</p>{user.teamName && <p className="mt-1 text-sm text-gray-600">Seller group: {user.teamName}</p>}</div>
          <StatusBadge status={user.status} />
        </div>
        {user.status === 'pending verification' && <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">An admin needs to verify your seller account before your products can be submitted. You can prepare your product details while you wait.</p>}
        {user.status === 'suspended' && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">This account is suspended. Contact a marketplace admin for help.</p>}
      </section>

      {isSeller ? (
        <>
          <section aria-label="Seller activity summary" className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">Team listings</p><p className="mt-1 text-2xl font-bold text-gray-900">{teamProducts.length}</p></div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">Low-stock products</p><p className="mt-1 text-2xl font-bold text-gray-900">{lowStockCount}</p></div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">Requests to respond to</p><p className="mt-1 text-2xl font-bold text-gray-900">{awaitingOrderCount}</p></div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">Completed reservation value</p><p className="mt-1 text-2xl font-bold text-gray-900">{money(completedOrderValue)}</p><p className="mt-1 text-xs text-gray-500">Order tracking only; no payments or payouts are processed.</p></div>
          </section>

          <section className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-primary-950">Seller privileges and access</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-primary-950 md:grid-cols-2">
              <div><h3 className="font-semibold">Manage your product catalog</h3><p className="mt-1 text-primary-900">Submit products, update stock, edit details, and remove your team’s listings. Changes to product details go back to admin review.</p></div>
              <div><h3 className="font-semibold">Handle reservations and pickup</h3><p className="mt-1 text-primary-900">Accept or decline requests, message students about their order, mark it ready, and confirm pickup.</p></div>
              <div><h3 className="font-semibold">Monitor stock and order activity</h3><p className="mt-1 text-primary-900">Keep available quantities current and review pending requests and completed order totals for your team.</p></div>
              <div><h3 className="font-semibold">Team and admin boundaries</h3><p className="mt-1 text-primary-900">Seller access is for your registered team. Admins verify sellers and listings. Payments, refunds, payouts, and team-member permissions are not available in this prototype.</p></div>
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="seller-submit" className="text-lg font-semibold text-gray-900">Submit a product for review</h2>
            <p className="mt-1 text-sm text-gray-600">Approved products are shown to students. Include pickup details and any food ingredients or product materials.</p>
            <form onSubmit={submitListing} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">Product name<input name="title" value={listingForm.title} onChange={updateListingField} required maxLength={100} placeholder="e.g., Ube Cheese Pandesal" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Category<select name="category" value={listingForm.category} onChange={updateListingField} className="input-field mt-1">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm font-medium text-gray-700">Campus event<select name="event" value={listingForm.event} onChange={updateListingField} required className="input-field mt-1"><option value="">Choose an event</option>{events.map((event) => <option key={event.id} value={event.name}>{event.name}</option>)}</select></label>
              <label className="text-sm font-medium text-gray-700">Booth or pickup location<input name="booth" value={listingForm.booth} onChange={updateListingField} required placeholder="e.g., Booth A-04" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Price (₱)<input name="price" type="number" min="0.01" step="0.01" value={listingForm.price} onChange={updateListingField} required placeholder="e.g., 50.00" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Available quantity<input name="stock" type="number" min="1" step="1" value={listingForm.stock} onChange={updateListingField} required placeholder="e.g., 30" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">Description, ingredients, or materials<textarea name="description" value={listingForm.description} onChange={updateListingField} required maxLength={500} rows={3} placeholder="Describe the product. For food, list common allergens and ingredients." className="input-field mt-1" /></label>
              <button type="submit" disabled={createListingMutation.isPending || user.status !== 'active'} className="btn-primary sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-50">{createListingMutation.isPending ? 'Submitting…' : 'Submit product for review'}</button>
            </form>
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 id="seller-products" className="text-lg font-semibold text-gray-900">Your products</h2><p className="mt-1 text-sm text-gray-600">Track review status and update your available quantity.</p></div><span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-800">{teamProducts.length} total</span></div>
            <div className="mt-4 space-y-3">
              {teamProducts.map((product) => <article key={product.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-900">{product.title}</h3><StatusBadge status={product.status} /></div><p className="mt-1 text-sm text-gray-600">{product.event} · {product.booth} · {money(product.price)}</p><p className="mt-1 text-xs text-gray-500">{product.category} · {product.stock} in stock</p></div>
                  <div className="flex flex-wrap items-end gap-2">
                    <form className="flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); stockMutation.mutate({ product, stock: Number(stockDrafts[product.id] ?? product.stock) }); }}><label className="text-xs font-medium text-gray-600">Stock<input aria-label={`Stock for ${product.title}`} type="number" min="0" value={stockDrafts[product.id] ?? product.stock} onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: event.target.value }))} className="input-field mt-1 w-24" /></label><button type="submit" disabled={stockMutation.isPending || user.status !== 'active'} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">Save stock</button></form>
                    <button type="button" disabled={user.status !== 'active'} onClick={() => { setEditingProduct(product.id); setProductDraft({ title: product.title, category: product.category, event: product.event, booth: product.booth, price: product.price, description: product.description || '' }); }} className="rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800 disabled:opacity-50">Edit details</button>
                    <button type="button" disabled={user.status !== 'active' || deleteProductMutation.isPending} onClick={() => { if (window.confirm(`Remove ${product.title} from your listings?`)) deleteProductMutation.mutate(product); }} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Remove</button>
                  </div>
                </div>
                {editingProduct === product.id && productDraft && <form onSubmit={(event) => { event.preventDefault(); editProductMutation.mutate({ product, updates: productDraft }); }} className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">Product name<input required value={productDraft.title} onChange={(event) => setProductDraft((current) => ({ ...current, title: event.target.value }))} className="input-field mt-1" /></label>
                  <label className="text-sm font-medium text-gray-700">Category<select value={productDraft.category} onChange={(event) => setProductDraft((current) => ({ ...current, category: event.target.value }))} className="input-field mt-1">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="text-sm font-medium text-gray-700">Campus event<select value={productDraft.event} onChange={(event) => setProductDraft((current) => ({ ...current, event: event.target.value }))} className="input-field mt-1">{events.map((event) => <option key={event.id} value={event.name}>{event.name}</option>)}</select></label>
                  <label className="text-sm font-medium text-gray-700">Booth or pickup location<input required value={productDraft.booth} onChange={(event) => setProductDraft((current) => ({ ...current, booth: event.target.value }))} className="input-field mt-1" /></label>
                  <label className="text-sm font-medium text-gray-700">Price (₱)<input type="number" min="0.01" step="0.01" required value={productDraft.price} onChange={(event) => setProductDraft((current) => ({ ...current, price: event.target.value }))} className="input-field mt-1" /></label>
                  <label className="text-sm font-medium text-gray-700 sm:col-span-2">Description, ingredients, or materials<textarea required maxLength={500} rows={3} value={productDraft.description} onChange={(event) => setProductDraft((current) => ({ ...current, description: event.target.value }))} className="input-field mt-1" /></label>
                  <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={editProductMutation.isPending} className="btn-primary">{editProductMutation.isPending ? 'Saving…' : 'Save and resubmit for review'}</button><button type="button" onClick={() => { setEditingProduct(null); setProductDraft(null); }} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button></div>
                </form>}
              </article>)}
              {teamProducts.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">No products submitted yet. Add your first product above.</p>}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div><h2 id="seller-orders" className="text-lg font-semibold text-gray-900">Student reservations</h2><p className="mt-1 text-sm text-gray-600">Accept requests, prepare orders, and mark them picked up.</p></div>
            <div className="mt-4 space-y-3">{sellerOrders.map((order) => <article key={order.id} className="rounded-lg border border-gray-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{order.product} <span className="font-normal text-gray-500">× {order.quantity}</span></p><p className="mt-1 text-sm text-gray-600">{order.customer} · {order.event} · {money(order.price)}</p><div className="mt-2"><StatusBadge status={order.status} /></div></div>{order.status === 'requested' && <div className="flex gap-2"><button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'accepted' })} className="rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white">Accept</button><button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'cancelled' })} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">Decline</button></div>}{order.status === 'accepted' && <button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'ready for pickup' })} className="rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800">Mark ready for pickup</button>}{order.status === 'ready for pickup' && <button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'completed' })} className="rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800">Mark picked up</button>}</div><OrderConversation order={order} draft={messageDrafts[order.id] || ''} onDraftChange={(event) => setMessageDrafts((current) => ({ ...current, [order.id]: event.target.value }))} onSubmit={(event) => sendMessage(event, order)} isSending={messageMutation.isPending} /></article>)}{sellerOrders.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Student reservations for your products will appear here.</p>}</div>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row"><label className="flex-1 text-sm font-medium text-gray-700">Search products<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, teams, or events" className="input-field mt-1" /></label><label className="text-sm font-medium text-gray-700 sm:w-64">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field mt-1">{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => <article key={product.id} className="flex flex-col rounded-xl border border-gray-200 p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{product.category}</p><h3 className="mt-1 text-lg font-semibold text-gray-900">{product.title}</h3></div><span className="shrink-0 font-bold text-primary-800">{money(product.price)}</span></div><p className="mt-2 flex-1 text-sm text-gray-600">{product.description}</p><div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm"><p className="font-medium text-gray-800">{product.sellerTeam}</p><p className="mt-1 text-gray-600">{product.event} · Booth {product.booth}</p><p className="mt-1 text-xs text-gray-500">{product.stock} available</p></div><div className="mt-3 flex items-end gap-2"><label className="text-xs font-medium text-gray-600">Qty<input aria-label={`Quantity for ${product.title}`} type="number" min="1" max={product.stock} value={quantities[product.id] || 1} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))} className="input-field mt-1 w-20" /></label><button type="button" disabled={reserveMutation.isPending || user.status !== 'active'} onClick={() => reserveMutation.mutate({ product, quantity: Number(quantities[product.id] || 1) })} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">Reserve for pickup</button></div></article>)}
              {!listingsLoading && visibleProducts.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 md:col-span-2 xl:col-span-3">No products match your search. Try another term or category.</p>}
              {listingsLoading && <p className="text-sm text-gray-500 md:col-span-2 xl:col-span-3">Loading campus products…</p>}
            </div>
          </section>

          <section id="my-reservations" className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div><h2 className="text-lg font-semibold text-gray-900">My reservations</h2><p className="mt-1 text-sm text-gray-600">Follow each request through seller acceptance and campus pickup.</p></div>
            <div className="mt-4 space-y-3">{buyerOrders.map((order) => <article key={order.id} className="rounded-lg border border-gray-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{order.product} <span className="font-normal text-gray-500">× {order.quantity}</span></p><p className="mt-1 text-sm text-gray-600">{order.sellerTeam} · {order.event} · {money(order.price)}</p><div className="mt-2"><StatusBadge status={order.status} /></div></div>{order.status === 'requested' && <button type="button" onClick={() => cancelMutation.mutate(order)} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">Cancel reservation</button>}</div><OrderConversation order={order} draft={messageDrafts[order.id] || ''} onDraftChange={(event) => setMessageDrafts((current) => ({ ...current, [order.id]: event.target.value }))} onSubmit={(event) => sendMessage(event, order)} isSending={messageMutation.isPending} /></article>)}{buyerOrders.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">You have no reservations yet. Reserve an available product above to get started.</p>}</div>
          </section>
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><h2 id="upcoming-events" className="text-lg font-semibold text-gray-900">Upcoming campus events</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{events.map((event) => <article key={event.id} className="rounded-lg bg-primary-50 p-4"><h3 className="font-semibold text-primary-900">{event.name}</h3><p className="mt-1 text-sm text-primary-800">{event.date} · {event.location}</p></article>)}{events.length === 0 && <p className="text-sm text-gray-600">No upcoming events have been posted.</p>}</div></section>
        </>
      )}

      <p className="mt-6 text-xs text-gray-500">Marketplace products, reservations, and event data currently save in this browser. They are demo features and are not yet synchronized across devices or accounts.</p>
    </div>
  );
};

export default RoleHomePage;
