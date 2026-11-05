// src/components/GenericManagementPage.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from './common/PageHeader';
import SearchBar from './common/SearchBar';
import DataTable from './common/DataTable';
import Pagination from './common/Pagination';
import GenericModal from './common/GenericModal';
import { mockApi } from '../services/mockApi';

const GenericManagementPage = ({ config }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const queryClient = useQueryClient();

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: [config.entityName, { search, page, pageSize }],
    queryFn: () => mockApi.getAll(config.entityName, { search, page, pageSize }),
    keepPreviousData: true,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (newData) => mockApi.create(config.entityName, newData),
    onSuccess: () => {
      queryClient.invalidateQueries([config.entityName]);
      setIsModalOpen(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => mockApi.update(config.entityName, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([config.entityName]);
      setIsModalOpen(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => mockApi.delete(config.entityName, id),
    onSuccess: () => {
      queryClient.invalidateQueries([config.entityName]);
    },
  });

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name || item.title}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleSubmit = (formData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Build actions with handlers
  const tableActions = config.tableActions
    ? config.tableActions({
        onEdit: handleEdit,
        onDelete: handleDelete,
      })
    : null;

  // Build header actions
  const headerActions = config.actions
    ? config.actions.map(action => ({
        ...action,
        onClick: action.onClick || handleCreate,
      }))
    : [];

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <PageHeader title={config.title} actions={headerActions} />

      <SearchBar
        placeholder={config.searchPlaceholder}
        value={search}
        onChange={setSearch}
      />

      <DataTable
        columns={config.columns}
        data={data?.items || []}
        isLoading={isLoading}
        actions={tableActions}
      />

      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {isModalOpen && config.formFields && (
        <GenericModal
          title={selectedItem ? `Edit ${config.entityName}` : `Create ${config.entityName}`}
          fields={config.formFields}
          initialData={selectedItem}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default GenericManagementPage;
