import { getNewsArticles } from "@/app/lib/db";
import NewsTable from "@/app/admin/NewsTable";

export default async function AdminNewsPage() {
  const articles = await getNewsArticles();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">News</h1>
      <NewsTable initialArticles={articles} />
    </div>
  );
}
