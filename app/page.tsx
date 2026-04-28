export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-zinc-900">
      <main className="flex flex-col items-center gap-8 px-4 py-32 text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Purple Fireflies
        </h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Our mission is to foster an inclusive community where everyone feels safe, respected, and empowered to thrive. We embrace the diversity that strengthens us and work collaboratively with grassroots leaders to inspire action, inform our neighbors, and create meaningful, lasting change.
        </p>
      </main>
    </div>
  );
}
