import { unsubscribeAction } from "@/app/actions/newsletter";

export const dynamic = "force-dynamic";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await unsubscribeAction(token || "");

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {result.success ? "Unsubscribed" : "Unsubscribe failed"}
        </h1>
        <p className="text-text-secondary">{result.message}</p>
        <a href="/newsletters" className="mt-6 inline-block text-primary hover:underline">
          Back to newsletters
        </a>
      </div>
    </div>
  );
}