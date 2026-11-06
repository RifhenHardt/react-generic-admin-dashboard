import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../services/mockApi';

const loadAll = (entityName) => mockApi.getAll(entityName, { page: 1, pageSize: 100 });
const loadAccounts = async () => {
  const response = await fetch('/api/moderator/users', { credentials: 'same-origin' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not load accounts.');
  return data.users;
};

const Dashboard = () => {
  const { data: listingsData } = useQuery({ queryKey: ['listings', 'dashboard'], queryFn: () => loadAll('listings') });
  const { data: users = [] } = useQuery({ queryKey: ['account-users'], queryFn: loadAccounts });
  const { data: eventsData } = useQuery({ queryKey: ['events', 'dashboard'], queryFn: () => loadAll('events') });
  const { data: reportsData } = useQuery({ queryKey: ['reports', 'dashboard'], queryFn: () => loadAll('reports') });

  const listings = listingsData?.items || [];
  const events = eventsData?.items || [];
  const reports = reportsData?.items || [];
  const nextEvent = events.find((event) => event.status === 'upcoming' || event.status === 'active');
  const pendingCount = listings.filter((listing) => listing.status === 'pending').length;

  const stats = [
    { label: 'Products on sale', value: listings.filter((listing) => listing.status === 'active').length, icon: '🛍️', color: 'bg-primary-700' },
    { label: 'Awaiting review', value: pendingCount, icon: '🕒', color: 'bg-primary-500' },
    { label: 'Campus vendors', value: users.filter((user) => user.role === 'vendor').length, icon: '🏷️', color: 'bg-primary-300' },
    { label: 'Reports to review', value: reports.length, icon: '⚑', color: 'bg-primary-600' },
  ];

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Campus Market</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Marketplace overview</h1>
        <p className="mt-2 text-sm text-gray-600">Manage student vendor products, event booths, and campus orders.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 rounded-lg bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Next campus event</h2>
              <p className="mt-1 text-sm text-gray-500">Vendor listings and booth assignments</p>
            </div>
            <Link to="/events" className="text-sm font-semibold text-primary-700 hover:text-primary-800">Manage events</Link>
          </div>
          {nextEvent ? (
            <div className="mt-5 rounded-lg bg-primary-50 p-4">
              <p className="text-lg font-semibold text-primary-900">{nextEvent.name}</p>
              <p className="mt-1 text-sm text-primary-800">{nextEvent.date} · {nextEvent.location}</p>
              <p className="mt-3 text-sm text-gray-700">{nextEvent.description}</p>
            </div>
          ) : (
            <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">No upcoming events. Add an event to start accepting vendor listings.</p>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Products to review</h2>
              <p className="mt-1 text-sm text-gray-500">Check event, booth, and product details before approval.</p>
            </div>
            <Link to="/listings" className="text-sm font-semibold text-primary-700 hover:text-primary-800">View listings</Link>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {listings.filter((listing) => listing.status === 'pending').slice(0, 3).map((listing) => (
              <div key={listing.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{listing.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{listing.sellerTeam} · {listing.event}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-medium text-primary-800">Review</span>
              </div>
            ))}
            {pendingCount === 0 && <p className="py-4 text-sm text-gray-500">All submitted products have been reviewed.</p>}
          </div>
        </section>
      </div>

      <p className="mt-6 text-xs text-gray-500">Account records are shared through Cloudflare D1. Product, event, and report records on this dashboard are still browser-local demo data.</p>
    </div>
  );
};

export default Dashboard;
