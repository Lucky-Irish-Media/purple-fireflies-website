"use client";

import { useState, useActionState, useMemo } from "react";
import type { User } from "@/app/lib/db";
import {
  createUserAction,
  updateUserAction,
  resetPasswordAction,
  deleteUserAction,
  type UsersActionState,
} from "@/app/actions/users";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

function getRoleBadge(role: string) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role === "admin"
          ? "bg-purple-100 text-purple-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {role}
    </span>
  );
}

const columnHelper = createColumnHelper<User>();

function UserFormFields({ state, user }: {
  state: UsersActionState;
  user: User | null;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={user?.name || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user?.email || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            defaultValue={user?.role || "member"}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          {state?.errors?.role && (
            <p className="mt-1 text-sm text-red-500">{state.errors.role[0]}</p>
          )}
        </div>
      </div>

      {state?.message && (
        <p
          className={`text-sm ${
            state.generatedPassword ? "text-green-600" : "text-red-500"
          }`}
        >
          {state.message}
        </p>
      )}

      {state?.generatedPassword && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm font-semibold text-amber-800">
            Generated Password (save this now — it won&apos;t be shown again):
          </p>
          <code className="mt-1 block text-lg font-mono text-amber-900 select-all">
            {state.generatedPassword}
          </code>
        </div>
      )}
    </>
  );
}

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [createState, createAction, createPending] = useActionState<
    UsersActionState,
    FormData
  >(async (prev, formData) => {
    const result = await createUserAction(prev, formData);
    if (result?.users) {
      setUsers(result.users);
    }
    return result;
  }, undefined);

  const [updateState, updateAction, updatePending] = useActionState<
    UsersActionState,
    FormData
  >(async (prev, formData) => {
    const result = await updateUserAction(prev, formData);
    if (result?.users) {
      setUsers(result.users);
      setModalOpen(false);
    }
    return result;
  }, undefined);

  const [resetState, resetAction, resetPending] = useActionState<
    UsersActionState,
    FormData
  >(resetPasswordAction, undefined);

  const [deleteState, deleteAction, deletePending] = useActionState<
    UsersActionState,
    FormData
  >(async (prev, formData) => {
    const result = await deleteUserAction(prev, formData);
    if (result?.users) {
      setUsers(result.users);
    }
    return result;
  }, undefined);

  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.name, {
      id: "name",
      header: "Name",
      cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.email, {
      id: "email",
      header: "Email",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.role, {
      id: "role",
      header: "Role",
      cell: (info) => getRoleBadge(info.getValue()),
      filterFn: filterFns.equals,
    }),
    columnHelper.accessor((row) => row.created_at, {
      id: "created_at",
      header: "Created",
      cell: (info) => <span className="text-text-secondary">{new Date(info.getValue()).toLocaleDateString()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const user = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingUser(user);
                setModalOpen(true);
              }}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Edit
            </button>

            <form action={resetAction} className="inline">
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                disabled={resetPending}
                className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 transition-all hover:bg-amber-200 disabled:opacity-50"
              >
                Reset Password
              </button>
            </form>

            <form
              action={deleteAction}
              className="inline"
              onSubmit={(e) => {
                if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                disabled={deletePending}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all hover:bg-red-200 disabled:opacity-50"
              >
                Delete
              </button>
            </form>
          </div>
        );
      },
    }),
  ] as const, []);

  const typedColumns = columns as unknown as ColumnDef<User, unknown>[];

  const formState = editingUser ? updateState : createState;
  const formPending = editingUser ? updatePending : createPending;
  const formAction = editingUser ? updateAction : createAction;

  function handleCreateAddForm() {
    setEditingUser(null);
    setModalOpen(true);
    setHighlightedId(null);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingUser(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Users</h2>
        <button
          onClick={handleCreateAddForm}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add User
        </button>
      </div>

      <p className="text-text-secondary">Total users: {users.length}</p>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={editingUser ? "Edit User" : "New User"}
      >
        <form action={formAction} className="space-y-4" onSubmit={() => {
          if (!editingUser) return;
        }}>
          {editingUser && <input type="hidden" name="id" value={editingUser.id} />}

          <UserFormFields state={formState} user={editingUser} />

          {!editingUser && (
            <p className="text-sm text-text-secondary">
              A random password will be generated for the new user. Save it — it won&apos;t be shown again.
            </p>
          )}

          <button
            type="submit"
            disabled={formPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {formPending
              ? (editingUser ? "Saving..." : "Creating...")
              : (editingUser ? "Save Changes" : "Create User")}
          </button>
        </form>
      </Modal>

      {deleteState?.message && (
        <p
          className={`text-sm ${
            deleteState.message.includes("successfully") ? "text-green-600" : "text-red-500"
          }`}
        >
          {deleteState.message}
        </p>
      )}

      {resetState?.generatedPassword && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm font-semibold text-amber-800">
            Password reset successfully. New password (save this now — it won&apos;t be shown again):
          </p>
          <code className="mt-1 block text-lg font-mono text-amber-900 select-all">
            {resetState.generatedPassword}
          </code>
        </div>
      )}

      {resetState?.message && !resetState?.generatedPassword && (
        <p className="text-sm text-green-600">{resetState.message}</p>
      )}

      <DataTable
        data={users}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        pageSize={15}
      />
    </section>
  );
}
