import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../services/mockApi';
import StatusBadge from '../components/common/StatusBadge';

const loadAll = (entityName) => mockApi.getAll(entityName, { page: 1, pageSize: 100 });

const roleCopy = {
  student: {
    title: 'Student marketplace',
    description: 'Browse food, clothing, accessories, souvenirs, and project products offered at campus events.',
  },
  vendor: {
    title: 'Vendor workspace',
    description: 'Keep track of products your team has submitted for campus events.',
  },
  organizer: {
    title: 'Event organizer workspace',
    description: 'See campus events and the student products associated with them.',
  },
};

const RoleHomePage = ({ user }) => {
  const { data: listingsData } = useQuery({ queryKey: ['listings', 'account-home'], queryFn: () => loadAll('listings') });
  const { data: eventsData } = useQuery({ queryKey: ['events', 'account-home'], queryFn: () => loadAll('events') });
  const products = listingsData?.items || [];
  const events = eventsData?.items || [];
  const copy = roleCopy[user.role] || roleCopy.student;
  const visibleProducts = user.role === 'vendor'
    ? products.filter((product) => product.sellerTeam?.toLowerCase() === user.teamName?.toLowerCase())
    : products.filter((product) => product.status === 'active');

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">{user.role}</p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{copy.title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-gray-600">{copy.description}</p>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your account</h2>
            <p className="mt-1 text-sm text-gray-600">{user.name} · {user.email}</p>
            {user.teamName && <p className="mt-1 text-sm text-gray-600">{user.teamName}</p>}
          </div>
          <StatusBadge status={user.status} />
        </div>
        {user.status === 'pending verification' && (
          <p className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
            A moderator needs to verify your vendor or organizer account before your team is fully activated.
          </p>
        )}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">{user.role === 'vendor' ? 'Your team products' : 'Products on sale'}</h2>
          <div className="mt-4 space-y-3">
            {visibleProducts.slice(0, 6).map((product) => (
              <div key={product.id} className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{product.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{product.event} · Booth {product.booth}</p>
                </div>
                <span className="shrink-0 font-semibold text-primary-800">₱{Number(product.price || 0).toFixed(2)}</span>
              </div>
            ))}
            {visibleProducts.length === 0 && (
              <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                {user.role === 'vendor' ? 'No demo products match your team name yet.' : 'No products are on sale right now.'}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900">Campus events</h2>
          <div className="mt-4 space-y-3">
            {events.filter((event) => event.status !== 'completed').map((event) => (
              <div key={event.id} className="rounded-lg bg-primary-50 p-3">
                <p className="font-semibold text-primary-900">{event.name}</p>
                <p className="mt-1 text-sm text-primary-800">{event.date} · {event.location}</p>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-gray-600">No upcoming events have been added.</p>}
          </div>
        </section>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Account identity is stored in the shared account service. Product and event listings shown here are still demo data stored in this browser.
      </p>
    </div>
  );
};

export default RoleHomePage;
