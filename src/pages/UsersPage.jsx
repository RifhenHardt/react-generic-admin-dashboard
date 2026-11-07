import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '../components/common/StatusBadge';

async function fetchUsers() {
  const response = await fetch('/api/moderator/users', { credentials: 'same-origin' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not load accounts.');
  return data.users;
}

async function setUserStatus({ id, status }) {
  const response = await fetch(`/api/moderator/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not update this account.');
  return data.user;
}

async function deleteUser(id) {
  const response = await fetch(`/api/moderator/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not delete this account.');
  return data;
}

const UsersPage = () => {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, error } = useQuery({ queryKey: ['account-users'], queryFn: fetchUsers });
  const statusMutation = useMutation({
    mutationFn: setUserStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account-users'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account-users'] }),
  });

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Student & Seller Accounts</h1>
        <p className="mt-2 text-sm text-gray-600">Verify or suspend sellers, and permanently delete student or seller accounts. Admin accounts are protected.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}
      {statusMutation.error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{statusMutation.error.message}</p>}
      {deleteMutation.error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteMutation.error.message}</p>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Member', 'Type', 'Vendor / project team', 'Joined', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 sm:px-6">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">Loading accounts…</td></tr>}
              {!isLoading && users.map((user) => {
                const nextStatus = user.status === 'active' ? 'suspended' : 'active';
                return (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm capitalize text-gray-700 sm:px-6">{user.role}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 sm:px-6">{user.team_name || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 sm:px-6">{String(user.created_at || '').slice(0, 10)}</td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6"><StatusBadge status={user.status} /></td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      {user.role === 'admin' ? (
                        <span className="text-xs text-gray-500">Protected admin account</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={statusMutation.isPending || deleteMutation.isPending}
                            onClick={() => statusMutation.mutate({ id: user.id, status: nextStatus })}
                            className={`rounded-md px-3 py-2 text-xs font-semibold disabled:opacity-50 ${nextStatus === 'suspended' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-primary-50 text-primary-800 hover:bg-primary-100'}`}
                          >
                            {user.status === 'pending verification' ? 'Verify account' : nextStatus === 'active' ? 'Reactivate' : 'Suspend'}
                          </button>
                          <button
                            type="button"
                            disabled={statusMutation.isPending || deleteMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Permanently delete ${user.name} (${user.email})? They will lose account access, and account-linked communication history may be removed.`)) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                            className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!isLoading && users.length === 0 && <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">No accounts have registered yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
