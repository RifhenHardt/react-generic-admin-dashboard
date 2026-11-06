import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../services/mockApi';
import StatusBadge from '../components/common/StatusBadge';

const categories = ['All categories', 'Food & Drinks', 'Clothing', 'Wearable Accessories', 'Souvenirs', 'Arts & Crafts', 'Project Products'];
const loadAll = (entityName) => mockApi.getAll(entityName, { page: 1, pageSize: 200 });
const money = (value) => `₱${Number(value || 0).toFixed(2)}`;

const RoleHomePage = ({ user }) => {
  const isSeller = user.role === 'seller';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [quantities, setQuantities] = useState({});
  const [stockDrafts, setStockDrafts] = useState({});
  const [editingListingId, setEditingListingId] = useState(null);
  const [contactDrafts, setContactDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [notice, setNotice] = useState('');
  const [listingForm, setListingForm] = useState({ title: '', category: categories[1], event: '', booth: '', price: '', stock: '', reorderAt: 5, imageUrl: '', description: '' });
  const { data: listingsData, isLoading: listingsLoading } = useQuery({ queryKey: ['listings', 'account-home'], queryFn: () => loadAll('listings') });
  const { data: eventsData } = useQuery({ queryKey: ['events', 'account-home'], queryFn: () => loadAll('events') });
  const { data: ordersData } = useQuery({ queryKey: ['orders', 'account-home'], queryFn: () => loadAll('orders') });
  const { data: messagesData } = useQuery({ queryKey: ['messages', 'account-home'], queryFn: () => loadAll('messages') });
  const { data: reviewsData } = useQuery({ queryKey: ['reviews', 'account-home'], queryFn: () => loadAll('reviews') });
  const products = useMemo(() => listingsData?.items || [], [listingsData]);
  const events = (eventsData?.items || []).filter((event) => event.status !== 'completed');
  const orders = ordersData?.items || [];
  const messages = messagesData?.items || [];
  const reviews = reviewsData?.items || [];
  const teamProducts = products.filter((product) => product.sellerTeam?.trim().toLowerCase() === user.teamName?.trim().toLowerCase());
  const buyerOrders = orders.filter((order) => order.customerEmail ? order.customerEmail.toLowerCase() === user.email.toLowerCase() : order.customer === user.name);
  const sellerOrders = orders.filter((order) => order.sellerTeam?.trim().toLowerCase() === user.teamName?.trim().toLowerCase());
  const sellerMessages = messages.filter((message) => message.sellerTeam?.trim().toLowerCase() === user.teamName?.trim().toLowerCase());
  const buyerMessages = messages.filter((message) => message.senderEmail?.toLowerCase() === user.email.toLowerCase());
  const sellerReviews = reviews.filter((review) => review.sellerTeam?.trim().toLowerCase() === user.teamName?.trim().toLowerCase());
  const reviewedOrderIds = new Set(reviews.filter((review) => review.studentEmail?.toLowerCase() === user.email.toLowerCase()).map((review) => review.orderId));
  const completedOrders = sellerOrders.filter((order) => order.status === 'completed');
  const completedSales = completedOrders.reduce((sum, order) => sum + Number(order.price || 0), 0);
  const lowStockProducts = teamProducts.filter((product) => Number(product.stock) <= Number(product.reorderAt ?? 5));
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.title} ${product.description} ${product.category} ${product.event} ${product.sellerTeam}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All categories' || product.category === category;
    return product.status === 'active' && Number(product.stock) > 0 && matchesSearch && matchesCategory;
  }), [products, search, category]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
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
  const saveListingMutation = useMutation({
    mutationFn: (form) => {
      if (user.status !== 'active') throw new Error('Your seller account needs admin verification before you can submit products.');
      if (!form.event) throw new Error('Choose the campus event where you plan to sell.');
      if (!form.title.trim() || !form.booth.trim() || !form.description.trim()) throw new Error('Complete all product details before submitting.');
      if (Number(form.price) <= 0 || Number(form.stock) < 1) throw new Error('Enter a price above ₱0 and a quantity of at least 1.');
      const details = {
        ...form,
        title: form.title.trim(),
        sellerTeam: user.teamName,
        price: Number(form.price),
        stock: Number(form.stock),
        reorderAt: Number(form.reorderAt || 0),
        sellerVerified: true,
      };
      if (editingListingId) {
        const listing = teamProducts.find((item) => item.id === editingListingId);
        if (!listing) throw new Error('You can only edit products submitted by your team.');
        return mockApi.update('listings', editingListingId, { ...details, status: 'pending' });
      }
      return mockApi.create('listings', { ...details, status: 'pending' });
    },
    onSuccess: () => {
      setNotice(editingListingId ? 'Product changes submitted for admin review.' : 'Product submitted. It will appear in the marketplace after admin review.');
      setEditingListingId(null);
      setListingForm({ title: '', category: categories[1], event: '', booth: '', price: '', stock: '', reorderAt: 5, imageUrl: '', description: '' });
      refreshData();
    },
    onError: (error) => setNotice(error.message),
  });
  const deleteListingMutation = useMutation({
    mutationFn: (product) => {
      if (product.sellerTeam?.trim().toLowerCase() !== user.teamName?.trim().toLowerCase()) throw new Error('You can only remove products from your own seller team.');
      if (orders.some((order) => order.listingId === product.id && ['requested', 'accepted', 'ready for pickup'].includes(order.status))) {
        throw new Error('This product has open reservations. Complete or decline them before removing the product.');
      }
      return mockApi.delete('listings', product.id);
    },
    onSuccess: () => { setNotice('Product removed from your catalog.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const messageMutation = useMutation({
    mutationFn: ({ product, message }) => {
      if (!message.trim()) throw new Error('Write a message before sending.');
      return mockApi.create('messages', { productId: product.id, productTitle: product.title, sellerTeam: product.sellerTeam, senderName: user.name, senderEmail: user.email, message: message.trim(), response: '', status: 'unread' });
    },
    onSuccess: (_, variables) => { setContactDrafts((current) => ({ ...current, [variables.product.id]: '' })); setNotice('Your message was sent to the seller.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const replyMutation = useMutation({
    mutationFn: ({ message, response }) => {
      if (!response.trim()) throw new Error('Write a reply before sending.');
      return mockApi.update('messages', message.id, { response: response.trim(), status: 'replied', repliedAt: new Date().toISOString() });
    },
    onSuccess: (_, variables) => { setReplyDrafts((current) => ({ ...current, [variables.message.id]: '' })); setNotice('Reply sent to the student.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });
  const reviewMutation = useMutation({
    mutationFn: ({ order, rating, comment }) => {
      if (!comment.trim()) throw new Error('Add a short comment about your experience.');
      if (reviewedOrderIds.has(order.id)) throw new Error('You already reviewed this reservation.');
      return mockApi.create('reviews', { orderId: order.id, productId: order.listingId, product: order.product, sellerTeam: order.sellerTeam, studentName: user.name, studentEmail: user.email, rating: Number(rating), comment: comment.trim() });
    },
    onSuccess: () => { setNotice('Thank you. Your feedback was saved.'); refreshData(); },
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
    mutationFn: ({ product, stock, reorderAt }) => mockApi.update('listings', product.id, { stock, reorderAt, status: stock === 0 ? 'sold out' : product.status === 'sold out' ? 'active' : product.status }),
    onSuccess: () => { setNotice('Product quantity updated.'); refreshData(); },
    onError: (error) => setNotice(error.message),
  });

  const submitListing = (event) => {
    event.preventDefault();
    saveListingMutation.mutate(listingForm);
  };
  const updateListingField = (event) => setListingForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const editListing = (product) => {
    setEditingListingId(product.id);
    setListingForm({ title: product.title, category: product.category, event: product.event, booth: product.booth, price: product.price, stock: product.stock, reorderAt: product.reorderAt ?? 5, imageUrl: product.imageUrl || '', description: product.description || '' });
    document.getElementById('seller-submit')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <section id="seller-performance" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Seller performance summary">
            {[
              { label: 'Completed order total', value: money(completedSales), detail: 'Reservation totals, before any fees' },
              { label: 'Completed pickups', value: completedOrders.length, detail: 'Orders marked picked up' },
              { label: 'Products needing stock', value: lowStockProducts.length, detail: 'At or below your reorder alert' },
              { label: 'Buyer messages', value: sellerMessages.filter((message) => !message.response).length, detail: 'Waiting for your reply' },
            ].map((stat) => <article key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-sm text-gray-500">{stat.label}</p><p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p><p className="mt-1 text-xs text-gray-500">{stat.detail}</p></article>)}
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="seller-submit" className="text-lg font-semibold text-gray-900">{editingListingId ? 'Edit your product' : 'Submit a product for review'}</h2>
            <p className="mt-1 text-sm text-gray-600">Approved products are shown to students. Include pickup details and any food ingredients or product materials. Changes to an approved product go back to admin review.</p>
            <form onSubmit={submitListing} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">Product name<input name="title" value={listingForm.title} onChange={updateListingField} required maxLength={100} placeholder="e.g., Ube Cheese Pandesal" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Category<select name="category" value={listingForm.category} onChange={updateListingField} className="input-field mt-1">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm font-medium text-gray-700">Product photo URL (optional)<input name="imageUrl" type="url" value={listingForm.imageUrl} onChange={updateListingField} placeholder="https://example.com/product-photo.jpg" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Campus event<select name="event" value={listingForm.event} onChange={updateListingField} required className="input-field mt-1"><option value="">Choose an event</option>{events.map((event) => <option key={event.id} value={event.name}>{event.name}</option>)}</select></label>
              <label className="text-sm font-medium text-gray-700">Booth or pickup location<input name="booth" value={listingForm.booth} onChange={updateListingField} required placeholder="e.g., Booth A-04" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Price (₱)<input name="price" type="number" min="0.01" step="0.01" value={listingForm.price} onChange={updateListingField} required placeholder="e.g., 50.00" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Available quantity<input name="stock" type="number" min="1" step="1" value={listingForm.stock} onChange={updateListingField} required placeholder="e.g., 30" className="input-field mt-1" /></label>
              <label className="text-sm font-medium text-gray-700">Low-stock alert at<input name="reorderAt" type="number" min="0" step="1" value={listingForm.reorderAt} onChange={updateListingField} required placeholder="e.g., 5" className="input-field mt-1" /><span className="mt-1 block text-xs font-normal text-gray-500">We’ll flag the item when stock reaches this amount.</span></label>
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">Description, ingredients, or materials<textarea name="description" value={listingForm.description} onChange={updateListingField} required maxLength={500} rows={3} placeholder="Describe the product. For food, list common allergens and ingredients." className="input-field mt-1" /></label>
              <div className="flex gap-3 sm:col-span-2"><button type="submit" disabled={saveListingMutation.isPending || user.status !== 'active'} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">{saveListingMutation.isPending ? 'Saving…' : editingListingId ? 'Save changes for review' : 'Submit product for review'}</button>{editingListingId && <button type="button" onClick={() => { setEditingListingId(null); setListingForm({ title: '', category: categories[1], event: '', booth: '', price: '', stock: '', reorderAt: 5, imageUrl: '', description: '' }); }} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>}</div>
            </form>
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 id="seller-products" className="text-lg font-semibold text-gray-900">Your products</h2><p className="mt-1 text-sm text-gray-600">Track review status and update your available quantity.</p></div><span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-800">{teamProducts.length} total</span></div>
            <div className="mt-4 space-y-3">
              {teamProducts.map((product) => <article key={product.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  {product.imageUrl && <img src={product.imageUrl} alt={product.title} className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />}
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-900">{product.title}</h3><StatusBadge status={product.status} /></div><p className="mt-1 text-sm text-gray-600">{product.event} · {product.booth} · {money(product.price)}</p><p className="mt-1 text-xs text-gray-500">{product.category} · {product.stock} in stock · Alert at {product.reorderAt ?? 5}</p>{Number(product.stock) <= Number(product.reorderAt ?? 5) && <p className="mt-1 text-xs font-semibold text-amber-700">Low stock: restock soon</p>}</div>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                  <form className="flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); stockMutation.mutate({ product, stock: Number(stockDrafts[product.id] ?? product.stock), reorderAt: Number(stockDrafts[`reorder-${product.id}`] ?? product.reorderAt ?? 5) }); }}>
                    <label className="text-xs font-medium text-gray-600">Stock<input aria-label={`Stock for ${product.title}`} type="number" min="0" value={stockDrafts[product.id] ?? product.stock} onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: event.target.value }))} className="input-field mt-1 w-20" /></label>
                    <label className="text-xs font-medium text-gray-600">Alert at<input aria-label={`Low-stock alert for ${product.title}`} type="number" min="0" value={stockDrafts[`reorder-${product.id}`] ?? product.reorderAt ?? 5} onChange={(event) => setStockDrafts((current) => ({ ...current, [`reorder-${product.id}`]: event.target.value }))} className="input-field mt-1 w-20" /></label>
                    <button type="submit" disabled={stockMutation.isPending} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">Save</button>
                  </form>
                  <button type="button" onClick={() => editListing(product)} className="rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800">Edit</button>
                  <button type="button" onClick={() => { if (window.confirm(`Remove ${product.title} from your catalog?`)) deleteListingMutation.mutate(product); }} disabled={deleteListingMutation.isPending} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Delete</button>
                </div>
              </article>)}
              {teamProducts.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">No products submitted yet. Add your first product above.</p>}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div><h2 id="seller-orders" className="text-lg font-semibold text-gray-900">Student reservations</h2><p className="mt-1 text-sm text-gray-600">Accept requests, prepare orders, and mark them picked up.</p></div>
            <div className="mt-4 space-y-3">{sellerOrders.map((order) => <article key={order.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{order.product} <span className="font-normal text-gray-500">× {order.quantity}</span></p><p className="mt-1 text-sm text-gray-600">{order.customer} · {order.event} · {money(order.price)}</p><div className="mt-2"><StatusBadge status={order.status} /></div></div>{order.status === 'requested' && <div className="flex gap-2"><button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'accepted' })} className="rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white">Accept</button><button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'cancelled' })} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">Decline</button></div>}{order.status === 'accepted' && <button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'ready for pickup' })} className="rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800">Mark ready for pickup</button>}{order.status === 'ready for pickup' && <button type="button" onClick={() => orderStatusMutation.mutate({ order, status: 'completed' })} className="rounded-md bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800">Mark picked up</button>}</article>)}{sellerOrders.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Student reservations for your products will appear here.</p>}</div>
          </section>
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="seller-messages" className="text-lg font-semibold text-gray-900">Buyer messages</h2>
            <p className="mt-1 text-sm text-gray-600">Answer questions about your products and coordinate pickup details.</p>
            <div className="mt-4 space-y-3">{sellerMessages.map((message) => <article key={message.id} className="rounded-lg border border-gray-200 p-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-semibold text-gray-900">{message.senderName} · {message.productTitle}</p><StatusBadge status={message.status} /></div><p className="mt-2 text-sm text-gray-700">{message.message}</p>{message.response && <p className="mt-3 rounded-lg bg-primary-50 p-3 text-sm text-primary-900"><span className="font-semibold">Your reply:</span> {message.response}</p>}{!message.response && <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); replyMutation.mutate({ message, response: replyDrafts[message.id] || '' }); }}><input value={replyDrafts[message.id] || ''} onChange={(event) => setReplyDrafts((current) => ({ ...current, [message.id]: event.target.value }))} maxLength={500} required placeholder="Write a reply" className="input-field flex-1" /><button type="submit" disabled={replyMutation.isPending} className="btn-primary disabled:opacity-50">Send reply</button></form>}</article>)}{sellerMessages.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Buyer product questions will appear here.</p>}</div>
          </section>
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="seller-feedback" className="text-lg font-semibold text-gray-900">Buyer feedback</h2>
            <p className="mt-1 text-sm text-gray-600">Use completed-order reviews to learn what buyers think of your products.</p>
            <div className="mt-4 space-y-3">{sellerReviews.map((review) => <article key={review.id} className="rounded-lg bg-gray-50 p-4"><p className="font-semibold text-gray-900">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} <span className="ml-2 text-sm font-medium">{review.product}</span></p><p className="mt-1 text-sm text-gray-700">{review.comment}</p><p className="mt-2 text-xs text-gray-500">{review.studentName}</p></article>)}{sellerReviews.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Student feedback will appear here after a completed reservation is reviewed.</p>}</div>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row"><label className="flex-1 text-sm font-medium text-gray-700">Search products<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products, teams, or events" className="input-field mt-1" /></label><label className="text-sm font-medium text-gray-700 sm:w-64">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field mt-1">{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => <article key={product.id} className="flex flex-col rounded-xl border border-gray-200 p-4">
                {product.imageUrl && <img src={product.imageUrl} alt={product.title} className="mb-3 h-40 w-full rounded-lg object-cover" />}
                <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary-700">{product.category}</p><h3 className="mt-1 text-lg font-semibold text-gray-900">{product.title}</h3></div><span className="shrink-0 font-bold text-primary-800">{money(product.price)}</span></div>
                <p className="mt-2 flex-1 text-sm text-gray-600">{product.description}</p>
                <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm"><p className="font-medium text-gray-800">{product.sellerTeam}</p><p className="mt-1 text-gray-600">{product.event} · Booth {product.booth}</p><p className="mt-1 text-xs text-gray-500">{product.stock} available</p></div>
                <div className="mt-3 flex items-end gap-2"><label className="text-xs font-medium text-gray-600">Qty<input aria-label={`Quantity for ${product.title}`} type="number" min="1" max={product.stock} value={quantities[product.id] || 1} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))} className="input-field mt-1 w-20" /></label><button type="button" disabled={reserveMutation.isPending || user.status !== 'active'} onClick={() => reserveMutation.mutate({ product, quantity: Number(quantities[product.id] || 1) })} className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50">Reserve for pickup</button></div>
                <form className="mt-4 border-t border-gray-100 pt-3" onSubmit={(event) => { event.preventDefault(); messageMutation.mutate({ product, message: contactDrafts[product.id] || '' }); }}><label className="text-xs font-medium text-gray-600">Ask the seller a question<textarea value={contactDrafts[product.id] || ''} onChange={(event) => setContactDrafts((current) => ({ ...current, [product.id]: event.target.value }))} maxLength={500} rows={2} placeholder="Ask about sizes, ingredients, or pickup details" className="input-field mt-1" /></label><button type="submit" disabled={messageMutation.isPending || user.status !== 'active'} className="mt-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">Message seller</button></form>
              </article>)}
              {!listingsLoading && visibleProducts.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 md:col-span-2 xl:col-span-3">No products match your search. Try another term or category.</p>}
              {listingsLoading && <p className="text-sm text-gray-500 md:col-span-2 xl:col-span-3">Loading campus products…</p>}
            </div>
          </section>

          <section id="my-reservations" className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div><h2 className="text-lg font-semibold text-gray-900">My reservations</h2><p className="mt-1 text-sm text-gray-600">Follow each request through seller acceptance and campus pickup.</p></div>
            <div className="mt-4 space-y-3">{buyerOrders.map((order) => <article key={order.id} className="rounded-lg border border-gray-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-gray-900">{order.product} <span className="font-normal text-gray-500">× {order.quantity}</span></p><p className="mt-1 text-sm text-gray-600">{order.sellerTeam} · {order.event} · {money(order.price)}</p><div className="mt-2"><StatusBadge status={order.status} /></div></div>{order.status === 'requested' && <button type="button" onClick={() => cancelMutation.mutate(order)} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">Cancel reservation</button>}</div>{order.status === 'completed' && !reviewedOrderIds.has(order.id) && <form className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-[10rem_1fr_auto]" onSubmit={(event) => { event.preventDefault(); reviewMutation.mutate({ order, rating: reviewDrafts[`rating-${order.id}`] || 5, comment: reviewDrafts[`comment-${order.id}`] || '' }); }}><label className="text-xs font-medium text-gray-600">Rate your pickup<select value={reviewDrafts[`rating-${order.id}`] || 5} onChange={(event) => setReviewDrafts((current) => ({ ...current, [`rating-${order.id}`]: event.target.value }))} className="input-field mt-1"><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select></label><label className="text-xs font-medium text-gray-600">Leave feedback<input value={reviewDrafts[`comment-${order.id}`] || ''} onChange={(event) => setReviewDrafts((current) => ({ ...current, [`comment-${order.id}`]: event.target.value }))} maxLength={500} required placeholder="Share a helpful note about the product or pickup" className="input-field mt-1" /></label><button type="submit" disabled={reviewMutation.isPending} className="btn-primary self-end disabled:opacity-50">Send review</button></form>}{order.status === 'completed' && reviewedOrderIds.has(order.id) && <p className="mt-3 text-sm font-medium text-green-700">Thanks for reviewing this reservation.</p>}</article>)}{buyerOrders.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">You have no reservations yet. Reserve an available product above to get started.</p>}</div>
          </section>
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><h2 id="upcoming-events" className="text-lg font-semibold text-gray-900">Upcoming campus events</h2><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">{events.map((event) => <article key={event.id} className="rounded-lg bg-primary-50 p-4"><h3 className="font-semibold text-primary-900">{event.name}</h3><p className="mt-1 text-sm text-primary-800">{event.date} · {event.location}</p></article>)}{events.length === 0 && <p className="text-sm text-gray-600">No upcoming events have been posted.</p>}</div></section>
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"><h2 id="my-messages" className="text-lg font-semibold text-gray-900">My messages to sellers</h2><p className="mt-1 text-sm text-gray-600">See replies to your product questions.</p><div className="mt-4 space-y-3">{buyerMessages.map((message) => <article key={message.id} className="rounded-lg border border-gray-200 p-4"><p className="font-semibold text-gray-900">{message.productTitle} · {message.sellerTeam}</p><p className="mt-2 text-sm text-gray-700">You: {message.message}</p>{message.response ? <p className="mt-2 rounded-lg bg-primary-50 p-3 text-sm text-primary-900">Seller: {message.response}</p> : <p className="mt-2 text-xs text-gray-500">Waiting for seller reply</p>}</article>)}{buyerMessages.length === 0 && <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Messages you send from a product card and seller replies will appear here.</p>}</div></section>
        </>
      )}

      <p className="mt-6 text-xs text-gray-500">Marketplace products, reservations, and event data currently save in this browser. They are demo features and are not yet synchronized across devices or accounts.</p>
    </div>
  );
};

export default RoleHomePage;
