import { getUsers } from "@/app/lib/db";
import UsersTable from "@/app/admin/UsersTable";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Users</h1>
      <UsersTable initialUsers={users} />
    </div>
  );
}
