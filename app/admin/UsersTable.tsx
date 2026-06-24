"use client";

import { useState, useActionState } from "react";
import type { User } from "@/app/lib/db";
import {
  createUserAction,
  resetPasswordAction,
  deleteUserAction,
  type UsersActionState,
} from "@/app/actions/users";

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [showAddForm, setShowAddForm] = useState(false);

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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Users</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setHighlightedId(null);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          {showAddForm ? "Cancel" : "Add User"}
        </button>
      </div>

      <p className="text-text-secondary">Total users: {users.length}</p>

      {showAddForm && (
        <form
          action={createAction}
          className="rounded-lg border border-primary/10 bg-card p-4 space-y-4"
        >
          <h3 className="font-semibold text-foreground">New User</h3>

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
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {createState?.errors?.name && (
                <p className="mt-1 text-sm text-red-500">{createState.errors.name[0]}</p>
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
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {createState?.errors?.email && (
                <p className="mt-1 text-sm text-red-500">{createState.errors.email[0]}</p>
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
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              {createState?.errors?.role && (
                <p className="mt-1 text-sm text-red-500">{createState.errors.role[0]}</p>
              )}
            </div>
          </div>

          {createState?.message && (
            <p
              className={`text-sm ${
                createState.generatedPassword ? "text-green-600" : "text-red-500"
              }`}
            >
              {createState.message}
            </p>
          )}

          {createState?.generatedPassword && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm font-semibold text-amber-800">
                Generated Password (save this now — it won&apos;t be shown again):
              </p>
              <code className="mt-1 block text-lg font-mono text-amber-900 select-all">
                {createState.generatedPassword}
              </code>
            </div>
          )}

          <button
            type="submit"
            disabled={createPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {createPending ? "Creating..." : "Create User"}
          </button>
        </form>
      )}

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

      {users.length === 0 ? (
        <p className="text-text-secondary">No users yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-primary/10">
                <th className="pb-3 font-semibold text-foreground">Name</th>
                <th className="pb-3 font-semibold text-foreground">Email</th>
                <th className="pb-3 font-semibold text-foreground">Role</th>
                <th className="pb-3 font-semibold text-foreground">Created</th>
                <th className="pb-3 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {users.map((user: User) => (
                <tr
                  key={user.id}
                  className={`hover:bg-primary/5 transition-colors ${
                    highlightedId === user.id ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-3 text-foreground font-medium">{user.name}</td>
                  <td className="py-3 text-text-secondary">{user.email}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 text-text-secondary">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <form action={resetAction} className="inline">
                        <input type="hidden" name="userId" value={user.id} />
                        <input type="hidden" name="source" value={user.source} />
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
                        <input type="hidden" name="source" value={user.source} />
                        <button
                          type="submit"
                          disabled={deletePending}
                          className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all hover:bg-red-200 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
